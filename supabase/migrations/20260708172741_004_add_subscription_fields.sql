/*
# Add Subscription and Payment Fields to Organizations

1. Changes to organizations table
- Add subscription_expires_at (timestamptz) - when the subscription ends
- Add trial_started_at (timestamptz) - when trial began
- Add account_status (text) - 'active', 'suspended', 'trial'
- Add momopay_merchant_code (text) - for MTN MoMo payments
- Add payment_phone (text) - WhatsApp contact for payment receipts

2. Notes
- Trial period is 14 days from signup
- Subscription costs 30,000 RWF/month
- Lockout happens automatically when subscription_expires_at < now()
*/

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS trial_started_at timestamptz,
ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'trial'
  CHECK (account_status IN ('trial', 'active', 'suspended', 'cancelled')),
ADD COLUMN IF NOT EXISTS momopay_merchant_code text,
ADD COLUMN IF NOT EXISTS payment_phone text,
ADD COLUMN IF NOT EXISTS payment_email text;

-- Create index for subscription status checks
CREATE INDEX IF NOT EXISTS idx_organizations_subscription 
ON organizations(account_status, subscription_expires_at);
