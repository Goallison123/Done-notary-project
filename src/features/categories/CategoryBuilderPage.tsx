import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, GripVertical, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useApp } from '@/shared/context/AppContext'
import type { FormField, FieldType, Category } from '@/types'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import Select from '@/shared/ui/Select'
import Textarea from '@/shared/ui/Textarea'
import Card from '@/shared/ui/Card'

const FIELD_TYPES: { value: FieldType; label: string; icon: string }[] = [
  { value: 'short_text', label: 'Short Text', icon: '✏️' },
  { value: 'long_text', label: 'Long Text', icon: '📝' },
  { value: 'number', label: 'Number', icon: '🔢' },
  { value: 'phone', label: 'Phone', icon: '📞' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'national_id', label: 'National ID', icon: '🪪' },
  { value: 'dropdown', label: 'Dropdown', icon: '🔽' },
  { value: 'radio', label: 'Radio Buttons', icon: '🔘' },
  { value: 'checkbox', label: 'Checkbox', icon: '☑️' },
  { value: 'file_upload', label: 'File Upload', icon: '📎' },
  { value: 'signature', label: 'Signature', icon: '✍️' },
]

const COLORS = ['#2563EB', '#14B8A6', '#8B5CF6', '#EC4899', '#F59E0B', '#22C55E', '#EF4444', '#0F172A']
const ICONS = ['📄', '🏠', '📜', '⚖️', '💍', '🏢', '🤝', '📋', '💰', '🌍', '📊', '🔑']

function newField(order: number): FormField {
  return { id: `f_${Date.now()}_${order}`, type: 'short_text', label: '', required: false, order }
}

