import { NextResponse } from 'next/server';
import Stripe from 'stripe';
// Using relative paths to fix "Module not found" errors in IDE
import { supabaseAdmin } from '../../../../lib/supabase';
import { triggerRecoveryWorkflow } from '../../../../lib/recovery';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // @ts-ignore
    apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    if (!webhookSecret) {
        console.error('Missing STRIPE_WEBHOOK_SECRET');
        return NextResponse.json({ error: 'Config Error' }, { status: 500 });
    }

    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'invoice.payment_failed':
                const failedInvoice = event.data.object as Stripe.Invoice;
                await handlePaymentFailed(failedInvoice);
                break;
            case 'invoice.payment_succeeded':
                const succeededInvoice = event.data.object as Stripe.Invoice;
                await handlePaymentSucceeded(succeededInvoice);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    } catch (error) {
        console.error('Error processing webhook event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    return NextResponse.json({ received: true }, { status: 200 });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    if (!invoice.customer || !invoice.payment_intent) return;

    const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id;

    const { data: customer, error: custFetchError } = await supabaseAdmin
        .from('customers')
        .select('id, name, email')
        .eq('stripe_customer_id', customerId)
        .single();

    if (custFetchError || !customer) {
        console.warn(`Customer not found for Stripe ID: ${customerId}`);
        return;
    }

    const { data: dbInvoice, error: invError } = await supabaseAdmin
        .from('invoices')
        .upsert({
            stripe_invoice_id: invoice.id,
            customer_id: customer.id,
            amount_due: invoice.amount_due,
            status: 'open',
        }, { onConflict: 'stripe_invoice_id' })
        .select('id')
        .single();

    if (invError || !dbInvoice) {
        console.error('Failed to upsert invoice:', invError);
        return;
    }

    const piId = typeof invoice.payment_intent === 'string' ? invoice.payment_intent : invoice.payment_intent.id;
    const paymentIntent = await stripe.paymentIntents.retrieve(piId);

    const declineCode = (paymentIntent.last_payment_error as any)?.decline_code || 'unknown_failure';

    const { data: failedPayment, error: failError } = await supabaseAdmin
        .from('failed_payments')
        .insert({
            invoice_id: dbInvoice.id,
            customer_id: customer.id,
            amount: invoice.amount_due,
            error_code: declineCode,
            status: 'unresolved'
        })
        .select('id')
        .single();

    if (failError || !failedPayment) {
        console.error('Failed to create failed payment record:', failError);
        return;
    }

    await triggerRecoveryWorkflow({
        failedPaymentId: failedPayment.id,
        customerName: customer.name || 'Valued Customer',
        customerEmail: customer.email,
        amountDue: invoice.amount_due,
        declineCode: declineCode,
        hostedInvoiceUrl: invoice.hosted_invoice_url || '',
    });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
    const { data: dbInvoice } = await supabaseAdmin
        .from('invoices')
        .select('id')
        .eq('stripe_invoice_id', invoice.id)
        .single();

    if (!dbInvoice) return;

    const { data: failedPayment } = await supabaseAdmin
        .from('failed_payments')
        .select('id, amount')
        .eq('invoice_id', dbInvoice.id)
        .eq('status', 'unresolved')
        .maybeSingle();

    if (failedPayment) {
        await supabaseAdmin
            .from('failed_payments')
            .update({ status: 'recovered', updated_at: new Date().toISOString() })
            .eq('id', failedPayment.id);

        await supabaseAdmin
            .from('recovered_revenue')
            .insert({
                failed_payment_id: failedPayment.id,
                amount_recovered: failedPayment.amount,
            });

        console.log(`Successfully logged recovered revenue for Invoice ${invoice.id}`);
    }
}
