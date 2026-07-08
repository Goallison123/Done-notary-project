/*
# E-Notary Rwanda - Core Schema

This migration creates the foundational database structure for the E-Notary Rwanda
platform, a digital client check-in and compliance system for Rwandan notary offices.

## Overview
The platform enables notaries to:
1. Create unique, time-limited tokens for client check-ins via QR code/SMS
2. Capture client details, service types, and digital signatures
3. Maintain a real-time waiting queue
4. Generate MINIJUST-compliant audit reports
5. Maintain tamper-proof logs for legal compliance

## Tables Created

### 1. `organizations`
- Private notary offices/law firms registered in the system
- `id` (uuid, PK) - Unique identifier
- `name` (text) - Office name (e.g., "Me. Keza Law Firm")
- `license_number` (text) - MINIJUST notary license number
- `phone` (text) - Office contact phone
- `email` (text) - Office email
- `address` (text) - Physical address
- `province` (text) - Rwandan province
- `district` (text) - Rwandan district
- `sector` (text) - Rwandan sector
- `is_active` (boolean) - Active status
- `created_at`, `updated_at` (timestamps)

### 2. `user_profiles`
- Staff members (receptionists, notaries) belonging to organizations
- `id` (uuid, PK) - References auth.users
- `organization_id` (uuid, FK) - Belongs to which office
- `name` (text) - Full name
- `role` (text) - 'owner', 'administrator', 'receptionist', 'notary'
- `phone` (text) - Staff phone
- `is_active` (boolean) - Employment status
- `created_at`, `updated_at` (timestamps)

### 3. `service_types`
- Standardized Rwandan notary service categories (pre-populated)
- `id` (uuid, PK)
- `name` (text) - e.g., "Land Transfer", "Power of Attorney"
- `name_kinyarwanda` (text) - Local language name
- `code` (text) - Short code for reports
- `description` (text)
- `is_active` (boolean)
- `sort_order` (integer) - Display order
- `created_at` (timestamp)

### 4. `rwanda_locations`
- Administrative divisions for Rwanda (pre-populated)
- `id` (uuid, PK)
- `province` (text)
- `district` (text)
- `sector` (text)
- `cell` (text, nullable)
- `village` (text, nullable)

### 5. `clients`
- People who have checked in at notary offices
- `id` (uuid, PK)
- `organization_id` (uuid, FK) - Which office they visited
- `full_name` (text) - Legal name
- `phone` (text) - Primary contact
- `email` (text, nullable) - Email if provided
- `national_id` (text, nullable) - 16-digit Rwandan ID
- `passport_number` (text, nullable) - For foreign clients
- `date_of_birth` (date, nullable)
- `gender` (text, nullable)
- `province` (text, nullable)
- `district` (text, nullable)
- `sector` (text, nullable)
- `address` (text, nullable) - Full address
- `is_first_visit` (boolean) - Tracking returning clients
- `created_at`, `updated_at` (timestamps)

### 6. `check_in_tokens`
- Secure, time-limited tokens for client sessions
- `id` (uuid, PK)
- `organization_id` (uuid, FK)
- `created_by` (uuid, FK to user_profiles) - Who generated it
- `client_name` (text) - Name entered by receptionist
- `client_phone` (text) - Phone entered by receptionist
- `token` (text, unique) - Cryptographic token (URL-safe)
- `expires_at` (timestamptz) - 10-minute expiration
- `is_used` (boolean) - Prevents reuse
- `status` (text) - 'pending', 'active', 'completed', 'expired', 'cancelled'
- `qr_code_svg` (text, nullable) - Generated QR code SVG
- `created_at` (timestamp)

### 7. `check_ins`
- Main transaction records for client visits
- `id` (uuid, PK)
- `organization_id` (uuid, FK)
- `token_id` (uuid, FK) - Links to generation token
- `client_id` (uuid, FK, nullable) - Links after completion
- `sequence_number` (integer) - Daily sequential number (#041, #042, etc.)
- `client_name` (text) - From token
- `client_phone` (text) - From token
- `national_id` (text, nullable) - Captured by client
- `passport_number` (text, nullable) - For foreign clients
- `service_type_id` (uuid, FK) - What service they need
- `document_reference` (text, nullable) - UPI, registration #, etc.
- `client_capacity` (text) - 'individual', 'company_representative', 'legal_proxy'
- `signature_svg` (text, nullable) - Digital signature as SVG path
- `signature_hash` (text, nullable) - Cryptographic hash of signature
- `ip_address` (text, nullable) - Client IP at submission
- `user_agent` (text, nullable) - Browser info
- `confirmation_text` (boolean) - Client confirmed details match ID
- `status` (text) - 'in_progress', 'submitted', 'signed', 'ready', 'called', 'archived'
- `check_in_at` (timestamptz) - When client opened form
- `submitted_at` (timestamptz) - When client submitted
- `signed_at` (timestamptz) - When signature captured
- `called_at` (timestamptz) - When notary called them
- `archived_at` (timestamptz) - When archived to permanent log
- `called_by` (uuid, FK, nullable) - Which staff called them
- `record_hash` (text, nullable) - Tamper-proof hash of entire record
- `created_at`, `updated_at` (timestamps)

### 8. `audit_logs`
- Immutable compliance trail for MINIJUST inspections
- `id` (uuid, PK)
- `organization_id` (uuid, FK)
- `check_in_id` (uuid, FK, nullable)
- `action` (text) - 'token_created', 'token_scanned', 'form_started', 'form_submitted', 'signature_captured', 'client_called', 'record_archived', 'export_generated'
- `entity_type` (text) - 'token', 'check_in', 'client', 'export'
- `entity_id` (uuid, nullable)
- `user_id` (uuid, FK, nullable) - Staff who performed action
- `user_name` (text) - Staff name at time of action
- `client_name` (text, nullable) - Client involved
- `details` (jsonb, nullable) - Additional context
- `ip_address` (text, nullable)
- `created_at` (timestamp) - IMMUTABLE

### 9. `daily_sequences`
- Counter for daily check-in sequence numbers per organization
- `id` (uuid, PK)
- `organization_id` (uuid, FK)
- `date` (date)
- `last_sequence` (integer)

## Security (RLS Policies)
- All tables have RLS enabled
- Policies scope data by organization membership
- Staff can only access their organization's data
- Audit logs are append-only (no UPDATE/DELETE)
- Tokens are organization-scoped

## Indexes
- Optimized for common queries: by token, by organization, by date, by status
- Composite indexes for queue operations
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  license_number text UNIQUE,
  phone text,
  email text,
  address text,
  province text,
  district text,
  sector text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- 2. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'receptionist' CHECK (role IN ('owner', 'administrator', 'notary', 'receptionist')),
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. SERVICE TYPES TABLE (Pre-populated for Rwanda)
CREATE TABLE IF NOT EXISTS service_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  name_kinyarwanda text,
  code text NOT NULL UNIQUE,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;

-- 4. RWANDA LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS rwanda_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  province text NOT NULL,
  district text NOT NULL,
  sector text NOT NULL,
  cell text,
  village text
);

ALTER TABLE rwanda_locations ENABLE ROW LEVEL SECURITY;

-- 5. CLIENTS TABLE
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  national_id text,
  passport_number text,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  province text,
  district text,
  sector text,
  address text,
  is_first_visit boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 6. CHECK-IN TOKENS TABLE
CREATE TABLE IF NOT EXISTS check_in_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  is_used boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'expired', 'cancelled')),
  qr_code_svg text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE check_in_tokens ENABLE ROW LEVEL SECURITY;

-- 7. CHECK-INS TABLE (Main transaction records)
CREATE TABLE IF NOT EXISTS check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  token_id uuid NOT NULL REFERENCES check_in_tokens(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  sequence_number integer NOT NULL,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  national_id text,
  passport_number text,
  service_type_id uuid REFERENCES service_types(id) ON DELETE SET NULL,
  document_reference text,
  client_capacity text DEFAULT 'individual' CHECK (client_capacity IN ('individual', 'company_representative', 'legal_proxy')),
  signature_svg text,
  signature_hash text,
  ip_address text,
  user_agent text,
  confirmation_text boolean DEFAULT false,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'signed', 'ready', 'called', 'archived')),
  check_in_at timestamptz,
  submitted_at timestamptz,
  signed_at timestamptz,
  called_at timestamptz,
  archived_at timestamptz,
  called_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  record_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- 8. AUDIT LOGS TABLE (Immutable compliance trail)
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  check_in_id uuid REFERENCES check_ins(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  user_name text,
  client_name text,
  details jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 9. DAILY SEQUENCES TABLE
CREATE TABLE IF NOT EXISTS daily_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date date NOT NULL,
  last_sequence integer NOT NULL DEFAULT 0,
  UNIQUE(organization_id, date)
);

ALTER TABLE daily_sequences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Organizations: Users can only see their own organization
DROP POLICY IF EXISTS "users_view_own_org" ON organizations;
CREATE POLICY "users_view_own_org" ON organizations FOR SELECT
  TO authenticated
  USING (id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "users_update_own_org" ON organizations;
CREATE POLICY "users_update_own_org" ON organizations FOR UPDATE
  TO authenticated
  USING (id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid() AND role IN ('owner', 'administrator')))
  WITH CHECK (id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid() AND role IN ('owner', 'administrator')));

-- User Profiles: Scoped to organization
DROP POLICY IF EXISTS "users_view_org_profiles" ON user_profiles;
CREATE POLICY "users_view_org_profiles" ON user_profiles FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "users_insert_org_profiles" ON user_profiles;
CREATE POLICY "users_insert_org_profiles" ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid() AND role IN ('owner', 'administrator')));

DROP POLICY IF EXISTS "users_update_org_profiles" ON user_profiles;
CREATE POLICY "users_update_org_profiles" ON user_profiles FOR UPDATE
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid() AND role IN ('owner', 'administrator')))
  WITH CHECK (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid() AND role IN ('owner', 'administrator')));

-- Service Types: Public read for all authenticated
DROP POLICY IF EXISTS "authenticated_read_service_types" ON service_types;
CREATE POLICY "authenticated_read_service_types" ON service_types FOR SELECT
  TO authenticated USING (true);

-- Rwanda Locations: Public read
DROP POLICY IF EXISTS "authenticated_read_locations" ON rwanda_locations;
CREATE POLICY "authenticated_read_locations" ON rwanda_locations FOR SELECT
  TO authenticated USING (true);

-- Clients: Organization-scoped
DROP POLICY IF EXISTS "org_members_read_clients" ON clients;
CREATE POLICY "org_members_read_clients" ON clients FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "org_members_insert_clients" ON clients;
CREATE POLICY "org_members_insert_clients" ON clients FOR INSERT
  TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "org_members_update_clients" ON clients;
CREATE POLICY "org_members_update_clients" ON clients FOR UPDATE
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

-- Check-in Tokens: Organization-scoped
DROP POLICY IF EXISTS "org_members_read_tokens" ON check_in_tokens;
CREATE POLICY "org_members_read_tokens" ON check_in_tokens FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "org_members_insert_tokens" ON check_in_tokens;
CREATE POLICY "org_members_insert_tokens" ON check_in_tokens FOR INSERT
  TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "org_members_update_tokens" ON check_in_tokens;
CREATE POLICY "org_members_update_tokens" ON check_in_tokens FOR UPDATE
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

-- Check-ins: Organization-scoped
DROP POLICY IF EXISTS "org_members_read_checkins" ON check_ins;
CREATE POLICY "org_members_read_checkins" ON check_ins FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "org_members_insert_checkins" ON check_ins;
CREATE POLICY "org_members_insert_checkins" ON check_ins FOR INSERT
  TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "org_members_update_checkins" ON check_ins;
CREATE POLICY "org_members_update_checkins" ON check_ins FOR UPDATE
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

-- Audit Logs: Read and Insert only (no update/delete for compliance)
DROP POLICY IF EXISTS "org_members_read_audit" ON audit_logs;
CREATE POLICY "org_members_read_audit" ON audit_logs FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "org_members_insert_audit" ON audit_logs;
CREATE POLICY "org_members_insert_audit" ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

-- Daily Sequences: Organization-scoped
DROP POLICY IF EXISTS "org_members_all_sequences" ON daily_sequences;
CREATE POLICY "org_members_all_sequences" ON daily_sequences FOR ALL
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_org ON user_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_clients_org ON clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_national_id ON clients(national_id);
CREATE INDEX IF NOT EXISTS idx_tokens_token ON check_in_tokens(token);
CREATE INDEX IF NOT EXISTS idx_tokens_org_status ON check_in_tokens(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_tokens_expires ON check_in_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_checkins_org_status ON check_ins(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_checkins_org_date ON check_ins(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_token ON check_ins(token_id);
CREATE INDEX IF NOT EXISTS idx_audit_org_date ON audit_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_checkin ON audit_logs(check_in_id);
CREATE INDEX IF NOT EXISTS idx_sequences_org_date ON daily_sequences(organization_id, date);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to generate secure token
CREATE OR REPLACE FUNCTION generate_secure_token()
RETURNS text AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to get next sequence number
CREATE OR REPLACE FUNCTION get_next_sequence(p_org_id uuid, p_date date DEFAULT CURRENT_DATE)
RETURNS integer AS $$
DECLARE
  v_sequence integer;
BEGIN
  INSERT INTO daily_sequences (organization_id, date, last_sequence)
  VALUES (p_org_id, p_date, 1)
  ON CONFLICT (organization_id, date)
  DO UPDATE SET last_sequence = daily_sequences.last_sequence + 1
  RETURNING last_sequence INTO v_sequence;
  RETURN v_sequence;
END;
$$ LANGUAGE plpgsql;

-- Function to compute record hash (for tamper-proofing)
CREATE OR REPLACE FUNCTION compute_record_hash()
RETURNS trigger AS $$
DECLARE
  hash_input text;
BEGIN
  hash_input := NEW.id::text || 
                NEW.organization_id::text ||
                NEW.client_name ||
                NEW.client_phone ||
                NEW.national_id ||
                NEW.service_type_id::text ||
                NEW.signature_hash ||
                NEW.submitted_at::text ||
                NEW.signed_at::text;
  NEW.record_hash := encode(sha256(hash_input::bytea), 'hex');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for record hashing
DROP TRIGGER IF EXISTS trigger_compute_record_hash ON check_ins;
CREATE TRIGGER trigger_compute_record_hash
  BEFORE INSERT OR UPDATE ON check_ins
  FOR EACH ROW
  EXECUTE FUNCTION compute_record_hash();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS trigger_organizations_updated_at ON organizations;
CREATE TRIGGER trigger_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER trigger_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_clients_updated_at ON clients;
CREATE TRIGGER trigger_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_check_ins_updated_at ON check_ins;
CREATE TRIGGER trigger_check_ins_updated_at
  BEFORE UPDATE ON check_ins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();