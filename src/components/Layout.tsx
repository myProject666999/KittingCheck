import { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { ClipboardList, PackagePlus, LayoutDashboard, CheckCircle, ChevronRight, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: '订单管理', icon: ClipboardList, path: '/orders' },
  { label: '入库核对', icon: PackagePlus, path: '/inbound' },
  { label: '齐套看板', icon: LayoutDashboard, path: '/kanban' },
  { label: '放行管理', icon: CheckCircle, path: '/release' },
]

const breadcrumbMap: Record<string, string> = {
  '/orders': '订单管理',
  '/orders/create': '新建订单',
  '/inbound': '入库核对',
  '/inbound/records': '入库记录',
  '/kanban': '齐套看板',
  '/kanban/shortages': '缺件汇总',
  '/release': '放行管理',
}

function getBreadcrumbs(pathname: string) {
  const crumbs: { label: string; path: string }[] = []
  if (pathname.startsWith('/orders')) {
    crumbs.push({ label: '订单管理', path: '/orders' })
    if (pathname === '/orders/create') {
      crumbs.push({ label: '新建订单', path: '/orders/create' })
    } else if (pathname.match(/^\/orders\/\d+$/)) {
      crumbs.push({ label: '订单详情', path: pathname })
    }
  } else if (pathname.startsWith('/inbound')) {
    crumbs.push({ label: '入库核对', path: '/inbound' })
    if (pathname === '/inbound/records') {
      crumbs.push({ label: '入库记录', path: '/inbound/records' })
    }
  } else if (pathname.startsWith('/kanban')) {
    crumbs.push({ label: '齐套看板', path: '/kanban' })
    if (pathname === '/kanban/shortages') {
      crumbs.push({ label: '缺件汇总', path: '/kanban/shortages' })
    }
  } else if (pathname.startsWith('/release')) {
    crumbs.push({ label: '放行管理', path: '/release' })
  }
  return crumbs
}

export default function Layout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const breadcrumbs = getBreadcrumbs(location.pathname)

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div
        className={cn(
          'fixed inset-0 bg-black/40 z-30 lg:hidden transition-opacity',
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={cn(
          'fixed lg:static z-40 h-full w-[220px] flex-shrink-0 transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ backgroundColor: '#1E3A5F' }}
      >
        <div className="flex items-center h-16 px-5 border-b border-white/10">
          <PackagePlus className="w-6 h-6 text-emerald-400 mr-2" />
          <span className="text-white font-bold text-base tracking-wide">齐套检查系统</span>
        </div>
        <nav className="mt-4 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive(item.path)
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              className="lg:hidden p-1 rounded hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center text-sm text-gray-500">
              <span className="text-gray-400">首页</span>
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.path} className="flex items-center">
                  <ChevronRight className="w-4 h-4 mx-1 text-gray-300" />
                  <span className={i === breadcrumbs.length - 1 ? 'text-gray-800 font-medium' : 'text-gray-500'}>
                    {crumb.label}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-5">
          <div className="bg-white rounded-lg shadow-sm">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
