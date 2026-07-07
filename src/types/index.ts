export type UserRole = 'owner' | 'administrator' | 'receptionist' | 'reviewer' | 'viewer'
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
  address: string
  phone: string
  email: string
  country: string
  subdomain: string
  description?: string
  createdAt: string
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
  address?: string
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
  action: 'created' | 'edited' | 'viewed' | 'submitted' | 'downloaded' | 'expired' | 'deleted' | 'login'
  entityType: 'request' | 'client' | 'category' | 'document' | 'user' | 'organization'
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
}
