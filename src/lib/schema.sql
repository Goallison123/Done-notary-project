-- ============================================================
-- DONE Platform — PostgreSQL Database Schema
-- Version: 1.0.0 | Generated: 2024-06-22
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL, -- subdomain
  logo_url    TEXT,
  address     TEXT,
  phone       VARCHAR(50),
  email       VARCHAR(255),
  country     VARCHAR(100) DEFAULT 'Rwanda',
  description TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orgs_slug ON organizations(slug);

-- ============================================================
-- USERS (staff only — clients never have accounts)
-- ============================================================
CREATE TYPE user_role AS ENUM ('owner', 'administrator', 'receptionist', 'reviewer', 'viewer');

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email       VARCHAR(255) UNIQUE NOT NULL,
  name        VARCHAR(255) NOT NULL,
  role        user_role NOT NULL DEFAULT 'viewer',
  avatar_url  TEXT,
  is_active   BOOLEAN DEFAULT true,
  last_login  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_org ON users(org_id);
CREATE INDEX idx_users_email ON users(email);

-- Supabase Auth integration: link auth.users → public.users
-- CREATE POLICY "Users can read own org" ON users
--   FOR SELECT USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

-- ============================================================
-- CATEGORIES (form templates)
-- ============================================================
CREATE TABLE categories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name         VARCHAR(255) NOT NULL,
  description  TEXT,
  icon         VARCHAR(10),    -- emoji
  color        VARCHAR(7),     -- hex color
  is_active    BOOLEAN DEFAULT true,
  created_by   UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_org ON categories(org_id);

-- ============================================================
-- FORM FIELDS
-- ============================================================
CREATE TYPE field_type AS ENUM (
  'short_text', 'long_text', 'number', 'phone', 'email',
  'date', 'national_id', 'dropdown', 'radio', 'checkbox',
  'file_upload', 'signature'
);

CREATE TABLE form_fields (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  type          field_type NOT NULL,
  label         VARCHAR(255) NOT NULL,
  placeholder   TEXT,
  help_text     TEXT,
  is_required   BOOLEAN DEFAULT false,
  sort_order    INTEGER DEFAULT 0,
  max_files     INTEGER DEFAULT 1,
  accepted_types TEXT[], -- e.g. ARRAY['application/pdf', 'image/jpeg']
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE field_options (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id  UUID NOT NULL REFERENCES form_fields(id) ON DELETE CASCADE,
  label     VARCHAR(255) NOT NULL,
  value     VARCHAR(255) NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_fields_category ON form_fields(category_id, sort_order);
CREATE INDEX idx_options_field ON field_options(field_id);

-- ============================================================
-- CLIENTS (created when a request is first sent to a phone)
-- ============================================================
CREATE TABLE clients (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name         VARCHAR(255),
  phone        VARCHAR(50) NOT NULL,
  email        VARCHAR(255),
  national_id  VARCHAR(50),
  address      TEXT,
  country      VARCHAR(100) DEFAULT 'Rwanda',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, phone)
);

CREATE INDEX idx_clients_org ON clients(org_id);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_national_id ON clients(national_id);
-- Full-text search index
CREATE INDEX idx_clients_name_trgm ON clients USING gin(name gin_trgm_ops);

-- ============================================================
-- CLIENT REQUESTS
-- ============================================================
CREATE TYPE request_status AS ENUM ('pending', 'submitted', 'reviewed', 'expired', 'rejected');

CREATE TABLE client_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  unique_id     VARCHAR(50) UNIQUE NOT NULL, -- human-readable: REQ-2024-001
  token         VARCHAR(255) UNIQUE NOT NULL, -- secure random token for link
  category_id   UUID NOT NULL REFERENCES categories(id),
  client_id     UUID REFERENCES clients(id),
  client_phone  VARCHAR(50) NOT NULL,
  client_email  VARCHAR(255),
  client_name   VARCHAR(255),
  notes         TEXT,
  status        request_status DEFAULT 'pending',
  created_by    UUID NOT NULL REFERENCES users(id),
  submitted_at  TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ NOT NULL,
  form_data     JSONB,       -- submitted field values
  signature_url TEXT,        -- path to signature image in storage
  ip_address    VARCHAR(50), -- submission IP
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_requests_org ON client_requests(org_id);
CREATE INDEX idx_requests_status ON client_requests(org_id, status);
CREATE INDEX idx_requests_client ON client_requests(client_id);
CREATE INDEX idx_requests_token ON client_requests(token);
CREATE INDEX idx_requests_expires ON client_requests(expires_at) WHERE status = 'pending';

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id   UUID NOT NULL REFERENCES client_requests(id) ON DELETE CASCADE,
  org_id       UUID NOT NULL REFERENCES organizations(id),
  field_id     UUID REFERENCES form_fields(id),
  name         VARCHAR(500) NOT NULL,
  mime_type    VARCHAR(100),
  size_bytes   INTEGER,
  storage_path TEXT NOT NULL, -- Supabase Storage path
  uploaded_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_docs_request ON documents(request_id);
CREATE INDEX idx_docs_org ON documents(org_id);

-- ============================================================
-- ACTIVITY LOG (immutable audit trail)
-- ============================================================
CREATE TYPE activity_action AS ENUM (
  'created', 'edited', 'viewed', 'submitted', 'downloaded',
  'expired', 'deleted', 'login', 'logout'
);

CREATE TYPE entity_type AS ENUM (
  'request', 'client', 'category', 'document', 'user', 'organization'
);

CREATE TABLE activity_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES users(id),
  action       activity_action NOT NULL,
  entity_type  entity_type NOT NULL,
  entity_id    UUID,
  entity_name  TEXT,
  ip_address   VARCHAR(50),
  metadata     JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_org ON activity_logs(org_id, created_at DESC);
CREATE INDEX idx_activity_entity ON activity_logs(entity_id);
-- Logs are immutable — no UPDATE or DELETE allowed
CREATE RULE no_update_activity AS ON UPDATE TO activity_logs DO INSTEAD NOTHING;
CREATE RULE no_delete_activity AS ON DELETE TO activity_logs DO INSTEAD NOTHING;

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TYPE notification_type AS ENUM ('pending', 'completed', 'upload', 'expired', 'info');

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id), -- NULL = all org users
  type        notification_type NOT NULL,
  title       VARCHAR(255) NOT NULL,
  message     TEXT NOT NULL,
  request_id  UUID REFERENCES client_requests(id),
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notif_org ON notifications(org_id, created_at DESC);

