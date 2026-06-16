'use client'

import { useEffect, useState } from 'react'
import { Search, Phone } from 'lucide-react'
import { api } from '@/lib/api'
import type { Customer, CustomerDetail } from '@/types'

function formatPrice(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR')
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<CustomerDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    const q = search ? `?search=${encodeURIComponent(search)}` : ''
    api.get<Customer[]>(`/customers${q}`)
      .then(setCustomers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search])

  async function loadDetail(id: string) {
    setLoadingDetail(true)
    try {
      const detail = await api.get<CustomerDetail>(`/customers/${id}`)
      setSelected(detail)
    } catch { } finally {
      setLoadingDetail(false)
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Clientes</h1>
        <p className="text-sm text-gray-500">{customers.length} clientes cadastrados</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou WhatsApp..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="flex gap-4">
        {/* List */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-12">Carregando...</p>
          ) : customers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">Nenhum cliente encontrado</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {customers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => loadDetail(c.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors ${
                    selected?.id === c.id ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-green-700">
                      {(c.name ?? c.whatsapp)[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.name ?? 'Sem nome'}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Phone size={11} /> {c.whatsapp}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 shrink-0">{formatDate(c.created_at)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="hidden lg:block w-72 bg-white border border-gray-200 rounded-xl p-5 space-y-4 self-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-lg font-bold text-green-700">
                  {(selected.name ?? selected.whatsapp)[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selected.name ?? 'Sem nome'}</p>
                <p className="text-xs text-gray-500">{selected.whatsapp}</p>
              </div>
            </div>

            {selected.address && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Endereço</p>
                <p className="text-sm text-gray-700">{selected.address}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-lg font-bold text-gray-900">{selected.summary.total_orders}</p>
                <p className="text-xs text-gray-500">Pedidos</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-lg font-bold text-gray-900">{formatPrice(Number(selected.summary.total_spent))}</p>
                <p className="text-xs text-gray-500">Total gasto</p>
              </div>
            </div>

            {selected.summary.last_order_at && (
              <p className="text-xs text-gray-400">
                Último pedido: {formatDate(selected.summary.last_order_at)}
              </p>
            )}

            <p className="text-xs text-gray-400">Cliente desde {formatDate(selected.created_at)}</p>
          </div>
        )}
      </div>
    </div>
  )
}
