'use client'

import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Image, ChevronDown, ChevronUp } from 'lucide-react'
import { api } from '@/lib/api'
import { uploadToR2 } from '@/lib/r2'
import type { Category, MenuItem } from '@/types'

function formatPrice(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

// ─── Category Modal ───────────────────────────────────────────────────────────

function CategoryModal({ initial, onSave, onClose }: {
  initial?: Category
  onSave: (data: { name: string }) => Promise<void>
  onClose: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try { await onSave({ name }) } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">{initial ? 'Editar categoria' : 'Nova categoria'}</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Item Modal ───────────────────────────────────────────────────────────────

function ItemModal({ categories, initial, onSave, onClose }: {
  categories: Category[]
  initial?: MenuItem
  onSave: (data: Partial<MenuItem>) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    price: initial?.price?.toString() ?? '',
    category_id: initial?.category_id ?? categories[0]?.id ?? '',
    image_url: initial?.image_url ?? '',
    active: initial?.active ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function set(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadToR2(file)
      set('image_url', url)
      toast.success('Imagem enviada!')
    } catch {
      toast.error('Erro ao enviar imagem')
    } finally {
      setUploading(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({ ...form, price: parseFloat(form.price) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 my-4">
        <h2 className="font-semibold text-gray-900">{initial ? 'Editar item' : 'Novo item'}</h2>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                value={form.category_id}
                onChange={(e) => set('category_id', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto</label>
            <div className="flex items-center gap-3">
              {form.image_url && (
                <img src={form.image_url} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <Image size={14} />
                {uploading ? 'Enviando...' : form.image_url ? 'Trocar foto' : 'Adicionar foto'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => set('active', e.target.checked)}
              className="w-4 h-4 rounded text-green-600"
            />
            <span className="text-sm text-gray-700">Item ativo (visível no cardápio)</span>
          </label>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [catModal, setCatModal] = useState<{ open: boolean; item?: Category }>({ open: false })
  const [itemModal, setItemModal] = useState<{ open: boolean; item?: MenuItem }>({ open: false })

  async function load() {
    try {
      const data = await api.get<Category[]>('/menu/categories')
      setCategories(data)
      if (expanded.size === 0) setExpanded(new Set(data.map((c) => c.id)))
    } catch { toast.error('Erro ao carregar cardápio') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function saveCategory(data: { name: string }) {
    try {
      if (catModal.item) {
        await api.patch(`/menu/categories/${catModal.item.id}`, data)
        toast.success('Categoria atualizada!')
      } else {
        await api.post('/menu/categories', data)
        toast.success('Categoria criada!')
      }
      setCatModal({ open: false })
      load()
    } catch (err: any) { toast.error(err.message) }
  }

  async function deleteCategory(id: string) {
    if (!confirm('Excluir esta categoria? Os itens não serão apagados.')) return
    try {
      await api.del(`/menu/categories/${id}`)
      toast.success('Categoria removida')
      load()
    } catch (err: any) { toast.error(err.message) }
  }

  async function saveItem(data: Partial<MenuItem>) {
    try {
      if (itemModal.item) {
        await api.patch(`/menu/items/${itemModal.item.id}`, data)
        toast.success('Item atualizado!')
      } else {
        await api.post('/menu/items', data)
        toast.success('Item criado!')
      }
      setItemModal({ open: false })
      load()
    } catch (err: any) { toast.error(err.message) }
  }

  async function deleteItem(id: string) {
    if (!confirm('Excluir este item?')) return
    try {
      await api.del(`/menu/items/${id}`)
      toast.success('Item removido')
      load()
    } catch (err: any) { toast.error(err.message) }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Carregando...</div>

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cardápio</h1>
          <p className="text-sm text-gray-500">{categories.length} categorias</p>
        </div>
        <button
          onClick={() => setCatModal({ open: true })}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Nova categoria
        </button>
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">Nenhuma categoria ainda.</p>
          <p className="text-sm">Crie uma categoria para começar a adicionar itens.</p>
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Category header */}
          <div className="flex items-center gap-3 px-5 py-4">
            <button onClick={() => toggleExpanded(cat.id)} className="flex-1 flex items-center gap-2 text-left">
              {expanded.has(cat.id) ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              <span className="font-semibold text-gray-900">{cat.name}</span>
              <span className="text-xs text-gray-400">({cat.items?.length ?? 0} itens)</span>
              {!cat.active && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">inativa</span>}
            </button>
            <button
              onClick={() => setItemModal({ open: true })}
              className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 font-medium px-3 py-1.5 border border-green-200 rounded-lg hover:bg-green-50"
            >
              <Plus size={13} />
              Item
            </button>
            <button onClick={() => setCatModal({ open: true, item: cat })} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
              <Pencil size={15} />
            </button>
            <button onClick={() => deleteCategory(cat.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50">
              <Trash2 size={15} />
            </button>
          </div>

          {/* Items */}
          {expanded.has(cat.id) && (
            <div className="border-t border-gray-100 divide-y divide-gray-50">
              {(cat.items ?? []).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">Nenhum item nesta categoria</p>
              )}
              {(cat.items ?? []).map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-3">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Image size={18} className="text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                      {!item.active && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full shrink-0">inativo</span>}
                    </div>
                    {item.description && <p className="text-xs text-gray-400 truncate">{item.description}</p>}
                  </div>
                  <span className="text-sm font-semibold text-gray-900 shrink-0">{formatPrice(Number(item.price))}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setItemModal({ open: true, item })} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {catModal.open && (
        <CategoryModal
          initial={catModal.item}
          onSave={saveCategory}
          onClose={() => setCatModal({ open: false })}
        />
      )}

      {itemModal.open && (
        <ItemModal
          categories={categories}
          initial={itemModal.item}
          onSave={saveItem}
          onClose={() => setItemModal({ open: false })}
        />
      )}
    </div>
  )
}
