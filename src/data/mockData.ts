import type { User, Organization, Category, Client, ClientRequest, ActivityLog, Notification, OrgSettings } from '../types'

export const mockOrg: Organization = {
  id: 'org_1',
  name: 'Kigali Notary Office',
  logo: undefined,
  address: 'KG 7 Ave, Kigali, Rwanda',
  phone: '+250 788 123 456',
  email: 'info@kigalinotary.rw',
  country: 'Rwanda',
  subdomain: 'kigalinotary',
  description: 'Providing professional notarization services across Rwanda since 2010.',
  createdAt: '2024-01-15T08:00:00Z',
}

export const mockUsers: User[] = [
  { id: 'u1', name: 'Amara Uwimana', email: 'amara@kigalinotary.rw', role: 'owner', createdAt: '2024-01-15T08:00:00Z' },
  { id: 'u2', name: 'Jean-Pierre Habimana', email: 'jp@kigalinotary.rw', role: 'administrator', createdAt: '2024-01-20T09:00:00Z' },
  { id: 'u3', name: 'Claudine Mukamana', email: 'claudine@kigalinotary.rw', role: 'receptionist', createdAt: '2024-02-01T09:00:00Z' },
  { id: 'u4', name: 'Eric Nzeyimana', email: 'eric@kigalinotary.rw', role: 'reviewer', createdAt: '2024-02-15T09:00:00Z' },
]

