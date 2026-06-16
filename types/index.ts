export interface User {
  id: string
  restaurant_id: string
  name: string
  email: string
  role: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
export type PaymentStatus = 'awaiting' | 'paid' | 'failed' | 'refunded'
export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | null

export interface OrderItem {
  id: string
  menu_item_id: string | null
  name: string
  price: number
  quantity: number
  notes: string | null
}

export interface Order {
  id: string
  restaurant_id: string
  customer_id: string
  status: OrderStatus
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  payment_ref: string | null
  subtotal: number
  delivery_fee: number
  total: number
  address: string | null
  notes: string | null
  created_at: string
  updated_at: string
  items: OrderItem[]
}

export interface OrderSummary {
  total_orders: number
  total_revenue: number
  average_ticket: number
  cancelled_orders: number
}

export interface Category {
  id: string
  restaurant_id: string
  name: string
  position: number
  active: boolean
  items: MenuItem[]
}

export interface MenuItem {
  id: string
  restaurant_id: string
  category_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  active: boolean
  position: number
}

export interface Customer {
  id: string
  restaurant_id: string
  whatsapp: string
  name: string | null
  address: string | null
  created_at: string
}

export interface CustomerDetail extends Customer {
  summary: {
    total_orders: number
    total_spent: number
    last_order_at: string | null
  }
}

export interface RevenueDay {
  day: string
  orders: number
  revenue: number
}

export interface TopItem {
  name: string
  quantity_sold: number
  revenue: number
}

export interface PeakHour {
  hour: number
  orders: number
}

export interface AnalyticsSummary {
  period: string
  total_orders: number
  total_revenue: number
  average_ticket: number
}

export interface Restaurant {
  id: string
  name: string
  whatsapp_number: string
  pix_key: string | null
  delivery_fee: number | null
  delivery_radius: number | null
  open_time: string | null
  close_time: string | null
  active: boolean
  zapi_instance: string | null
  zapi_token: string | null
}
