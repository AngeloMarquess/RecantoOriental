import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, Tags, LogOut, ShoppingBag, Settings, TicketPercent } from 'lucide-react'
import { logout } from '../auth/actions'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Protect all admin routes
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch the user's role from the profile table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    console.warn('User attempted to access admin panel without permission:', user.email);
    // Redirect non-admins to the home page
    // Uncomment below when ready to strictly enforce
    // redirect('/')
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 text-white flex flex-col hidden md:flex">
        <div className="p-6">
          <h2 className="text-xl font-bold text-primary uppercase tracking-wide">Admin</h2>
          <p className="text-xs text-stone-400 mt-1">Recanto Oriental</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition">
            <LayoutDashboard size={18} /> Resumo
          </Link>
          <Link href="/admin/pedidos" className="flex items-center gap-3 px-3 py-2 text-primary font-bold hover:text-white hover:bg-stone-800 rounded-lg transition">
            <ShoppingBag size={18} /> Pedidos
          </Link>
          <Link href="/admin/categories" className="flex items-center gap-3 px-3 py-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition">
            <Tags size={18} /> Categorias
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition">
            <Package size={18} /> Produtos
          </Link>
          <Link href="/admin/cupons" className="flex items-center gap-3 px-3 py-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition">
            <TicketPercent size={18} /> Cupons
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition">
            <Settings size={18} /> Configurações
          </Link>
        </nav>

        <div className="p-4 border-t border-stone-800">
          <form action={logout}>
            <button type="submit" className="flex items-center gap-3 px-3 py-2 w-full text-left text-red-400 hover:text-red-300 hover:bg-stone-800 rounded-lg transition" suppressHydrationWarning>
              <LogOut size={18} /> Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-stone-900 p-4 text-white flex justify-between items-center">
          <span className="font-bold text-primary">Admin Recanto</span>
          <div className="flex gap-4 text-sm">
            <Link href="/admin/pedidos" className="text-primary font-bold">Pedidos</Link>
            <Link href="/admin/categories">Cat</Link>
            <Link href="/admin/products">Prod</Link>
            <Link href="/admin/cupons">Cupons</Link>
            <Link href="/admin/settings">Conf</Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