export const mockCategories: Category[] = [
  {
    id: 'cat_1',
    name: 'Property Transfer',
    description: 'Transfer of ownership for land and property assets',
    icon: '🏠',
    color: '#2563EB',
    orgId: 'org_1',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
    requestCount: 48,
    fields: [
      { id: 'f1', type: 'short_text', label: 'Full Name', placeholder: 'Enter full legal name', required: true, order: 0 },
      { id: 'f2', type: 'national_id', label: 'National ID Number', placeholder: '1 YYYY MM XXXXXXX X XX', required: true, order: 1 },
      { id: 'f3', type: 'phone', label: 'Phone Number', placeholder: '+250 7XX XXX XXX', required: true, order: 2 },
      { id: 'f4', type: 'short_text', label: 'Property Location', placeholder: 'District, Sector, Cell', required: true, order: 3 },
      { id: 'f5', type: 'short_text', label: 'Plot/UPI Number', placeholder: 'Enter land UPI', required: true, order: 4 },
      { id: 'f6', type: 'dropdown', label: 'Transfer Type', required: true, order: 5, options: [
        { id: 'o1', label: 'Sale', value: 'sale' },
        { id: 'o2', label: 'Gift', value: 'gift' },
        { id: 'o3', label: 'Inheritance', value: 'inheritance' },
      ]},
      { id: 'f7', type: 'file_upload', label: 'Identity Documents', required: true, order: 6, maxFiles: 3, acceptedTypes: ['image/*', 'application/pdf'] },
      { id: 'f8', type: 'file_upload', label: 'Title Deed', required: true, order: 7, maxFiles: 2, acceptedTypes: ['image/*', 'application/pdf'] },
      { id: 'f9', type: 'signature', label: 'Client Signature', required: true, order: 8 },
    ],
  },
  {
    id: 'cat_2',
    name: 'Affidavit',
    description: 'Sworn written statement for legal purposes',
    icon: '📜',
    color: '#14B8A6',
    orgId: 'org_1',
    createdAt: '2024-01-22T10:00:00Z',
    updatedAt: '2024-03-05T10:00:00Z',
    requestCount: 62,
    fields: [
      { id: 'f10', type: 'short_text', label: 'Deponent Full Name', required: true, order: 0, placeholder: 'Full legal name' },
      { id: 'f11', type: 'national_id', label: 'National ID', required: true, order: 1, placeholder: '1 YYYY MM XXXXXXX X XX' },
      { id: 'f12', type: 'short_text', label: 'Occupation', required: true, order: 2, placeholder: 'Your occupation' },
      { id: 'f13', type: 'short_text', label: 'Residence Address', required: true, order: 3, placeholder: 'District, Sector, Cell' },
      { id: 'f14', type: 'long_text', label: 'Statement of Facts', required: true, order: 4, placeholder: 'Clearly state the facts...' },
      { id: 'f15', type: 'file_upload', label: 'Supporting Documents', required: false, order: 5, maxFiles: 5 },
      { id: 'f16', type: 'signature', label: 'Deponent Signature', required: true, order: 6 },
    ],
  },
  {
    id: 'cat_3',
    name: 'Power of Attorney',
    description: 'Legal authorization to act on behalf of another person',
    icon: '⚖️',
    color: '#8B5CF6',
    orgId: 'org_1',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-03-10T10:00:00Z',
    requestCount: 31,
    fields: [
      { id: 'f17', type: 'short_text', label: 'Principal Full Name', required: true, order: 0 },
      { id: 'f18', type: 'national_id', label: 'Principal National ID', required: true, order: 1 },
      { id: 'f19', type: 'phone', label: 'Principal Phone', required: true, order: 2 },
      { id: 'f20', type: 'short_text', label: 'Agent Full Name', required: true, order: 3, placeholder: 'Person being authorized' },
      { id: 'f21', type: 'national_id', label: 'Agent National ID', required: true, order: 4 },
      { id: 'f22', type: 'long_text', label: 'Scope of Authority', required: true, order: 5, placeholder: 'Describe what the agent is authorized to do...' },
      { id: 'f23', type: 'date', label: 'Effective Date', required: true, order: 6 },
      { id: 'f24', type: 'date', label: 'Expiry Date', required: false, order: 7 },
      { id: 'f25', type: 'file_upload', label: 'Identity Documents (Both Parties)', required: true, order: 8, maxFiles: 4 },
      { id: 'f26', type: 'signature', label: 'Principal Signature', required: true, order: 9 },
    ],
  },
  {
    id: 'cat_4',
    name: 'Marriage Agreement',
    description: 'Pre-nuptial or post-nuptial agreement documentation',
    icon: '💍',
    color: '#EC4899',
    orgId: 'org_1',
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-03-12T10:00:00Z',
    requestCount: 19,
    fields: [
      { id: 'f27', type: 'short_text', label: 'First Party Full Name', required: true, order: 0 },
      { id: 'f28', type: 'national_id', label: 'First Party National ID', required: true, order: 1 },
      { id: 'f29', type: 'short_text', label: 'Second Party Full Name', required: true, order: 2 },
      { id: 'f30', type: 'national_id', label: 'Second Party National ID', required: true, order: 3 },
      { id: 'f31', type: 'dropdown', label: 'Marriage Regime', required: true, order: 4, options: [
        { id: 'o4', label: 'Separation of Property', value: 'separation' },
        { id: 'o5', label: 'Community of Property', value: 'community' },
        { id: 'o6', label: 'Participation in Acquest', value: 'participation' },
      ]},
      { id: 'f32', type: 'date', label: 'Agreement Date', required: true, order: 5 },
      { id: 'f33', type: 'file_upload', label: 'Identity Documents', required: true, order: 6, maxFiles: 4 },
      { id: 'f34', type: 'signature', label: 'First Party Signature', required: true, order: 7 },
    ],
  },
  {
    id: 'cat_5',
    name: 'Company Incorporation',
    description: 'Documentation for company notarization and incorporation',
    icon: '🏢',
    color: '#F59E0B',
    orgId: 'org_1',
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
    requestCount: 14,
    fields: [
      { id: 'f35', type: 'short_text', label: 'Company Name', required: true, order: 0 },
      { id: 'f36', type: 'dropdown', label: 'Company Type', required: true, order: 1, options: [
        { id: 'o7', label: 'Limited Liability Company (LLC)', value: 'llc' },
        { id: 'o8', label: 'Public Limited Company (PLC)', value: 'plc' },
        { id: 'o9', label: 'Partnership', value: 'partnership' },
        { id: 'o10', label: 'Sole Proprietorship', value: 'sole' },
      ]},
      { id: 'f37', type: 'short_text', label: 'Registered Address', required: true, order: 2 },
      { id: 'f38', type: 'short_text', label: 'Director Full Name', required: true, order: 3 },
      { id: 'f39', type: 'national_id', label: 'Director National ID', required: true, order: 4 },
      { id: 'f40', type: 'number', label: 'Share Capital (RWF)', required: true, order: 5 },
      { id: 'f41', type: 'file_upload', label: 'Articles of Association', required: true, order: 6, maxFiles: 2 },
      { id: 'f42', type: 'file_upload', label: 'Director ID Documents', required: true, order: 7, maxFiles: 3 },
      { id: 'f43', type: 'signature', label: 'Director Signature', required: true, order: 8 },
    ],
  },
]

