-- ====================================================================================
-- AI Billing & Leakage Recovery System - MVP Schema (Supabase / Postgres)
-- ====================================================================================

-- 1. Customers Table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Subscriptions Table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    stripe_sub_id VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL, -- active, past_due, canceled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Invoices Table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    stripe_invoice_id VARCHAR(255) UNIQUE NOT NULL,
    amount_due INTEGER NOT NULL, -- in cents
    status VARCHAR(50) NOT NULL, -- open, paid, void
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Failed Payments Table
CREATE TABLE failed_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- in cents
    error_code VARCHAR(255), -- e.g., insufficient_funds, expired_card
    status VARCHAR(50) DEFAULT 'unresolved', -- unresolved, recovered
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Recovery Attempts Table
CREATE TABLE recovery_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    failed_payment_id UUID REFERENCES failed_payments(id) ON DELETE CASCADE,
    ai_generated_email_body TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'sent',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Recovered Revenue Table
CREATE TABLE recovered_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    failed_payment_id UUID REFERENCES failed_payments(id) ON DELETE CASCADE,
    amount_recovered INTEGER NOT NULL, -- in cents
    recovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_customers_stripe_id ON customers(stripe_customer_id);
CREATE INDEX idx_invoices_stripe_id ON invoices(stripe_invoice_id);
CREATE INDEX idx_failed_payments_status ON failed_payments(status);
