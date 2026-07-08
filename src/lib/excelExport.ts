import * as XLSX from 'xlsx'
import type { CheckIn, ServiceType, RwandaLocation } from '@/types'

export function exportCheckInsToExcel(checkIns: CheckIn[], services: ServiceType[], locations: RwandaLocation[], orgName: string): void {
  const serviceMap = new Map(services.map(s => [s.id, s.name]))
  const locationMap = new Map(locations.map(l => [l.id, l]))
  const rows = checkIns.map(c => ({
    'Sequence #': `#${c.sequence_number.toString().padStart(3, '0')}`,
    'Date': new Date(c.created_at).toLocaleDateString('en-RW'),
    'Time': new Date(c.created_at).toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' }),
    'Client Name': c.client_name,
    'Phone Number': c.client_phone,
    'National ID': c.client_national_id || '',
    'Service Type': serviceMap.get(c.service_type_id || '') || 'Unknown',
    'Province': locationMap.get(c.location_id || '')?.province || '',
    'District': locationMap.get(c.location_id || '')?.district || '',
    'Sector': locationMap.get(c.location_id || '')?.sector || '',
    'Status': c.status,
    'Record Hash': c.record_hash || '',
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Check-Ins')
  XLSX.writeFile(wb, `${orgName.replace(/\s+/g, '_')}_CheckIns_${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportAuditLogToExcel(logs: Array<{id: string; action: string; entity_type: string; entity_id: string; created_at: string; user_id?: string; ip_address?: string; old_values?: Record<string, unknown>; new_values?: Record<string, unknown>}>, orgName: string): void {
  const rows = logs.map(l => ({
    'Date': new Date(l.created_at).toLocaleDateString('en-RW'),
    'Time': new Date(l.created_at).toLocaleTimeString('en-RW'),
    'Action': l.action,
    'Entity Type': l.entity_type,
    'Entity ID': l.entity_id,
    'User ID': l.user_id || '',
    'IP Address': l.ip_address || '',
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Audit Log')
  XLSX.writeFile(wb, `${orgName.replace(/\s+/g, '_')}_AuditLog_${new Date().toISOString().split('T')[0]}.xlsx`)
}