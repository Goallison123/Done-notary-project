import { useState } from 'react'
import { Building, Users, Shield, Bell, Database, Palette, Save, Plus, Trash2, CheckCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '@/shared/context/AuthContext'
import { mockUsers } from '@/data/mockData'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import Select from '@/shared/ui/Select'
import Card from '@/shared/ui/Card'
import Badge from '@/shared/ui/Badge'

const tabs = [
  { id: 'org', label: 'Organization', icon: Building },
  { id: 'users', label: 'Users & Roles', icon: Users },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'sms', label: 'SMS & Notifications', icon: Bell },
  { id: 'submission', label: 'Submission Rules', icon: Database },
]

const roleColors: Record<string, string> = {
  owner: 'bg-brand-900 text-white',
  administrator: 'bg-blue-600 text-white',
  receptionist: 'bg-teal-100 text-teal-700',
  reviewer: 'bg-violet-100 text-violet-700',
  viewer: 'bg-brand-100 text-brand-600',
}

export default function SettingsPage() {
  const { org, user } = useAuth()
  const [activeTab, setActiveTab] = useState('org')
  const [saved, setSaved] = useState(false)
  const [orgForm, setOrgForm] = useState({
    name: org?.name || '',
    email: org?.email || '',
    phone: org?.phone || '',
    address: org?.address || '',
    country: org?.country || 'Rwanda',
    description: org?.description || '',
  })

  const [rules, setRules] = useState({
    linkExpiration: 7,
    oneSubmissionOnly: true,
    allowResubmission: false,
    requireSignature: true,
    maxFileSize: 10,
    smsProvider: 'mock',
  })

  const handleSave = async () => {
    await new Promise(r => setTimeout(r, 600))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-brand-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Settings</h1>
        <p className="text-sm text-brand-500 mt-1">Manage your organization configuration and preferences</p>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Tab Nav */}
        <div className="flex lg:flex-col gap-1.5 lg:w-52 flex-shrink-0 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all',
                activeTab === tab.id ? 'bg-brand-900 text-white shadow-lg shadow-brand-900/20' : 'text-brand-500 hover:bg-brand-100 hover:text-brand-800',
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Organization */}
          {activeTab === 'org' && (
            <Card padding="lg" className="bg-white border border-brand-100">
              <h2 className="text-lg font-bold text-brand-900 mb-6 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Organization Profile</h2>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input label="Organization Name" value={orgForm.name} onChange={e => setOrgForm(p => ({...p, name: e.target.value}))} required />
                  <Input label="Email" type="email" value={orgForm.email} onChange={e => setOrgForm(p => ({...p, email: e.target.value}))} required />
                  <Input label="Phone" value={orgForm.phone} onChange={e => setOrgForm(p => ({...p, phone: e.target.value}))} />
                  <Select label="Country" value={orgForm.country} onChange={e => setOrgForm(p => ({...p, country: e.target.value}))} options={[
                    { value: 'Rwanda', label: 'Rwanda' },
                    { value: 'Kenya', label: 'Kenya' },
                    { value: 'Uganda', label: 'Uganda' },
                    { value: 'Tanzania', label: 'Tanzania' },
                  ]} />
                </div>
                <Input label="Address" value={orgForm.address} onChange={e => setOrgForm(p => ({...p, address: e.target.value}))} />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-brand-700">Description</label>
                  <textarea
                    value={orgForm.description}
                    onChange={e => setOrgForm(p => ({...p, description: e.target.value}))}
                    rows={3}
                    placeholder="Brief description of your organization..."
                    className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-brand-900 placeholder:text-brand-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                  />
                </div>
                <div className="pt-3 flex items-center gap-4">
                  <Button variant="primary" icon={saved ? <CheckCircle size={16} /> : <Save size={16} />} onClick={handleSave} size="lg">
                    {saved ? 'Saved!' : 'Save Changes'}
                  </Button>
                  {saved && <span className="text-sm text-green-600 font-medium">Changes saved successfully</span>}
                </div>
              </div>
            </Card>
          )}

          {/* Users */}
          {activeTab === 'users' && (
            <div className="space-y-5">
              <Card padding="none" className="bg-white border border-brand-100 overflow-hidden rounded-2xl">
                <div className="flex items-center justify-between px-6 py-5 border-b border-brand-100 bg-gradient-to-r from-brand-50 to-white">
                  <h2 className="text-lg font-bold text-brand-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Team Members</h2>
                  <Button variant="primary" size="default" icon={<Plus size={16} />}>Invite User</Button>
                </div>
                <div className="divide-y divide-brand-50">
                  {mockUsers.map(u => (
                    <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-brand-50 transition-colors">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-blue-500/20">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-brand-800">{u.name}</span>
                          {u.id === user?.id && <span className="text-xs text-brand-400 font-medium">(you)</span>}
                        </div>
                        <div className="text-xs text-brand-500 mt-0.5">{u.email}</div>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-lg capitalize ${roleColors[u.role]}`}>
                        {u.role}
                      </span>
                      {u.id !== user?.id && (
                        <button className="p-2 text-brand-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <Card padding="lg" className="bg-white border border-brand-100">
              <h2 className="text-lg font-bold text-brand-900 mb-6 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Security Settings</h2>
              <div className="space-y-6">
                <div className="p-5 bg-gradient-to-r from-brand-50 to-white rounded-xl border border-brand-100">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-blue-100 rounded-xl">
                      <Shield size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-brand-800">Two-Factor Authentication</div>
                      <div className="text-sm text-brand-500 mt-1">Add an extra layer of security to your account</div>
                    </div>
                    <Badge variant="muted" className="font-semibold">Coming Soon</Badge>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-brand-800 mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <Input label="Current Password" type="password" placeholder="••••••••" />
                    <Input label="New Password" type="password" placeholder="Min. 8 characters" />
                    <Input label="Confirm New Password" type="password" placeholder="Re-enter new password" />
                    <Button variant="primary" icon={<Save size={16} />} onClick={handleSave} size="lg">Update Password</Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* SMS */}
          {activeTab === 'sms' && (
            <Card padding="lg" className="bg-white border border-brand-100">
              <h2 className="text-lg font-bold text-brand-900 mb-6 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>SMS Configuration</h2>
              <div className="space-y-5">
                <Select
                  label="SMS Provider"
                  value={rules.smsProvider}
                  onChange={e => setRules(p => ({...p, smsProvider: e.target.value}))}
                  options={[
                    { value: 'mock', label: 'Mock (Development)' },
                    { value: 'africastalking', label: "Africa's Talking" },
                    { value: 'twilio', label: 'Twilio' },
                  ]}
                />
                {rules.smsProvider === 'mock' && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                    <Bell size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Mock mode is active. SMS messages will be simulated and logged but not actually sent.</span>
                  </div>
                )}
                {rules.smsProvider !== 'mock' && (
                  <>
                    <Input label="API Key / Auth Token" type="password" placeholder="Enter your API key" />
                    <Input label="Sender ID" placeholder="e.g. KGNOTARY" />
                  </>
                )}
                <Button variant="primary" icon={<Save size={16} />} onClick={handleSave} size="lg">Save SMS Config</Button>
              </div>
            </Card>
          )}

          {/* Submission Rules */}
          {activeTab === 'submission' && (
            <Card padding="lg" className="bg-white border border-brand-100">
              <h2 className="text-lg font-bold text-brand-900 mb-6 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Submission Rules</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-brand-700">Link Expiration (days)</label>
                    <input
                      type="number"
                      value={rules.linkExpiration}
                      onChange={e => setRules(p => ({...p, linkExpiration: Number(e.target.value)}))}
                      min={1} max={30}
                      className="h-12 rounded-xl border border-brand-200 bg-white px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-brand-700">Max File Size (MB)</label>
                    <input
                      type="number"
                      value={rules.maxFileSize}
                      onChange={e => setRules(p => ({...p, maxFileSize: Number(e.target.value)}))}
                      min={1} max={50}
                      className="h-12 rounded-xl border border-brand-200 bg-white px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'oneSubmissionOnly', label: 'One submission only', desc: 'Clients can only submit once per link' },
                    { key: 'allowResubmission', label: 'Allow resubmission', desc: 'Staff can re-open submitted forms' },
                    { key: 'requireSignature', label: 'Require signature by default', desc: 'All forms require digital signature unless overridden' },
                  ].map(rule => (
                    <div key={rule.key} className="flex items-start gap-4 p-5 border border-brand-200 rounded-xl hover:border-brand-300 transition-colors">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-brand-800">{rule.label}</div>
                        <div className="text-sm text-brand-500 mt-1">{rule.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rules[rule.key as keyof typeof rules] as boolean}
                          onChange={e => setRules(p => ({...p, [rule.key]: e.target.checked}))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-brand-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-5 after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all shadow-inner" />
                      </label>
                    </div>
                  ))}
                </div>

                <Button variant="primary" icon={<Save size={16} />} onClick={handleSave} size="lg">
                  {saved ? 'Saved!' : 'Save Rules'}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
