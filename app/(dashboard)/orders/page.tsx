'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { RefreshCw } from 'lucide-react'
import OrderCard from '@/components/orders/OrderCard'
import { api } from '@/lib/api'
import type { Order, OrderStatus } from '@/types'

const POLL_INTERVAL = 5000

const COLUMNS: { label: string; statuses: OrderStatus[]; color: string }[] = [
  { label: 'Novos', statuses: ['pending', 'confirmed'], color: 'bg-blue-500' },
  { label: 'Em preparo', statuses: ['preparing'], color: 'bg-amber-500' },
  { label: 'Prontos', statuses: ['ready'], color: 'bg-green-500' },
]

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
}

function playAlert() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 520
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    osc.start()
    osc.stop(ctx.currentTime + 0.6)
  } catch {}
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [advancing, setAdvancing] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const seenIds = useRef<Set<string>>(new Set())
  const initialized = useRef(false)

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.get<Order[]>('/orders')
      const active = data.filter((o) => !['delivered', 'cancelled'].includes(o.status))
      setOrders(active)

      // Sound alert for new orders after initial load
      if (initialized.current) {
        active.forEach((o) => {
          if (!seenIds.current.has(o.id) && (o.status === 'pending' || o.status === 'confirmed')) {
            playAlert()
            toast('Novo pedido recebido!', { icon: '🛒' })
          }
        })
      }

      seenIds.current = new Set(active.map((o) => o.id))
      initialized.current = true
      setLastUpdated(new Date())
    } catch {
      // silently ignore polling errors
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchOrders])

  async function handleAdvance(order: Order) {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    setAdvancing(order.id)
    try {
      await api.patch(`/orders/${order.id}/status`, { status: next })
      await fetchOrders()
      toast.success('Status atualizado!')
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao atualizar status')
    } finally {
      setAdvancing(null)
    }
  }

  const totalActive = orders.length

  return (
    <div className="h-full flex flex-col p-4 lg:p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-sm text-gray-500">
            {totalActive} pedido{totalActive !== 1 ? 's' : ''} ativo{totalActive !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            Atualizado às {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={fetchOrders}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {COLUMNS.map(({ label, statuses, color }) => {
          const col = orders.filter((o) => statuses.includes(o.status))
          return (
            <div key={label} className="flex flex-col min-h-0">
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3 shrink-0">
                <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <h2 className="font-semibold text-gray-700 text-sm">{label}</h2>
                <span className="ml-auto bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  {col.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {col.length === 0 ? (
                  <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-sm text-gray-400">Nenhum pedido</p>
                  </div>
                ) : (
                  col.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onAdvance={handleAdvance}
                      advancing={advancing === order.id}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
