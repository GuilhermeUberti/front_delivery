'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, TrendingUp, Ticket, XCircle } from 'lucide-react'
import { api } from '@/lib/api'
import type { Order, OrderSummary } from '@/types'

function formatPrice(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string
  value: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{label}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<OrderSummary | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])

  useEffect(() => {
    api.get<OrderSummary>('/orders/today/summary').then(setSummary).catch(() => {})
    api.get<Order[]>('/orders').then((data) => {
      setRecentOrders(data.slice(0, 5))
    }).catch(() => {})
  }, [])

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Resumo do dia de hoje</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pedidos hoje"
          value={String(summary?.total_orders ?? '—')}
          icon={ShoppingBag}
          color="bg-blue-500"
        />
        <StatCard
          label="Faturamento"
          value={summary ? formatPrice(summary.total_revenue) : '—'}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          label="Ticket médio"
          value={summary ? formatPrice(summary.average_ticket) : '—'}
          icon={Ticket}
          color="bg-purple-500"
        />
        <StatCard
          label="Cancelamentos"
          value={String(summary?.cancelled_orders ?? '—')}
          icon={XCircle}
          color="bg-red-400"
        />
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Pedidos recentes</h2>
          <Link href="/orders" className="text-sm text-green-600 hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Nenhum pedido hoje ainda</p>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-gray-500">{order.items.length} {order.items.length === 1 ? 'item' : 'itens'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatPrice(Number(order.total))}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
