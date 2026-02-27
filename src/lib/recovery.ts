import OpenAI from 'openai';
import { supabaseAdmin } from './supabase';
import { sendEmail } from './email';

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
        "X-Title": "AI Billing Recovery MVP",
    }
});

export type RecoveryInput = {
    failedPaymentId: string;
    customerName: string;
    customerEmail: string;
    amountDue: number; // in cents
    declineCode: string;
    hostedInvoiceUrl: string;
    tone?: string;
};

const TONE_INSTRUCTIONS: Record<string, string> = {
    friendly: 'Use a warm, empathetic, and slightly casual tone. Show genuine concern for the customer. Use encouraging language.',
    formal: 'Use a professional, corporate tone. Be courteous but businesslike. Reference account details precisely.',
    urgent: 'Use a time-sensitive, direct tone. Emphasize the importance of immediate action to prevent service disruption. Be clear but not aggressive.',
};

const DECLINE_EXPLANATIONS: Record<string, string> = {
    insufficient_funds: 'The payment failed because the card on file did not have sufficient funds.',
    expired_card: 'The card on file has expired and needs to be replaced with an updated payment method.',
    bank_declined: 'The issuing bank declined the transaction. The customer may need to contact their bank or use a different card.',
    fraudulent: 'The payment was flagged by the fraud detection system. The customer should verify their identity and payment details.',
    processing_error: 'A temporary processing error occurred. The customer should retry or use an alternative payment method.',
};

export async function triggerRecoveryWorkflow(input: RecoveryInput) {
    const amountFormatted = (input.amountDue / 100).toFixed(2);
    const tone = input.tone || 'friendly';

    console.log(`Initiating recovery workflow for ${input.customerEmail} - Amount: $${amountFormatted} - Tone: ${tone}`);

    // 1. Generate Personalized AI Email using OpenRouter
    let generatedEmailBody = '';
    try {
        const toneInstruction = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.friendly;
        const declineContext = DECLINE_EXPLANATIONS[input.declineCode] || `The payment was declined with reason: ${input.declineCode}`;

        const response = await openai.chat.completions.create({
            model: "openai/gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a professional customer success manager at a SaaS company specializing in subscription recovery. ${toneInstruction}`
                },
                {
                    role: "user",
                    content: `Write a personalized recovery email to a customer whose subscription payment failed.

Context:
- Customer Name: ${input.customerName}
- Amount Due: $${amountFormatted}
- Decline Reason: ${declineContext}
- Payment Update Link: ${input.hostedInvoiceUrl}

Requirements:
- Provide ONLY the email body (no "Subject:" prefix)
- Format with HTML (use <p>, <a>, <strong>, etc.)
- Be concise (3-4 paragraphs max)
- Include a clear call-to-action button/link to update payment
- Adapt the message to the specific decline reason
- Make it feel personal, not template-generated`
                }
            ],
        });

        generatedEmailBody = response.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('OpenRouter API Error:', error);
        // Fallback email
        generatedEmailBody = `<p>Hi ${input.customerName},</p>
<p>We noticed your recent payment of <strong>$${amountFormatted}</strong> couldn't be processed (Reason: ${input.declineCode}).</p>
<p>To keep your subscription active and avoid any interruption, please update your payment method at your earliest convenience:</p>
<p><a href="${input.hostedInvoiceUrl}" style="display:inline-block;padding:10px 24px;background-color:#4f46e5;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">Update Payment Method</a></p>
<p>If you have any questions, we're here to help.</p>
<p>Best regards,<br/>The Billing Team</p>`;
    }

    // 2. Log Recovery Attempt in Supabase
    await supabaseAdmin
        .from('recovery_attempts')
        .insert({
            failed_payment_id: input.failedPaymentId,
            ai_generated_email_body: generatedEmailBody,
            status: 'sending'
        });

    // 3. Send Email
    try {
        await sendEmail({
            to: input.customerEmail,
            subject: 'Action Required: Update your Payment Method',
            html: generatedEmailBody,
        });

        // Update status to sent
        await supabaseAdmin
            .from('recovery_attempts')
            .update({ status: 'sent' })
            .eq('failed_payment_id', input.failedPaymentId);

        console.log(`Recovery email successfully dispatched to ${input.customerEmail}`);
    } catch (error) {
        console.error('Email Dispatch Error:', error);
        await supabaseAdmin
            .from('recovery_attempts')
            .update({ status: 'failed' })
            .eq('failed_payment_id', input.failedPaymentId);
    }

    return { emailBody: generatedEmailBody };
}
