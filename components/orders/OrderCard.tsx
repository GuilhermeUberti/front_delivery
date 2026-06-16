import { Clock, MapPin, CreditCard, Smartphone } from 'lucide-react'
import type { Order } from '@/types'

interface Props {
  order: Order
  onAdvance: (order: Order) => void
  advancing: boolean
}

const ADVANCE_LABEL: Record<string, string> = {
  pending: 'Aguardando pagamento',
  confirmed: 'Iniciar preparo',
  preparing: 'Marcar como pronto',
  ready: 'Confirmar entrega',
}

const PAYMENT_LABEL: Record<string, string> = {
  pix: 'Pix',
  credit_card: 'Cartão crédito',
  debit_card: 'Cartão débito',
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (diff < 1) return 'agora'
  if (diff < 60) return `${diff}min`
  return `${Math.floor(diff / 60)}h${diff % 60 > 0 ? `${diff % 60}min` : ''}`
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default function OrderCard({ order, onAdvance, advancing }: Props) {
  const isPending = order.status === 'pending'
  const actionLabel = ADVANCE_LABEL[order.status]
  const shortId = order.id.slice(0, 8).toUpperCase()

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-mono text-xs font-bold text-gray-500">#{shortId}</span>
          {order.payment_status === 'awaiting' && (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
              Aguard. pgto
            </span>
          )}
        </div>
        <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
          <Clock size={12} />
          {timeAgo(order.created_at)}
        </span>
      </div>

      {/* Items */}
      <ul className="space-y-0.5">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-700">
              <span className="font-medium">{item.quantity}x</span> {item.name}
            </span>
            <span className="text-gray-500 shrink-0 ml-2">
              {formatPrice(Number(item.price) * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-gray-100 pt-2 space-y-1.5">
        {order.address && (
          <div className="flex items-start gap-1.5 text-xs text-gray-500">
            <MapPin size={12} className="mt-0.5 shrink-0" />
            <span className="line-clamp-2">{order.address}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          {order.payment_method === 'pix' ? <Smartphone size={12} /> : <CreditCard size={12} />}
          <span>{PAYMENT_LABEL[order.payment_method ?? ''] ?? '—'}</span>
          <span className="ml-auto font-semibold text-gray-900">{formatPrice(Number(order.total))}</span>
        </div>
      </div>

      {/* Action */}
      {!isPending && actionLabel && order.status !== 'delivered' && (
        <button
          onClick={() => onAdvance(order)}
          disabled={advancing}
          className="w-full py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white transition-colors"
        >
          {advancing ? 'Atualizando...' : actionLabel}
        </button>
      )}
    </div>
  )
}
