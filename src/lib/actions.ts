'use server';

import { supabaseAdmin } from './supabase';
import { triggerRecoveryWorkflow } from './recovery';
import { revalidatePath } from 'next/cache';

export async function simulateFailedPayment(formData: {
    name: string;
    email: string;
    amount: number;
    reason: string;
    company?: string;
    country?: string;
    plan?: string;
    tone?: string;
}) {
    try {
        // 1. Get or Create Customer
        let { data: customer, error: custError } = await supabaseAdmin
            .from('customers')
            .select('id')
            .eq('email', formData.email)
            .maybeSingle();

        if (!customer && !custError) {
            // TRY 1: Full insert with metadata columns
            const { data: newCustomer, error: createError } = await supabaseAdmin
                .from('customers')
                .insert({
                    stripe_customer_id: `test_cus_${Date.now()}`,
                    name: formData.name,
                    email: formData.email,
                    company_name: formData.company,
                    country: formData.country,
                })
                .select('id')
                .single();

            if (createError?.code === 'PGRST204' || createError?.message?.includes('column')) {
                // FALLBACK: metadata columns don't exist yet
                console.warn('Falling back to basic customer creation (missing metadata columns)');
                const { data: fallbackCustomer, error: fallbackError } = await supabaseAdmin
                    .from('customers')
                    .insert({
                        stripe_customer_id: `test_cus_${Date.now()}`,
                        name: formData.name,
                        email: formData.email,
                    })
                    .select('id')
                    .single();

                customer = fallbackCustomer;
                custError = fallbackError;
            } else {
                customer = newCustomer;
                custError = createError;
            }
        }

        if (custError || !customer) {
            console.error('Customer Strategy Error:', custError);
            throw new Error('Failed to identify or create test customer');
        }

        // 2. Create dummy Invoice
        const { data: invoice, error: invError } = await supabaseAdmin
            .from('invoices')
            .insert({
                stripe_invoice_id: `test_inv_${Date.now()}`,
                customer_id: customer.id,
                amount_due: formData.amount,
                status: 'open',
            })
            .select('id')
            .single();

        if (invError || !invoice) throw new Error('Failed to create test invoice');

        // 3. Optional: Update/Create subscription for plan filtering
        try {
            await supabaseAdmin
                .from('subscriptions')
                .upsert({
                    customer_id: customer.id,
                    stripe_sub_id: `test_sub_${Date.now()}`,
                    status: 'active',
                    plan_level: formData.plan || 'Basic',
                    monthly_revenue: formData.amount
                }, { onConflict: 'customer_id' });
        } catch (subErr) {
            console.warn('Subscription upsert skipped (table may not exist):', subErr);
        }

        // 4. Create Failed Payment Record
        const { data: failedPayment, error: failError } = await supabaseAdmin
            .from('failed_payments')
            .insert({
                invoice_id: invoice.id,
                customer_id: customer.id,
                amount: formData.amount,
                error_code: formData.reason,
                status: 'unresolved'
            })
            .select('id')
            .single();

        if (failError || !failedPayment) throw new Error('Failed to create failed payment record');

        // 5. Trigger AI Recovery Workflow (with tone)
        const recoveryResult = await triggerRecoveryWorkflow({
            failedPaymentId: failedPayment.id,
            customerName: formData.name,
            customerEmail: formData.email,
            amountDue: formData.amount,
            declineCode: formData.reason,
            hostedInvoiceUrl: 'https://billing.stripe.com/test/invoice/hosted_url',
            tone: formData.tone || 'friendly',
        });

        revalidatePath('/dashboard');
        return { success: true, emailPreview: recoveryResult?.emailBody || null };
    } catch (error: any) {
        console.error('Simulation Error:', error);
        return { success: false, error: error.message };
    }
}

export async function triggerManualRecovery(failedPaymentId: string) {
    try {
        const { data: failedPayment, error } = await supabaseAdmin
            .from('failed_payments')
            .select(`
                id,
                amount,
                error_code,
                customers (name, email),
                invoices (hosted_invoice_url)
            `)
            .eq('id', failedPaymentId)
            .single();

        if (error || !failedPayment) throw new Error('Payment not found');

        const payment = failedPayment as any;

        await triggerRecoveryWorkflow({
            failedPaymentId: payment.id,
            customerName: payment.customers.name,
            customerEmail: payment.customers.email,
            amountDue: payment.amount,
            declineCode: payment.error_code,
            hostedInvoiceUrl: payment.invoices?.hosted_invoice_url || '',
            tone: 'friendly',
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Manual Recovery Error:', error);
        return { success: false, error: error.message };
    }
}
