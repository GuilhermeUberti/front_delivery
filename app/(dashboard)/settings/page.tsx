'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import type { Restaurant } from '@/types'

type Form = {
  name: string
  pix_key: string
  delivery_fee: string
  delivery_radius: string
  open_time: string
  close_time: string
  zapi_instance: string
  zapi_token: string
}

export default function SettingsPage() {
  const [form, setForm] = useState<Form>({
    name: '',
    pix_key: '',
    delivery_fee: '',
    delivery_radius: '',
    open_time: '',
    close_time: '',
    zapi_instance: '',
    zapi_token: '',
  })
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const me = await api.get<{ restaurant_id: string }>('/auth/me')
        setRestaurantId(me.restaurant_id)
        const r = await api.get<Restaurant>(`/settings/restaurant`)
        setForm({
          name: r.name ?? '',
          pix_key: r.pix_key ?? '',
          delivery_fee: r.delivery_fee?.toString() ?? '',
          delivery_radius: r.delivery_radius?.toString() ?? '',
          open_time: r.open_time ?? '',
          close_time: r.close_time ?? '',
          zapi_instance: r.zapi_instance ?? '',
          zapi_token: r.zapi_token ?? '',
        })
      } catch { } finally { setLoading(false) }
    }
    load()
  }, [])

  function set(field: keyof Form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch('/settings/restaurant', {
        name: form.name,
        pix_key: form.pix_key || null,
        delivery_fee: form.delivery_fee ? parseFloat(form.delivery_fee) : null,
        delivery_radius: form.delivery_radius ? parseInt(form.delivery_radius) : null,
        open_time: form.open_time || null,
        close_time: form.close_time || null,
        zapi_instance: form.zapi_instance || null,
        zapi_token: form.zapi_token || null,
      })
      toast.success('Configurações salvas!')
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Carregando...</div>

  return (
    <div className="p-4 lg:p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500">Dados do seu restaurante</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <Section title="Dados do estabelecimento">
          <Field label="Nome do restaurante">
            <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Horário de abertura">
              <input type="time" value={form.open_time} onChange={(e) => set('open_time', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Horário de fechamento">
              <input type="time" value={form.close_time} onChange={(e) => set('close_time', e.target.value)} className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* Delivery */}
        <Section title="Entrega">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Taxa de entrega (R$)">
              <input type="number" step="0.01" min="0" value={form.delivery_fee} onChange={(e) => set('delivery_fee', e.target.value)} className={inputCls} placeholder="0,00" />
            </Field>
            <Field label="Raio máximo (km)">
              <input type="number" min="0" value={form.delivery_radius} onChange={(e) => set('delivery_radius', e.target.value)} className={inputCls} placeholder="5" />
            </Field>
          </div>
        </Section>

        {/* Payment */}
        <Section title="Pagamento">
          <Field label="Chave Pix" hint="CPF, CNPJ, e-mail, telefone ou chave aleatória">
            <input value={form.pix_key} onChange={(e) => set('pix_key', e.target.value)} className={inputCls} placeholder="sua@chave.pix" />
          </Field>
        </Section>

        {/* Z-API */}
        <Section title="Integração WhatsApp (Z-API)">
          <Field label="Instance ID">
            <input value={form.zapi_instance} onChange={(e) => set('zapi_instance', e.target.value)} className={inputCls} placeholder="Ex: B9BXXXXX" />
          </Field>
          <Field label="Token">
            <input type="password" value={form.zapi_token} onChange={(e) => set('zapi_token', e.target.value)} className={inputCls} placeholder="••••••••" />
          </Field>
          <p className="text-xs text-gray-400">
            Encontre esses dados no painel da Z-API em <em>Instâncias → sua instância</em>.
            Configure o webhook apontando para <code className="bg-gray-100 px-1 rounded">/bot/webhook</code>.
          </p>
        </Section>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
        >
          {saving ? 'Salvando...' : 'Salvar configurações'}
        </button>
      </form>
    </div>
  )
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <h2 className="font-semibold text-gray-900 text-sm">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}
