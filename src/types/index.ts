export type UserRole = 'owner' | 'administrator' | 'receptionist' | 'notary' | 'reviewer' | 'viewer'
export type RequestStatus = 'pending' | 'submitted' | 'reviewed' | 'expired' | 'rejected'
export type FieldType =
  | 'short_text' | 'long_text' | 'number' | 'phone' | 'email'
  | 'date' | 'national_id' | 'dropdown' | 'radio' | 'checkbox'
  | 'file_upload' | 'signature'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  createdAt: string
}

export interface Organization {
  id: string
  name: string
  logo?: string
  license_number?: string
  address: string
  phone: string
  email: string
  country: string
  province?: string
  district?: string
  sector?: string
  subdomain?: string
  description?: string
  website?: string
  createdAt: string
  subscription_expires_at?: string
  trial_started_at?: string
  account_status?: 'trial' | 'active' | 'suspended' | 'cancelled'
  momopay_merchant_code?: string
  payment_phone?: string
  payment_email?: string
}

export interface FieldOption {
  id: string
  label: string
  value: string
}

export interface FormField {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required: boolean
  options?: FieldOption[]
  order: number
  helpText?: string
  maxFiles?: number
  acceptedTypes?: string[]
}

export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  fields: FormField[]
  orgId: string
  createdAt: string
  updatedAt: string
  requestCount?: number
}

export interface Client {
  id: string
  name: string
  phone: string
  email?: string
  nationalId?: string
  passportNumber?: string
  address?: string
  province?: string
  district?: string
  sector?: string
  country?: string
  orgId: string
  createdAt: string
  updatedAt: string
  requestCount?: number
  lastActivity?: string
}

export interface ClientRequest {
  id: string
  uniqueId: string
  token: string
  secureLink: string
  categoryId: string
  categoryName: string
  clientId?: string
  clientPhone: string
  clientEmail?: string
  clientName?: string
  notes?: string
  status: RequestStatus
  orgId: string
  createdBy: string
  createdByName: string
  createdAt: string
  submittedAt?: string
  expiresAt: string
  formData?: Record<string, unknown>
  documents?: Document[]
  signature?: string
}

export interface Document {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: string
  requestId: string
}

export interface ActivityLog {
  id: string
  action: 'created' | 'edited' | 'viewed' | 'submitted' | 'downloaded' | 'expired' | 'deleted' | 'login' | 'archived' | 'called'
  entityType: 'request' | 'client' | 'category' | 'document' | 'user' | 'organization' | 'checkin'
  entityId: string
  entityName: string
  userId: string
  userName: string
  ipAddress: string
  timestamp: string
  metadata?: Record<string, string>
}

export interface Notification {
  id: string
  type: 'pending' | 'completed' | 'upload' | 'expired' | 'info'
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
  requestId?: string
}

export interface OrgSettings {
  linkExpiration: number
  oneSubmissionOnly: boolean
  allowResubmission: boolean
  requireSignature: boolean
  maxFileSize: number
  allowedFileTypes: string[]
  smsProvider: 'mock' | 'twilio' | 'africastalking'
  smsApiKey?: string
  smsSenderId?: string
}

export interface ServiceType {
  id: string
  name: string
  name_kinyarwanda?: string
  code: string
  category?: string
  description?: string
  requires_witness: boolean
  default_fee?: number
  is_active: boolean
  sort_order?: number
  created_at: string
}

export interface RwandaLocation {
  id: string
  province: string
  district: string
  sector: string
  cell?: string
  village?: string
}

export type CheckInStatus = 'pending' | 'active' | 'completed' | 'expired' | 'cancelled'
export type CheckInProgress = 'in_progress' | 'submitted' | 'signed' | 'ready' | 'called' | 'archived'

export interface CheckInToken {
  id: string
  organization_id: string
  created_by?: string
  client_name: string
  client_phone: string
  token: string
  expires_at: string
  is_used: boolean
  status: CheckInStatus
  qr_code_svg?: string
  created_at: string
}

export interface CheckIn {
  id: string
  organization_id: string
  token_id: string
  sequence_number: number
  client_name: string
  client_phone: string
  client_email?: string
  client_national_id?: string
  service_type_id?: string
  service_type_name?: string
  location_id?: string
  location_province?: string
  location_district?: string
  location_sector?: string
  purpose?: string
  form_data?: Record<string, unknown>
  signature_svg?: string
  signature_hash?: string
  record_hash?: string
  status: CheckInProgress
  check_in_time?: string
  completion_time?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface AuditLogEntry {
  id: string
  organization_id: string
  user_id?: string
  action: string
  entity_type: string
  entity_id: string
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at: string
}