export const mockClients: Client[] = [
  { id: 'cli_1', name: 'Nkurunziza Emmanuel', phone: '+250 788 234 567', email: 'emmanuel.n@gmail.com', nationalId: '1 1990 01 1234567 8 90', address: 'Gasabo, Kigali', country: 'Rwanda', orgId: 'org_1', createdAt: '2024-02-10T08:30:00Z', updatedAt: '2024-06-20T14:00:00Z', requestCount: 3, lastActivity: '2024-06-20T14:00:00Z' },
  { id: 'cli_2', name: 'Uwase Marie-Claire', phone: '+250 722 345 678', email: 'marie.uwase@yahoo.fr', nationalId: '1 1985 05 7654321 2 34', address: 'Nyarugenge, Kigali', country: 'Rwanda', orgId: 'org_1', createdAt: '2024-02-15T09:00:00Z', updatedAt: '2024-06-18T11:30:00Z', requestCount: 1, lastActivity: '2024-06-18T11:30:00Z' },
  { id: 'cli_3', name: 'Hakizimana Robert', phone: '+250 733 456 789', nationalId: '1 1978 08 9876543 4 56', address: 'Huye, Southern Province', country: 'Rwanda', orgId: 'org_1', createdAt: '2024-03-01T10:00:00Z', updatedAt: '2024-06-15T16:00:00Z', requestCount: 2, lastActivity: '2024-06-15T16:00:00Z' },
  { id: 'cli_4', name: 'Ingabire Vestine', phone: '+250 788 567 890', email: 'vestine.i@gmail.com', nationalId: '1 1992 11 2345678 9 01', address: 'Musanze, Northern Province', country: 'Rwanda', orgId: 'org_1', createdAt: '2024-03-10T11:00:00Z', updatedAt: '2024-06-10T09:00:00Z', requestCount: 1, lastActivity: '2024-06-10T09:00:00Z' },
  { id: 'cli_5', name: 'Bizimana Théogène', phone: '+250 722 678 901', nationalId: '1 1970 03 3456789 0 12', address: 'Rubavu, Western Province', country: 'Rwanda', orgId: 'org_1', createdAt: '2024-03-15T12:00:00Z', updatedAt: '2024-06-05T13:00:00Z', requestCount: 4, lastActivity: '2024-06-05T13:00:00Z' },
  { id: 'cli_6', name: 'Mukasonga Alice', phone: '+250 733 789 012', email: 'alice.mukasonga@company.rw', nationalId: '1 1988 07 4567890 1 23', address: 'Kicukiro, Kigali', country: 'Rwanda', orgId: 'org_1', createdAt: '2024-04-01T08:00:00Z', updatedAt: '2024-05-30T10:00:00Z', requestCount: 2, lastActivity: '2024-05-30T10:00:00Z' },
  { id: 'cli_7', name: 'Nsengiyumva Daniel', phone: '+250 788 890 123', nationalId: '1 1995 06 5678901 2 34', address: 'Rwamagana, Eastern Province', country: 'Rwanda', orgId: 'org_1', createdAt: '2024-04-10T09:00:00Z', updatedAt: '2024-05-25T15:00:00Z', requestCount: 1, lastActivity: '2024-05-25T15:00:00Z' },
  { id: 'cli_8', name: 'Munyakazi Josephine', phone: '+250 722 901 234', email: 'josephine.m@gmail.com', nationalId: '1 1982 02 6789012 3 45', address: 'Nyanza, Southern Province', country: 'Rwanda', orgId: 'org_1', createdAt: '2024-04-20T10:00:00Z', updatedAt: '2024-05-20T11:00:00Z', requestCount: 2, lastActivity: '2024-05-20T11:00:00Z' },
]