function SortableField({ field, onUpdate, onDelete, expanded, onToggle }: {
  field: FormField
  onUpdate: (updates: Partial<FormField>) => void
  onDelete: () => void
  expanded: boolean
  onToggle: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-brand-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-brand-300 hover:text-brand-500 flex-shrink-0">
          <GripVertical size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base">{FIELD_TYPES.find(t => t.value === field.type)?.icon}</span>
            <span className="text-sm font-medium text-brand-800 truncate">{field.label || 'Untitled field'}</span>
            {field.required && <span className="text-red-400 text-xs">Required</span>}
          </div>
          <div className="text-xs text-brand-400 mt-0.5">{FIELD_TYPES.find(t => t.value === field.type)?.label}</div>
        </div>
        <button onClick={onToggle} className="p-1 text-brand-400 hover:text-brand-700">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <button onClick={onDelete} className="p-1 text-brand-300 hover:text-red-500">
          <Trash2 size={15} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-brand-100 px-4 py-4 space-y-3 bg-brand-50">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Field Label"
              value={field.label}
              onChange={e => onUpdate({ label: e.target.value })}
              placeholder="e.g. Full Name"
              required
            />
            <Select
              label="Field Type"
              value={field.type}
              onChange={e => onUpdate({ type: e.target.value as FieldType })}
              options={FIELD_TYPES.map(t => ({ value: t.value, label: `${t.icon} ${t.label}` }))}
            />
          </div>
          <Input
            label="Placeholder"
            value={field.placeholder || ''}
            onChange={e => onUpdate({ placeholder: e.target.value })}
            placeholder="Hint text shown to client"
          />
          <Input
            label="Help Text"
            value={field.helpText || ''}
            onChange={e => onUpdate({ helpText: e.target.value })}
            placeholder="Additional instructions"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`req_${field.id}`}
              checked={field.required}
              onChange={e => onUpdate({ required: e.target.checked })}
              className="rounded"
            />
            <label htmlFor={`req_${field.id}`} className="text-sm text-brand-700">Required field</label>
          </div>
          {(field.type === 'dropdown' || field.type === 'radio' || field.type === 'checkbox') && (
            <div>
              <div className="text-xs font-medium text-brand-600 mb-2">Options (one per line)</div>
              <Textarea
                value={(field.options || []).map(o => o.label).join('\n')}
                onChange={e => {
                  const lines = e.target.value.split('\n').filter(Boolean)
                  onUpdate({ options: lines.map((l, i) => ({ id: `opt_${i}`, label: l, value: l.toLowerCase().replace(/\s+/g, '_') })) })
                }}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                rows={3}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function CategoryBuilderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { categories, addCategory, updateCategory } = useApp()

  const existing = id ? categories.find(c => c.id === id) : null
  const isEdit = !!existing

  const [name, setName] = useState(existing?.name || '')
  const [description, setDescription] = useState(existing?.description || '')
  const [icon, setIcon] = useState(existing?.icon || '📄')
  const [color, setColor] = useState(existing?.color || '#2563EB')
  const [fields, setFields] = useState<FormField[]>(existing?.fields || [newField(0)])
  const [expandedId, setExpandedId] = useState<string | null>(fields[0]?.id || null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setDescription(existing.description || '')
      setIcon(existing.icon || '📄')
      setColor(existing.color || '#2563EB')
      setFields(existing.fields)
    }
  }, [id])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const addField = () => {
    const f = newField(fields.length)
    setFields(prev => [...prev, f])
    setExpandedId(f.id)
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(f => f.id === fieldId ? { ...f, ...updates } : f))
  }

  const deleteField = (fieldId: string) => {
    setFields(prev => prev.filter(f => f.id !== fieldId))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex(f => f.id === active.id)
      const newIndex = fields.findIndex(f => f.id === over.id)
      setFields(prev => arrayMove(prev, oldIndex, newIndex).map((f, i) => ({ ...f, order: i })))
    }
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    const cat: Category = {
      id: existing?.id || `cat_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      icon, color,
      fields: fields.map((f, i) => ({ ...f, order: i })),
      orgId: 'org_1',
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requestCount: existing?.requestCount || 0,
    }
    if (isEdit) updateCategory(cat.id, cat)
    else addCategory(cat)
    navigate('/dashboard/categories')
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/categories')} icon={<ArrowLeft size={14} />}>
            Categories
          </Button>
          <span className="text-brand-300">/</span>
          <span className="text-sm text-brand-500">{isEdit ? 'Edit' : 'New'} Category</span>
        </div>
        <Button variant="primary" icon={<Save size={15} />} onClick={handleSave} loading={saving} disabled={!name.trim()}>
          {isEdit ? 'Save Changes' : 'Create Category'}
        </Button>
      </div>

      {/* Category Info */}
      <Card>
        <h3 className="text-sm font-semibold text-brand-900 mb-4">Category Details</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Category Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Property Transfer" required />
            <Input label="Description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description" />
          </div>
          <div className="flex gap-4 flex-wrap">
            <div>
              <div className="text-sm font-medium text-brand-700 mb-2">Icon</div>
              <div className="flex flex-wrap gap-1.5">
                {ICONS.map(i => (
                  <button key={i} onClick={() => setIcon(i)} className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${icon === i ? 'bg-blue-100 ring-2 ring-blue-400' : 'hover:bg-brand-100'}`}>
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-brand-700 mb-2">Color</div>
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)} className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-brand-400' : ''}`} style={{ background: c }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Fields Builder */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-brand-900">Form Fields <span className="text-brand-400 font-normal">({fields.length})</span></h3>
          <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={addField}>Add Field</Button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {fields.map(field => (
                <SortableField
                  key={field.id}
                  field={field}
                  onUpdate={u => updateField(field.id, u)}
                  onDelete={() => deleteField(field.id)}
                  expanded={expandedId === field.id}
                  onToggle={() => setExpandedId(expandedId === field.id ? null : field.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <button
          onClick={addField}
          className="mt-3 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-brand-200 rounded-xl text-sm text-brand-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
        >
          <Plus size={16} /> Add another field
        </button>
      </div>
    </div>
  )
}
