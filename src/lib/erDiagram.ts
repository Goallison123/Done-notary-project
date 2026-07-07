export const ER_DIAGRAM = `
erDiagram
  ORGANIZATIONS {
    uuid id PK
    string name
    string slug "subdomain"
    text logo_url
    string country
    bool is_active
    timestamp created_at
  }

  USERS {
    uuid id PK
    uuid org_id FK
    string email
    string name
    enum role "owner|admin|receptionist|reviewer|viewer"
    bool is_active
    timestamp last_login
  }

  CATEGORIES {
    uuid id PK
    uuid org_id FK
    string name
    string description
    string icon
    string color
    bool is_active
    uuid created_by FK
  }

  FORM_FIELDS {
    uuid id PK
    uuid category_id FK
    enum type "text|phone|date|file|signature..."
    string label
    bool is_required
    int sort_order
    text[] accepted_types
  }

  FIELD_OPTIONS {
    uuid id PK
    uuid field_id FK
    string label
    string value
    int sort_order
  }

  CLIENTS {
    uuid id PK
    uuid org_id FK
    string name
    string phone
    string email
    string national_id
    string address
  }

  CLIENT_REQUESTS {
    uuid id PK
    uuid org_id FK
    string unique_id "REQ-YYYY-NNN"
    string token "secure random"
    uuid category_id FK
    uuid client_id FK
    string client_phone
    enum status "pending|submitted|reviewed|expired"
    uuid created_by FK
    timestamp submitted_at
    timestamp expires_at
    jsonb form_data
    text signature_url
  }

  DOCUMENTS {
    uuid id PK
    uuid request_id FK
    uuid org_id FK
    string name
    string mime_type
    int size_bytes
    text storage_path
  }

  ACTIVITY_LOGS {
    uuid id PK
    uuid org_id FK
    uuid user_id FK
    enum action "created|viewed|submitted..."
    enum entity_type "request|client|category..."
    uuid entity_id
    string ip_address
    jsonb metadata
    timestamp created_at
  }

  NOTIFICATIONS {
    uuid id PK
    uuid org_id FK
    uuid user_id FK
    enum type "pending|completed|expired..."
    string title
    text message
    bool is_read
  }

  CLIENT_NOTES {
    uuid id PK
    uuid client_id FK
    uuid user_id FK
    text text
    timestamp created_at
  }

  ORG_SETTINGS {
    uuid id PK
    uuid org_id FK "1-to-1"
    int link_expiration_days
    bool one_submission_only
    bool require_signature
    int max_file_size_mb
    string sms_provider
  }

  ORGANIZATIONS ||--o{ USERS : "has staff"
  ORGANIZATIONS ||--o{ CATEGORIES : "owns"
  ORGANIZATIONS ||--o{ CLIENTS : "serves"
  ORGANIZATIONS ||--o{ CLIENT_REQUESTS : "manages"
  ORGANIZATIONS ||--|| ORG_SETTINGS : "configured by"
  CATEGORIES ||--o{ FORM_FIELDS : "contains"
  FORM_FIELDS ||--o{ FIELD_OPTIONS : "has options"
  CLIENTS ||--o{ CLIENT_REQUESTS : "receives"
  CLIENT_REQUESTS ||--o{ DOCUMENTS : "has uploads"
  CLIENT_REQUESTS }o--|| CATEGORIES : "uses template"
  USERS ||--o{ CLIENT_REQUESTS : "creates"
  USERS ||--o{ ACTIVITY_LOGS : "generates"
  CLIENTS ||--o{ CLIENT_NOTES : "annotated by"
  USERS ||--o{ NOTIFICATIONS : "receives"
`

export default ER_DIAGRAM