-- ============================================================
-- ORGANIZATION SETTINGS
-- ============================================================
CREATE TABLE org_settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  link_expiration_days  INTEGER DEFAULT 7,
  one_submission_only   BOOLEAN DEFAULT true,
  allow_resubmission    BOOLEAN DEFAULT false,
  require_signature     BOOLEAN DEFAULT false,
  max_file_size_mb      INTEGER DEFAULT 10,
  allowed_file_types    TEXT[] DEFAULT ARRAY['application/pdf', 'image/jpeg', 'image/png'],
  sms_provider          VARCHAR(50) DEFAULT 'mock', -- 'mock' | 'africastalking' | 'twilio'
  sms_api_key_encrypted TEXT,
  sms_sender_id         VARCHAR(50),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CLIENT NOTES (internal staff notes per client)
-- ============================================================
CREATE TABLE client_notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id),
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notes_client ON client_notes(client_id, created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's org
CREATE OR REPLACE FUNCTION current_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Users can only see their own org's data
CREATE POLICY "org_isolation" ON clients
  FOR ALL USING (org_id = current_org_id());

CREATE POLICY "org_isolation" ON categories
  FOR ALL USING (org_id = current_org_id());

CREATE POLICY "org_isolation" ON client_requests
  FOR ALL USING (org_id = current_org_id());

CREATE POLICY "org_isolation" ON documents
  FOR ALL USING (org_id = current_org_id());

CREATE POLICY "org_isolation" ON activity_logs
  FOR SELECT USING (org_id = current_org_id());

CREATE POLICY "org_isolation" ON notifications
  FOR ALL USING (org_id = current_org_id());

-- Public read for submission (via token, no auth required)
CREATE POLICY "public_submission_read" ON client_requests
  FOR SELECT USING (status = 'pending' AND expires_at > NOW());

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orgs_updated BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_requests_updated BEFORE UPDATE ON client_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- INDEXES FOR FULL-TEXT SEARCH
-- ============================================================
CREATE INDEX idx_requests_form_data ON client_requests USING gin(form_data);
CREATE INDEX idx_requests_client_name_trgm ON client_requests USING gin(client_name gin_trgm_ops);
CREATE INDEX idx_requests_client_phone ON client_requests(client_phone);
