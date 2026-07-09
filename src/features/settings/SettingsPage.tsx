import { useState, useEffect } from 'react'
import { Building, Users, Shield, Bell, Database, Save, Plus, CheckCircle, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '@/shared/context/AuthContext'
import type { Organization } from '@/types'

const tabs = [
  { id: 'org', label: 'Organization', icon: Building },
  { id: 'location', label: 'Location', icon: Building },
  { id: 'users', label: 'Users & Roles', icon: Users },
  { id: 'security', label: 'Security', icon: Shield },
]

const roleColors: Record<string, string> = {
  owner: 'bg-slate-900 text-white',
  administrator: 'bg-blue-600 text-white',
  notary: 'bg-teal-100 text-teal-700',
  receptionist: 'bg-violet-100 text-violet-700',
}

export default function SettingsPage() {
  const { org, user, updateOrganization } = useAuth()
  const [activeTab, setActiveTab] = useState('org')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [orgForm, setOrgForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    website: '',
    license_number: '',
  })

  const [locationForm, setLocationForm] = useState({
    province: '',
    district: '',
    sector: '',
  })

  // Initialize forms when org data loads
  useEffect(() => {
    if (org) {
      setOrgForm({
        name: org.name || '',
        email: org.email || '',
        phone: org.phone || '',
        address: org.address || '',
        description: org.description || '',
        website: org.website || '',
        license_number: org.license_number || '',
      })
      setLocationForm({
        province: org.province || '',
        district: org.district || '',
        sector: org.sector || '',
      })
    }
  }, [org])

  const handleSaveOrg = async () => {
    setSaving(true)
    setError(null)

    const result = await updateOrganization({
      name: orgForm.name,
      email: orgForm.email,
      phone: orgForm.phone,
      address: orgForm.address,
      description: orgForm.description,
      website: orgForm.website,
      license_number: orgForm.license_number,
    })

    setSaving(false)

    if (result.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      setError(result.error || 'Failed to save changes')
    }
  }

  const handleSaveLocation = async () => {
    setSaving(true)
    setError(null)

    const result = await updateOrganization({
      province: locationForm.province,
      district: locationForm.district,
      sector: locationForm.sector,
    })

    setSaving(false)

    if (result.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      setError(result.error || 'Failed to save changes')
    }
  }

  // Rwanda location options
  const provinces = [
    'City of Kigali',
    'Northern Province',
    'Southern Province',
    'Eastern Province',
    'Western Province',
  ]

  const districtsByProvince: Record<string, string[]> = {
    'City of Kigali': ['Nyarugenge', 'Gasabo', 'Kicukiro'],
    'Northern Province': ['Musanze', 'Gakenke', 'Rulindo', 'Burera', 'Gicumbi'],
    'Southern Province': ['Huye', 'Nyanza', 'Gisagara', 'Nyamagabe', 'Nyaruguru', 'Muhanga', 'Kamonyi', 'Ruhango'],
    'Eastern Province': ['Rwamagana', 'Kayonza', 'Nyagatare', 'Gatsibo', 'Bugesera', 'Kirehe', 'Ngoma'],
    'Western Province': ['Rubavu', 'Rusizi', 'Nyamasheke', 'Karongi', 'Rutsiro', 'Ngororero', 'Rusizi'],
  }

  const sectorsByDistrict: Record<string, string[]> = {
    'Nyarugenge': ['Nyarugenge', 'Magerwa', 'Kigali', 'Gitega', 'Kacyiru'],
    'Gasabo': ['Remera', 'Kacyiru', 'Gisozi', 'Ndera', 'Rusororo', 'Bumbogo'],
    'Kicukiro': ['Kicukiro', 'Niboye', 'Kagarama', 'Gatenga', 'Gikondo'],
    'Musanze': ['Muhoza', 'Busogo', 'Cyuve', 'Kimonyi', 'Gacaca'],
    'Huye': ['Ngoma', 'Matyazo', 'Huye', 'Tumba', 'Mbazi'],
    'Rwamagana': ['Kigabiro', 'Munyaga', 'Muhazi', 'Gishari'],
    'Rubavu': ['Rubavu', 'Gisenyi', 'Nyakiliba'],
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your organization configuration</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="flex lg:flex-col gap-1.5 lg:w-52 flex-shrink-0 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all',
                activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          {activeTab === 'org' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Organization Profile</h2>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Organization Name *</label>
                    <input
                      type="text"
                      value={orgForm.name}
                      onChange={e => setOrgForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={orgForm.email}
                      onChange={e => setOrgForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={orgForm.phone}
                      onChange={e => setOrgForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+250 7XX XXX XXX"
                      className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">License Number</label>
                    <input
                      type="text"
                      value={orgForm.license_number}
                      onChange={e => setOrgForm(p => ({ ...p, license_number: e.target.value }))}
                      placeholder="Notary License Number"
                      className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Physical Address</label>
                  <input
                    type="text"
                    value={orgForm.address}
                    onChange={e => setOrgForm(p => ({ ...p, address: e.target.value }))}
                    placeholder="Street address"
                    className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={orgForm.website}
                    onChange={e => setOrgForm(p => ({ ...p, website: e.target.value }))}
                    placeholder="https://your-website.com"
                    className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={orgForm.description}
                    onChange={e => setOrgForm(p => ({ ...p, description: e.target.value }))}
                    rows={3}
                    placeholder="Brief description of your notary office..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="pt-3 flex items-center gap-4">
                  <button
                    onClick={handleSaveOrg}
                    disabled={saving}
                    className="flex items-center gap-2 h-11 px-6 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : saved ? (
                      <>
                        <CheckCircle size={16} />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                  {saved && <span className="text-sm text-teal-600 font-medium">Changes saved</span>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Location Details</h2>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Province</label>
                    <select
                      value={locationForm.province}
                      onChange={e => setLocationForm(p => ({ ...p, province: e.target.value, district: '', sector: '' }))}
                      className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">Select province...</option>
                      {provinces.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">District</label>
                    <select
                      value={locationForm.district}
                      onChange={e => setLocationForm(p => ({ ...p, district: e.target.value, sector: '' }))}
                      disabled={!locationForm.province}
                      className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50"
                    >
                      <option value="">Select district...</option>
                      {(districtsByProvince[locationForm.province] || []).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Sector</label>
                    <select
                      value={locationForm.sector}
                      onChange={e => setLocationForm(p => ({ ...p, sector: e.target.value }))}
                      disabled={!locationForm.district}
                      className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50"
                    >
                      <option value="">Select sector...</option>
                      {(sectorsByDistrict[locationForm.district] || []).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex items-center gap-4">
                  <button
                    onClick={handleSaveLocation}
                    disabled={saving}
                    className="flex items-center gap-2 h-11 px-6 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : saved ? (
                      <>
                        <CheckCircle size={16} />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Location
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Team Members</h2>
                <button
                  className="flex items-center gap-2 h-9 px-4 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all"
                >
                  <Plus size={16} />
                  Invite User
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {user && (
                  <div className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{user.name || 'User'}</span>
                        <span className="text-xs text-slate-400 font-medium">(you)</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                    </div>
                    <span className={clsx('text-xs font-semibold px-3 py-1.5 rounded-lg capitalize', roleColors[user.role] || roleColors.receptionist)}>
                      {user.role}
                    </span>
                  </div>
                )}
              </div>

              {org && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Organization: <span className="font-semibold text-slate-700">{org.name}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Security Settings</h2>

              <div className="space-y-6">
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-teal-100 rounded-xl">
                      <Shield size={20} className="text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-800">Two-Factor Authentication</div>
                      <div className="text-sm text-slate-500 mt-1">Add an extra layer of security to your account</div>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg">
                      Coming Soon
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                      <input
                        type="password"
                        placeholder="Min. 8 characters"
                        className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Re-enter new password"
                        className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      className="flex items-center gap-2 h-11 px-6 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all"
                    >
                      <Save size={16} />
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
