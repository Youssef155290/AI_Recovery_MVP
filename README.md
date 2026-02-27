# AI Billing & Leakage Recovery MVP - Local Testing Guide

Follow these instructions to spin up the local Next.js environment and test the Stripe webhooks alongside Supabase.

## 1. Install Dependencies
Run the following from the root directory:
```bash
npm install
```

*(Note: We use Next.js, React, Tailwind CSS, Supabase JS, Stripe, OpenAI, and Resend in this project.)*

## 2. Set Up the Database (Supabase)
1. You can either use a remote Supabase project (at [supabase.com](https://supabase.com)) or run it locally using Docker (`supabase init` -> `supabase start`).
2. Run the SQL script located in `schema.sql` inside your Supabase SQL Editor. This sets up the core tables for the MVP.

### Local Setup & Testing Guide

This MVP is designed to be tested locally using Stripe Test Mode and the Stripe CLI.

### 1. Prerequisite Environment
Create a `.env.local` file (based on `.env.example`) with the following keys:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (for server-side DB access).
- `STRIPE_SECRET_KEY`: Stripe Test Mode Secret Key (`sk_test_...`).
- `STRIPE_WEBHOOK_SECRET`: Obtained after running Stripe CLI (see below).
- `GEMINI_API_KEY`: Google Gemini API Key.
- `RESEND_API_KEY`: Resend API Key for sending emails.

### 2. Database Initialization
Run the `schema.sql` script in your Supabase SQL Editor to create the necessary tables and relationships.

### 3. Local Execution
```bash
npm install
npm run dev
```
The app will be running at [http://localhost:3000](http://localhost:3000).

### 4. Testing with Stripe CLI
To simulate payment events without a real Stripe account:

1. **Install Stripe CLI**: Follow [Stripe's guide](https://stripe.com/docs/stripe-cli).
2. **Login**: `stripe login`
3. **Forward Webhooks**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   *Copy the `whsec_...` secret from the output and add it to `STRIPE_WEBHOOK_SECRET` in `.env.local`.*

4. **Trigger a Failed Payment**:
   In a new terminal window:
   ```bash
   stripe trigger invoice.payment_failed
   ```
   *This will simulate a failed subscription payment. Check the `/dashboard` or Supabase logs to see the AI recovery workflow in action.*

5. **Trigger a Successful Payment**:
   ```bash
   stripe trigger invoice.payment_succeeded
   ```
   *This marks the recovery as successful and logs revenue.*

### 5. Dashboard
View all recovery actions and stats at [/dashboard](http://localhost:3000/dashboard).

## 3. Configure Environment Variables
1. Duplicate `.env.example` and rename it to `.env.local`.
2. Grab your Supabase Project URL and **Service Role Key** (found in Project Settings -> API) and add them.
3. Add your OpenAI API key and Resend API key (if you have one, or leave it blank to simulate sending).
4. Get your Stripe Secret Key (Test Mode) from the Stripe Dashboard.

## 4. Run the Next.js Server
```bash
npm run dev
```
The server will start at `http://localhost:3000`.

## 5. Test Stripe Webhooks Locally
To simulate payment failures and trigger our backend API routes, you need the **Stripe CLI**.

1. Download and authenticate the Stripe CLI:
```bash
stripe login
```
2. Start forwarding local events to your Next.js API route:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
3. *Important:* Copy the webhook signing secret (`whsec_...`) printed in the console and paste it into `.env.local` as `STRIPE_WEBHOOK_SECRET`.

4. Trigger a simulated failed payment using the CLI in another terminal tab:
```bash
stripe trigger invoice.payment_failed
```

## 6. Verify the Workflow
If everything is wired up correctly:
1. The terminal running `npm run dev` should show the webhook successfully received.
2. The Database (`invoices`, `failed_payments`) will populate with the new failure.
3. The server will call OpenAI to craft the recovery email and attempt to send it via Resend (or simulate if no key is provided). Check the `recovery_attempts` table inside Supabase.
