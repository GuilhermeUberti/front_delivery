'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { User } from '@/types'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/orders', label: 'Pedidos', icon: ShoppingBag },
  { href: '/menu', label: 'Cardápio', icon: UtensilsCrossed },
  { href: '/customers', label: 'Clientes', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, setUser, setLoading } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    api.get<User>('/auth/me')
      .then(setUser)
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [])

  async function handleLogout() {
    await api.post('/auth/logout').catch(() => {})
    router.push('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-56 bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-14 flex items-center px-5 border-b border-gray-200 shrink-0">
          <span className="font-bold text-green-600 text-lg">ZaPedido</span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden h-14 bg-white border-b border-gray-200 flex items-center px-4 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <span className="ml-3 font-bold text-green-600">ZaPedido</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
