'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { api } from '@/lib/api'
import type { AnalyticsSummary, RevenueDay, TopItem, PeakHour } from '@/types'

type Period = 'day' | 'week' | 'month'

function formatPrice(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function PeriodTab({ value, active, onClick }: { value: Period; active: boolean; onClick: () => void }) {
  const labels: Record<Period, string> = { day: 'Hoje', week: 'Semana', month: 'Mês' }
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {labels[value]}
    </button>
  )
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('week')
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [revenue, setRevenue] = useState<RevenueDay[]>([])
  const [topItems, setTopItems] = useState<TopItem[]>([])
  const [peakHours, setPeakHours] = useState<PeakHour[]>([])
  const [customers, setCustomers] = useState<{ new: number; returning: number } | null>(null)

  useEffect(() => {
    const p = `?period=${period}`
    Promise.all([
      api.get<AnalyticsSummary>(`/analytics/summary${p}`),
      api.get<RevenueDay[]>(`/analytics/revenue${p}`),
      api.get<TopItem[]>(`/analytics/top-items${p}`),
      api.get<PeakHour[]>(`/analytics/peak-hours${p}`),
      api.get<{ new: number; returning: number }>(`/analytics/customers${p}`),
    ]).then(([s, r, t, ph, c]) => {
      setSummary(s)
      setRevenue(r)
      setTopItems(t)
      setPeakHours(ph)
      setCustomers(c)
    }).catch(() => {})
  }, [period])

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(['day', 'week', 'month'] as Period[]).map((p) => (
            <PeriodTab key={p} value={p} active={period === p} onClick={() => setPeriod(p)} />
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Faturamento', value: summary ? formatPrice(summary.total_revenue) : '—' },
          { label: 'Pedidos', value: String(summary?.total_orders ?? '—') },
          { label: 'Ticket médio', value: summary ? formatPrice(summary.average_ticket) : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Faturamento por dia</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={revenue}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
            <Tooltip formatter={(v: number) => formatPrice(v)} labelFormatter={(l) => `Dia: ${l}`} />
            <Area type="monotone" dataKey="revenue" stroke="#16a34a" fill="url(#revenueGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top items */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Itens mais vendidos</h2>
          {topItems.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sem dados ainda</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topItems} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v: number) => [`${v} und`, 'Vendidos']} />
                <Bar dataKey="quantity_sold" fill="#16a34a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Peak hours */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Horários de pico</h2>
          {peakHours.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sem dados ainda</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" tickFormatter={(h) => `${h}h`} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v} pedidos`, 'Pedidos']} labelFormatter={(h) => `${h}:00h`} />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Customers */}
      {customers && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Clientes</h2>
          <div className="flex gap-8">
            <div>
              <p className="text-3xl font-bold text-green-600">{customers.new}</p>
              <p className="text-sm text-gray-500">Novos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-500">{customers.returning}</p>
              <p className="text-sm text-gray-500">Recorrentes</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
