/*
# DONE Platform - Schema Fixes & Enhancements
Fixes missing columns, RLS policies, and adds helper functions
*/

-- Add missing columns to organizations
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS logo_url text;

-- Make created_by nullable in check_in_tokens for receptionist workflow
ALTER TABLE check_in_tokens
  ALTER COLUMN created_by DROP NOT NULL;

-- Add location_id to check_ins if missing
ALTER TABLE check_ins
  ADD COLUMN IF NOT EXISTS location_province text,
  ADD COLUMN IF NOT EXISTS location_district text,
  ADD COLUMN IF NOT EXISTS location_sector text,
  ADD COLUMN IF NOT EXISTS purpose text;

-- Allow anonymous token verification (client scanning QR from their phone)
DROP POLICY IF EXISTS "anon_read_tokens" ON check_in_tokens;
CREATE POLICY "anon_read_tokens" ON check_in_tokens
  FOR SELECT TO anon, authenticated
  USING (true);

-- Allow anon to submit check-ins (client phone form submission)
DROP POLICY IF EXISTS "anon_insert_checkins" ON check_ins;
CREATE POLICY "anon_insert_checkins" ON check_ins
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Allow anon to update token status (mark as used)
DROP POLICY IF EXISTS "anon_update_tokens" ON check_in_tokens;
CREATE POLICY "anon_update_tokens" ON check_in_tokens
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anon to read service_types and locations (already public but ensure)
DROP POLICY IF EXISTS "public_service_types" ON service_types;
CREATE POLICY "public_service_types" ON service_types
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "public_locations" ON rwanda_locations;
CREATE POLICY "public_locations" ON rwanda_locations
  FOR SELECT TO anon, authenticated
  USING (true);

-- Allow authenticated users to update check_ins status (queue management)
DROP POLICY IF EXISTS "auth_update_checkins" ON check_ins;
CREATE POLICY "auth_update_checkins" ON check_ins
  FOR UPDATE TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ))
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Allow authenticated users to read their org's check_ins
DROP POLICY IF EXISTS "auth_select_checkins" ON check_ins;
CREATE POLICY "auth_select_checkins" ON check_ins
  FOR SELECT TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Allow authenticated users to read their org's tokens
DROP POLICY IF EXISTS "auth_select_tokens" ON check_in_tokens;
CREATE POLICY "auth_select_tokens" ON check_in_tokens
  FOR SELECT TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Allow authenticated to insert tokens
DROP POLICY IF EXISTS "auth_insert_tokens" ON check_in_tokens;
CREATE POLICY "auth_insert_tokens" ON check_in_tokens
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Allow org users to update their org data
DROP POLICY IF EXISTS "auth_update_organizations" ON organizations;
CREATE POLICY "auth_update_organizations" ON organizations
  FOR UPDATE TO authenticated
  USING (id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ))
  WITH CHECK (id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Function to register a new organization + user
CREATE OR REPLACE FUNCTION register_organization(
  p_org_name text,
  p_org_email text,
  p_org_phone text,
  p_org_address text,
  p_user_name text,
  p_user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  INSERT INTO organizations (
    name, email, phone, address,
    account_status,
    subscription_expires_at,
    trial_started_at
  )
  VALUES (
    p_org_name, p_org_email, p_org_phone, p_org_address,
    'trial',
    NOW() + INTERVAL '14 days',
    NOW()
  )
  RETURNING id INTO v_org_id;

  INSERT INTO user_profiles (id, organization_id, name, role, is_active)
  VALUES (p_user_id, v_org_id, p_user_name, 'owner', true);

  RETURN v_org_id;
END;
$$;

-- Ensure generate_secure_token returns 32-char hex
CREATE OR REPLACE FUNCTION generate_secure_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token text;
BEGIN
  v_token := encode(gen_random_bytes(16), 'hex');
  RETURN v_token;
END;
$$;
