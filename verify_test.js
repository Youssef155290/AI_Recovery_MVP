require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyTestRun() {
    console.log('🔍 Checking for recent test runs...\n');

    const { data: recentFailure, error: failError } = await supabase
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
            console.log('ℹ️ No failed payments found yet. Please go to /dashboard and use the sandbox!');
        } else {
            console.error('❌ Error fetching failures:', failError.message);
        }
        return;
    }

    console.log('✅ Found a test failure:');
    console.log(`- Customer: ${recentFailure.customers.name} (${recentFailure.customers.email})`);
    console.log(`- Amount: $${recentFailure.amount / 100}`);
    console.log(`- Reason: ${recentFailure.error_code}`);
    console.log(`- Date: ${recentFailure.created_at}\n`);

    const { data: attempt, error: attemptError } = await supabase
        .from('recovery_attempts')
        .select('*')
        .eq('failed_payment_id', recentFailure.id)
        .single();

    if (attemptError) {
        console.log('⚠️ No AI recovery attempt found for this failure yet.');
    } else {
        console.log('✅ AI Recovery Attempt logged:');
        console.log(`- Status: ${attempt.status}`);
        console.log(`- Sent At: ${attempt.sent_at}`);
        console.log('- Email Preview:');
        console.log(`  "${attempt.ai_generated_email_body.substring(0, 150)}..."`);
    }
}

verifyTestRun();
