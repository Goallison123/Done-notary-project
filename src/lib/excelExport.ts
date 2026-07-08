import * as XLSX from 'xlsx'
import type { CheckIn, ServiceType, RwandaLocation } from '@/types'

interface ExportRow {
  'Sequence #': string
  'Date': string
  'Time': string
  'Client Name': string
  'Phone Number': string
  'National ID': string
  'Service Type': string
  'Province': string
  'District': string
  'Sector': string
  'Status': string
  'Purpose': string
  'Check-In Time': string
  'Completion Time': string
  'Record Hash': string
}

export function exportCheckInsToExcel(
  checkIns: CheckIn[],
  services: ServiceType[],
  locations: RwandaLocation[],
  orgName: string
): void {
  const serviceMap = new Map(services.map(s => [s.id, s.name]))
  const locationMap = new Map(locations.map(l => [l.id, l]))

  const rows: ExportRow[] = checkIns.map(checkIn => {
    const service = serviceMap.get(checkIn.service_type_id || '') || 'Unknown'
    const location = locationMap.get(checkIn.location_id || '')
    const date = new Date(checkIn.created_at)

    return {
      'Sequence #': `#${checkIn.sequence_number.toString().padStart(3, '0')}`,
      'Date': date.toLocaleDateString('en-RW'),
      'Time': date.toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' }),
      'Client Name': checkIn.client_name,
      'Phone Number': checkIn.client_phone,
      'National ID': checkIn.client_national_id || '',
      'Service Type': service,
      'Province': location?.province || '',
      'District': location?.district || '',
      'Sector': location?.sector || '',
      'Status': checkIn.status.charAt(0).toUpperCase() + checkIn.status.slice(1),
      'Purpose': checkIn.purpose_of_visit || '',
      'Check-In Time': checkIn.check_in_time ? new Date(checkIn.check_in_time).toLocaleString('en-RW') : '',
      'Completion Time': checkIn.completion_time ? new Date(checkIn.completion_time).toLocaleString('en-RW') : '',
      'Record Hash': checkIn.record_hash || '',
    }
  })

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()

  // Set column widths
  const columnWidths = [
    { wch: 12 }, // Sequence #
    { wch: 12 }, // Date
    { wch: 10 }, // Time
    { wch: 25 }, // Client Name
    { wch: 15 }, // Phone
    { wch: 20 }, // National ID
    { wch: 30 }, // Service Type
    { wch: 18 }, // Province
    { wch: 18 }, // District
    { wch: 18 }, // Sector
    { wch: 12 }, // Status
    { wch: 40 }, // Purpose
    { wch: 18 }, // Check-In Time
    { wch: 18 }, // Completion Time
    { wch: 64 }, // Record Hash
  ]
  worksheet['!cols'] = columnWidths

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Check-Ins')

  const filename = `${orgName.replace(/\s+/g, '_')}_CheckIns_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(workbook, filename)
}

export function exportAuditLogToExcel(
  logs: Array<{
    id: string
    action: string
    entity_type: string
    entity_id: string
    created_at: string
    user_id?: string
    ip_address?: string
    old_values?: Record<string, unknown>
    new_values?: Record<string, unknown>
  }>,
  orgName: string
): void {
  const rows = logs.map(log => ({
    'Date': new Date(log.created_at).toLocaleDateString('en-RW'),
    'Time': new Date(log.created_at).toLocaleTimeString('en-RW'),
    'Action': log.action,
    'Entity Type': log.entity_type,
    'Entity ID': log.entity_id,
    'User ID': log.user_id || '',
    'IP Address': log.ip_address || '',
    'Old Values': log.old_values ? JSON.stringify(log.old_values) : '',
    'New Values': log.new_values ? JSON.stringify(log.new_values) : '',
  }))

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()

  worksheet['!cols'] = [
    { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 15 },
    { wch: 36 }, { wch: 36 }, { wch: 15 }, { wch: 50 }, { wch: 50 },
  ]

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Log')

  const filename = `${orgName.replace(/\s+/g, '_')}_AuditLog_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(workbook, filename)
}