export const mockRequests: ClientRequest[] = [
  { id: 'req_1', uniqueId: 'REQ-2024-001', token: 'tok_abc123xyz', secureLink: '/submit/tok_abc123xyz', categoryId: 'cat_1', categoryName: 'Property Transfer', clientId: 'cli_1', clientPhone: '+250 788 234 567', clientName: 'Nkurunziza Emmanuel', status: 'submitted', orgId: 'org_1', createdBy: 'u3', createdByName: 'Claudine Mukamana', createdAt: '2024-06-20T08:00:00Z', submittedAt: '2024-06-20T14:00:00Z', expiresAt: '2024-06-27T08:00:00Z', notes: 'Property transfer from parent to child' },
  { id: 'req_2', uniqueId: 'REQ-2024-002', token: 'tok_def456uvw', secureLink: '/submit/tok_def456uvw', categoryId: 'cat_2', categoryName: 'Affidavit', clientId: 'cli_2', clientPhone: '+250 722 345 678', clientName: 'Uwase Marie-Claire', status: 'pending', orgId: 'org_1', createdBy: 'u3', createdByName: 'Claudine Mukamana', createdAt: '2024-06-21T09:00:00Z', expiresAt: '2024-06-28T09:00:00Z' },
  { id: 'req_3', uniqueId: 'REQ-2024-003', token: 'tok_ghi789rst', secureLink: '/submit/tok_ghi789rst', categoryId: 'cat_3', categoryName: 'Power of Attorney', clientId: 'cli_3', clientPhone: '+250 733 456 789', clientName: 'Hakizimana Robert', status: 'reviewed', orgId: 'org_1', createdBy: 'u2', createdByName: 'Jean-Pierre Habimana', createdAt: '2024-06-15T10:00:00Z', submittedAt: '2024-06-15T16:00:00Z', expiresAt: '2024-06-22T10:00:00Z' },
  { id: 'req_4', uniqueId: 'REQ-2024-004', token: 'tok_jkl012opq', secureLink: '/submit/tok_jkl012opq', categoryId: 'cat_4', categoryName: 'Marriage Agreement', clientId: 'cli_4', clientPhone: '+250 788 567 890', clientName: 'Ingabire Vestine', status: 'pending', orgId: 'org_1', createdBy: 'u3', createdByName: 'Claudine Mukamana', createdAt: '2024-06-22T11:00:00Z', expiresAt: '2024-06-29T11:00:00Z' },
  { id: 'req_5', uniqueId: 'REQ-2024-005', token: 'tok_mno345lmn', secureLink: '/submit/tok_mno345lmn', categoryId: 'cat_1', categoryName: 'Property Transfer', clientId: 'cli_5', clientPhone: '+250 722 678 901', clientName: 'Bizimana Théogène', status: 'submitted', orgId: 'org_1', createdBy: 'u3', createdByName: 'Claudine Mukamana', createdAt: '2024-06-19T08:00:00Z', submittedAt: '2024-06-19T13:00:00Z', expiresAt: '2024-06-26T08:00:00Z' },
  { id: 'req_6', uniqueId: 'REQ-2024-006', token: 'tok_pqr678ijk', secureLink: '/submit/tok_pqr678ijk', categoryId: 'cat_5', categoryName: 'Company Incorporation', clientId: 'cli_6', clientPhone: '+250 733 789 012', clientName: 'Mukasonga Alice', status: 'expired', orgId: 'org_1', createdBy: 'u2', createdByName: 'Jean-Pierre Habimana', createdAt: '2024-06-05T09:00:00Z', expiresAt: '2024-06-12T09:00:00Z' },
  { id: 'req_7', uniqueId: 'REQ-2024-007', token: 'tok_stu901fgh', secureLink: '/submit/tok_stu901fgh', categoryId: 'cat_2', categoryName: 'Affidavit', clientId: 'cli_7', clientPhone: '+250 788 890 123', clientName: 'Nsengiyumva Daniel', status: 'pending', orgId: 'org_1', createdBy: 'u3', createdByName: 'Claudine Mukamana', createdAt: '2024-06-22T14:00:00Z', expiresAt: '2024-06-29T14:00:00Z' },
  { id: 'req_8', uniqueId: 'REQ-2024-008', token: 'tok_vwx234cde', secureLink: '/submit/tok_vwx234cde', categoryId: 'cat_3', categoryName: 'Power of Attorney', clientId: 'cli_8', clientPhone: '+250 722 901 234', clientName: 'Munyakazi Josephine', status: 'reviewed', orgId: 'org_1', createdBy: 'u4', createdByName: 'Eric Nzeyimana', createdAt: '2024-06-10T10:00:00Z', submittedAt: '2024-06-11T11:00:00Z', expiresAt: '2024-06-17T10:00:00Z' },
]

