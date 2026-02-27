import 'dotenv/config';
import { supabaseAdmin } from './src/lib/supabase';

async function verifyTestRun() {
    console.log('🔍 Checking for recent test runs...\n');

    // 1. Check for most recent failed payment
    const { data: recentFailure, error: failError } = await supabaseAdmin
        .from('failed_payments')
        .select(`
            id,
            amount,
            error_code,
            created_at,
            customers (name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (failError) {
        if (failError.code === 'PGRST116') {
            console.log('ℹ️ No failed payments found yet. Please trigger one using the Sandbox on the dashboard.');
        } else {
            console.error('❌ Error fetching failures:', failError.message);
        }
        return;
    }

    const failure = recentFailure as any;
    console.log('✅ Found a test failure:');
    console.log(`- Customer: ${failure.customers.name} (${failure.customers.email})`);
    console.log(`- Amount: $${failure.amount / 100}`);
    console.log(`- Reason: ${failure.error_code}`);
    console.log(`- Date: ${failure.created_at}\n`);

    // 2. Check for AI Recovery Attempt
    const { data: attempt, error: attemptError } = await supabaseAdmin
        .from('recovery_attempts')
        .select('*')
        .eq('failed_payment_id', failure.id)
        .single();

    if (attemptError) {
        console.log('⚠️ No AI recovery attempt found for this failure yet.');
    } else {
        console.log('✅ AI Recovery Attempt found:');
        console.log(`- Status: ${attempt.status}`);
        console.log(`- Sent At: ${attempt.sent_at}`);
        console.log('- Email Preview (First 100 chars):');
        console.log(`  "${attempt.ai_generated_email_body.substring(0, 100)}..."`);
    }
}

verifyTestRun();
