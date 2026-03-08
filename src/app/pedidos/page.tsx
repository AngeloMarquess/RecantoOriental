import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Clock, Package, Truck, CheckCircle2, AlertCircle } from "lucide-react"

const statusMap: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  'pending': { label: 'Aguardando', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
  'preparing': { label: 'Em Preparo', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
  'delivering': { label: 'Em Entrega', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
  'delivered': { label: 'Entregue', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  'cancelled': { label: 'Cancelado', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
}

export default async function PedidosPage() {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch user orders
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user orders:', error)
  }

  const formatPrice = (price: number) => `R$ ${Number(price).toFixed(2).replace('.', ',')}`
  const formatDate = (ts: string) => new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' })

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-stone-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-stone-500 hover:text-stone-800 transition p-2 -ml-2" suppressHydrationWarning>
            <ChevronLeft size={24} />
          </Link>
          <h1 className="font-bold text-lg text-stone-800">Meus Pedidos</h1>
          <div className="w-8" />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        {!orders || orders.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 text-center">
            <div className="bg-stone-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
              <Package size={32} />
            </div>
            <h2 className="text-lg font-bold text-stone-800 mb-2">Nenhum pedido ainda</h2>
            <p className="text-stone-500 text-sm mb-6">Que tal experimentar nossas delícias?</p>
            <Link href="/" className="inline-block bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-primary/90 transition">
              Ver Cardápio
            </Link>
          </div>
        ) : (
          orders.map((order: any) => {
            const currentStatus = order.status || 'pending'
            const statusInfo = statusMap[currentStatus] || statusMap['pending']

            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition">
                <div className="p-4 border-b border-stone-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded">
                      #{order.id.split('-')[0].toUpperCase()}
                    </span>
                    <span className="text-xs text-stone-500 flex items-center gap-1">
                      <Clock size={12}/> {formatDate(order.created_at)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`p-1.5 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                      <statusInfo.icon size={16} />
                    </div>
                    <span className={`text-sm font-bold ${statusInfo.color}`}>{statusInfo.label}</span>
                  </div>

                  <div className="space-y-1 mb-4">
                    {order.order_items?.slice(0, 2).map((item: any, idx: number) => (
                      <p key={idx} className="text-sm text-stone-600 truncate">
                        <span className="font-medium">{item.quantity}x</span> {item.products?.name || 'Produto indisponível'}
                      </p>
                    ))}
                    {order.order_items?.length > 2 && (
                      <p className="text-xs text-stone-400 italic">
                        + {order.order_items.length - 2} outro(s) item(ns)
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <span className="font-black text-primary">{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
                
                <Link 
                  href={`/pedidos/${order.id}`} 
                  className="w-full bg-stone-50 py-3 px-4 text-sm font-bold text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition flex items-center justify-center gap-1"
                >
                  Ver Acompanhamento <ChevronRight size={16} />
                </Link>
              </div>
            )
          })
        )}
      </main>
    </div>
  )
}
