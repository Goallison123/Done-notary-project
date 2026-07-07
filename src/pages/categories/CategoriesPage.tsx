import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderOpen, MoreHorizontal, Edit, Trash2, FileText, Sparkles } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'

export default function CategoriesPage() {
  const { categories, deleteCategory } = useApp()
  const navigate = useNavigate()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const confirmDelete = () => {
    if (deleteId) {
      deleteCategory(deleteId)
      setDeleteId(null)
    }
  }

  const totalRequests = categories.reduce((sum, c) => sum + (c.requestCount || 0), 0)

  return (
    <div className="p-5 md:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-brand-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Categories</h1>
          <p className="text-sm text-brand-500 mt-0.5">
            {categories.length} template{categories.length !== 1 ? 's' : ''} · {totalRequests} requests total
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={15} />} onClick={() => navigate('/dashboard/categories/new')}>
          New Category
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.slice(0, 4).map(cat => (
          <div
            key={cat.id}
            className="flex items-center gap-3 p-3.5 bg-white border border-brand-200 rounded-2xl hover:border-brand-300 hover:shadow-sm transition-all cursor-pointer"
            onClick={() => navigate(`/dashboard/categories/${cat.id}/edit`)}
          >
            <div className="text-2xl flex-shrink-0">{cat.icon}</div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-brand-800 truncate">{cat.name}</div>
              <div className="text-xs text-brand-400">{cat.requestCount || 0} requests</div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="relative group">
            <div
              className="bg-white border border-brand-200 rounded-2xl p-5 hover:shadow-md hover:border-brand-300 cursor-pointer transition-all flex flex-col gap-4"
              onClick={() => navigate(`/dashboard/categories/${cat.id}/edit`)}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: cat.color + '18' }}>
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-brand-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{cat.name}</h3>
                    <div className="text-xs text-brand-400 mt-0.5">{cat.fields.length} field{cat.fields.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>

                <button
                  onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === cat.id ? null : cat.id) }}
                  className="p-1.5 rounded-xl text-brand-300 hover:text-brand-600 hover:bg-brand-100 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <MoreHorizontal size={16} />
                </button>

                {/* Dropdown */}
                {openMenu === cat.id && (
                  <div
                    className="absolute right-4 top-14 bg-white border border-brand-200 rounded-2xl shadow-xl z-20 py-1.5 w-44 overflow-hidden"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-brand-700 hover:bg-brand-50 transition-colors"
                      onClick={() => { navigate(`/dashboard/categories/${cat.id}/edit`); setOpenMenu(null) }}
                    >
                      <Edit size={14} className="text-blue-500" /> Edit template
                    </button>
                    <button
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-brand-700 hover:bg-brand-50 transition-colors"
                      onClick={() => { navigate('/dashboard/requests/new'); setOpenMenu(null) }}
                    >
                      <Plus size={14} className="text-green-500" /> New request
                    </button>
                    <div className="mx-3 my-1 border-t border-brand-100" />
                    <button
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => { setDeleteId(cat.id); setOpenMenu(null) }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>

              {cat.description && (
                <p className="text-xs text-brand-500 leading-relaxed">{cat.description}</p>
              )}

              {/* Field preview */}
              <div className="flex flex-wrap gap-1.5">
                {cat.fields.slice(0, 5).map(f => (
                  <span key={f.id} className="text-[10px] bg-brand-50 border border-brand-100 text-brand-500 px-2 py-0.5 rounded-full">
                    {f.label}
                  </span>
                ))}
                {cat.fields.length > 5 && (
                  <span className="text-[10px] bg-brand-50 border border-brand-100 text-brand-400 px-2 py-0.5 rounded-full">
                    +{cat.fields.length - 5} more
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-brand-100">
                <div className="flex items-center gap-1.5 text-xs text-brand-400">
                  <FileText size={11} />
                  <span>{cat.requestCount ?? 0} requests</span>
                </div>
                <div
                  className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: cat.color + '18', color: cat.color }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
                  Active
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add new card */}
        <button
          onClick={() => navigate('/dashboard/categories/new')}
          className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-brand-200 rounded-2xl text-brand-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all min-h-44 group"
        >
          <div className="w-11 h-11 rounded-2xl border-2 border-dashed border-current flex items-center justify-center transition-all">
            <Plus size={20} />
          </div>
          <span className="text-sm font-semibold">Add Category</span>
          <span className="text-xs text-brand-400 group-hover:text-blue-400">Create a new form template</span>
        </button>
      </div>

      {/* Empty state */}
      {categories.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FolderOpen size={28} className="text-brand-300" />
          </div>
          <h3 className="text-base font-bold text-brand-700 mb-2">No categories yet</h3>
          <p className="text-sm text-brand-500 mb-6 max-w-xs mx-auto">
            Create your first form category to start collecting client information digitally.
          </p>
          <Button variant="primary" icon={<Sparkles size={14} />} onClick={() => navigate('/dashboard/categories/new')}>
            Create first category
          </Button>
        </div>
      )}

      {/* Delete modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Category"
        size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} icon={<Trash2 size={14} />}>Delete permanently</Button>
          </div>
        }
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <p className="text-sm text-brand-600 leading-relaxed">
            Are you sure you want to delete this category? The template will be removed, but existing request records will be preserved. This cannot be undone.
          </p>
        </div>
      </Modal>

      {openMenu && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}
    </div>
  )
}
