import { Resend } from 'resend';

// NOTE: Add RESEND_API_KEY to your .env file
const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailInput {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: EmailInput) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is missing. Simulating email send:');
        console.log(`[EMAIL to: ${to}] ${subject}\n${html}\n`);
        return { id: 'simulated_email_id' };
    }

    const { data, error } = await resend.emails.send({
        from: 'AI Billing Recovery <onboarding@resend.dev>', // Update with your verified domain
        to: [to],
        subject,
        html,
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
