# DONE — Client Intake & Records Management Platform

> **Collect. Verify. Organize. Done.**

DONE is a cloud-based Client Intake and Records Management Platform for professional offices. It replaces physical paper registers with secure, searchable digital records.

Built by **Sybella Systems** · Kigali, Rwanda 🇷🇼

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

Demo login: `amara@kigalinotary.rw` / any password

---

## Architecture

```
src/
├── components/
│   ├── layout/         # DashboardLayout, Sidebar, Topbar
│   ├── shared/         # GlobalSearch, shared components  
│   └── ui/             # Button, Input, Card, Badge, Modal, Select
├── contexts/
│   ├── AuthContext.tsx  # Authentication state
│   └── AppContext.tsx   # Global app state (clients, requests, etc.)
├── data/
│   └── mockData.ts      # Realistic seed data for MVP demo
├── lib/
│   ├── schema.sql       # Full PostgreSQL schema with RLS policies
│   └── erDiagram.ts     # Mermaid ER diagram
├── pages/
│   ├── LandingPage.tsx  # Marketing landing page
│   ├── auth/            # Login, Register, ForgotPassword
│   ├── dashboard/       # Main dashboard with charts
│   ├── clients/         # Client list + profile with notes
│   ├── categories/      # Form builder with DnD
│   ├── requests/        # Request management
│   ├── activity/        # Audit log
│   ├── notifications/   # Notification inbox
│   ├── settings/        # Org settings, users, SMS
│   └── submission/      # Public client-facing form
└── types/
    └── index.ts         # Full TypeScript type definitions
```

---

## Database Schema (PostgreSQL)

See `src/lib/schema.sql` for the full schema.

### Core Tables

| Table | Description |
|-------|-------------|
| `organizations` | Each organization (notary office, law firm, etc.) |
| `users` | Staff accounts (owner, admin, receptionist, reviewer, viewer) |
| `categories` | Form templates with customizable field definitions |
| `form_fields` | Individual fields within a category |
| `field_options` | Options for dropdown/radio/checkbox fields |
| `clients` | Client records (created when first request is sent) |
| `client_requests` | Individual form requests with secure tokens |
| `documents` | Uploaded files attached to submissions |
| `activity_logs` | Immutable audit trail of all actions |
| `notifications` | In-app notification system |
| `client_notes` | Internal staff notes per client |
| `org_settings` | Per-organization configuration |

### Row Level Security

All tables have RLS enabled. The `current_org_id()` function ensures complete data isolation between organizations.

---

## User Roles

| Role | Permissions |
|------|-------------|
| **Owner** | Full access, billing, org deletion |
| **Administrator** | Manage users, categories, all requests |
| **Receptionist** | Create requests, view clients |
| **Reviewer** | View & review submissions, add comments |
| **Viewer** | Read-only access to records |

---

## Core Workflow

1. **Staff creates request** → selects category + client phone
2. **System generates** → unique ID + secure token + link
3. **Mock SMS sent** → `{origin}/submit/{token}`
4. **Client opens link** → no login, no account needed
5. **Client fills form** → text, files, digital signature
6. **Client submits** → form deactivated, records secured
7. **Staff reviews** → searchable in dashboard

---

## API Endpoints (Future — Next.js Route Handlers)

```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/forgot-password

GET    /api/clients
GET    /api/clients/:id
POST   /api/clients

GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id

GET    /api/requests
POST   /api/requests
GET    /api/requests/:id
PUT    /api/requests/:id/status

GET    /api/submit/:token     # Public — no auth
POST   /api/submit/:token     # Public — client submission

GET    /api/documents/:id
POST   /api/documents/upload

GET    /api/activity
GET    /api/notifications
PUT    /api/notifications/:id/read

GET    /api/settings
PUT    /api/settings
```

---

## Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# App
VITE_APP_URL=https://your-domain.rw
VITE_APP_NAME=DONE

# SMS (Africa's Talking)
AT_API_KEY=your-africastalking-api-key
AT_USERNAME=your-username
AT_SENDER_ID=DONE

# SMS (Twilio — alternative)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## SMS Abstraction Layer

```typescript
// src/lib/sms.ts
interface SMSProvider {
  send(to: string, message: string): Promise<SMSResult>
}

class MockSMSProvider implements SMSProvider {
  async send(to: string, message: string) {
    console.log(`[MOCK SMS] To: ${to}\n${message}`)
    return { success: true, messageId: `mock_${Date.now()}` }
  }
}

class AfricasTalkingProvider implements SMSProvider {
  async send(to: string, message: string) {
    // Africa's Talking API call
  }
}

// Switch provider via environment variable
export const smsProvider = process.env.SMS_PROVIDER === 'africastalking'
  ? new AfricasTalkingProvider()
  : new MockSMSProvider()
```

---

## Future Modules (Planned)

- Digital Notarization with legal seals
- National ID verification (NIDA integration)
- OCR document parsing
- AI document analysis
- QR code verification
- Appointment scheduling
- Payment processing (MTN MoMo, Airtel Money)
- Government API integration
- Multi-branch organization support
- Workflow automation
- Audit certificates (PDF with legal signatures)

---

## Deployment

### Vercel (Recommended)

```bash
vercel deploy --prod
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN pnpm install && pnpm build
EXPOSE 3000
CMD ["pnpm", "preview"]
```

### Database Migration

```bash
# Apply schema
psql $DATABASE_URL < src/lib/schema.sql

# Seed with sample data
psql $DATABASE_URL < src/lib/seed.sql
```

---

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **Charts**: Recharts
- **Icons**: Lucide React
- **DnD**: @dnd-kit
- **Database**: PostgreSQL + Supabase
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **SMS**: Africa's Talking (production) / Mock (dev)

---

## License

MIT · © 2024 Sybella Systems Ltd · Kigali, Rwanda