export const mockActivityLogs: ActivityLog[] = [
  { id: 'act_1', action: 'submitted', entityType: 'request', entityId: 'req_1', entityName: 'REQ-2024-001 · Property Transfer', userId: 'system', userName: 'System', ipAddress: '196.12.34.56', timestamp: '2024-06-20T14:00:00Z' },
  { id: 'act_2', action: 'created', entityType: 'request', entityId: 'req_2', entityName: 'REQ-2024-002 · Affidavit', userId: 'u3', userName: 'Claudine Mukamana', ipAddress: '196.12.34.10', timestamp: '2024-06-21T09:00:00Z' },
  { id: 'act_3', action: 'viewed', entityType: 'request', entityId: 'req_1', entityName: 'REQ-2024-001 · Property Transfer', userId: 'u4', userName: 'Eric Nzeyimana', ipAddress: '196.12.34.20', timestamp: '2024-06-21T10:30:00Z' },
  { id: 'act_4', action: 'created', entityType: 'request', entityId: 'req_4', entityName: 'REQ-2024-004 · Marriage Agreement', userId: 'u3', userName: 'Claudine Mukamana', ipAddress: '196.12.34.10', timestamp: '2024-06-22T11:00:00Z' },
  { id: 'act_5', action: 'login', entityType: 'user', entityId: 'u1', entityName: 'Amara Uwimana', userId: 'u1', userName: 'Amara Uwimana', ipAddress: '196.12.34.5', timestamp: '2024-06-22T08:00:00Z' },
  { id: 'act_6', action: 'created', entityType: 'request', entityId: 'req_7', entityName: 'REQ-2024-007 · Affidavit', userId: 'u3', userName: 'Claudine Mukamana', ipAddress: '196.12.34.10', timestamp: '2024-06-22T14:00:00Z' },
  { id: 'act_7', action: 'viewed', entityType: 'client', entityId: 'cli_5', entityName: 'Bizimana Théogène', userId: 'u2', userName: 'Jean-Pierre Habimana', ipAddress: '196.12.34.15', timestamp: '2024-06-21T16:00:00Z' },
  { id: 'act_8', action: 'edited', entityType: 'category', entityId: 'cat_1', entityName: 'Property Transfer', userId: 'u1', userName: 'Amara Uwimana', ipAddress: '196.12.34.5', timestamp: '2024-06-20T09:00:00Z' },
]

export const mockNotifications: Notification[] = [
  { id: 'notif_1', type: 'completed', title: 'Form Submitted', message: 'Nkurunziza Emmanuel submitted Property Transfer request REQ-2024-001', read: false, createdAt: '2024-06-20T14:00:00Z', requestId: 'req_1' },
  { id: 'notif_2', type: 'pending', title: 'Awaiting Submission', message: 'Uwase Marie-Claire has not yet submitted Affidavit REQ-2024-002', read: false, createdAt: '2024-06-21T09:00:00Z', requestId: 'req_2' },
  { id: 'notif_3', type: 'pending', title: 'Awaiting Submission', message: 'Ingabire Vestine has not yet submitted Marriage Agreement REQ-2024-004', read: false, createdAt: '2024-06-22T11:00:00Z', requestId: 'req_4' },
  { id: 'notif_4', type: 'expired', title: 'Link Expired', message: 'Mukasonga Alice request REQ-2024-006 for Company Incorporation has expired', read: true, createdAt: '2024-06-12T09:00:00Z', requestId: 'req_6' },
  { id: 'notif_5', type: 'completed', title: 'Form Submitted', message: 'Bizimana Théogène submitted Property Transfer request REQ-2024-005', read: true, createdAt: '2024-06-19T13:00:00Z', requestId: 'req_5' },
  { id: 'notif_6', type: 'info', title: 'New User Added', message: 'Eric Nzeyimana joined as Reviewer', read: true, createdAt: '2024-02-15T09:00:00Z' },
]

export const mockOrgSettings: OrgSettings = {
  linkExpiration: 7,
  oneSubmissionOnly: true,
  allowResubmission: false,
  requireSignature: true,
  maxFileSize: 10,
  allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  smsProvider: 'mock',
}

export const dashboardStats = {
  totalClients: 148,
  pendingRequests: 12,
  completedRequests: 234,
  documentsUploaded: 891,
  todayRequests: 7,
  weeklyGrowth: 12.5,
}

export const weeklyData = [
  { day: 'Mon', requests: 8, completed: 5 },
  { day: 'Tue', requests: 12, completed: 9 },
  { day: 'Wed', requests: 6, completed: 6 },
  { day: 'Thu', requests: 15, completed: 11 },
  { day: 'Fri', requests: 10, completed: 8 },
  { day: 'Sat', requests: 4, completed: 3 },
  { day: 'Sun', requests: 2, completed: 2 },
]

export const categoryDistribution = [
  { name: 'Property Transfer', value: 48, color: '#2563EB' },
  { name: 'Affidavit', value: 62, color: '#14B8A6' },
  { name: 'Power of Attorney', value: 31, color: '#8B5CF6' },
  { name: 'Marriage Agreement', value: 19, color: '#EC4899' },
  { name: 'Company Incorporation', value: 14, color: '#F59E0B' },
]
