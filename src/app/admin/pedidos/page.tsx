import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { redirect } from "next/navigation"
import OrdersDashboardClient from "./OrdersDashboardClient"

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Ensure Admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    console.warn('User attempted to access admin pedidos without permission:', user.email);
    // redirect('/') 
  }

  // Fetch all recent orders (limit to 100 on the server for performance, and we subscribe to news)
  // We order by created_at DESC so newest are first.
  const { data: initialOrders, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*, products(*)), profiles!orders_customer_id_fkey(full_name, phone_number)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching admin orders:', JSON.stringify(error, null, 2))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Gestão de Pedidos (Live)</h1>
      </div>
      
      {/* Client component that handles the Kanban / List view and Realtime subscriptions */}
      <OrdersDashboardClient initialOrders={initialOrders || []} />
    </div>
  )
}
