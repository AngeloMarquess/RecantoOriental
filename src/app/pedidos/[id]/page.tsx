import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import OrderTrackingClient from "./OrderTrackingClient"

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const { id } = resolvedParams

  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch initial Order data
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('id', id)
    .single()

  if (orderError || !order) {
    // If order not found or doesn't belong to rules, redirect
    console.error(orderError)
    redirect('/')
  }

  // Check if order belongs to the user
  if (order.customer_id !== user.id) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <OrderTrackingClient initialOrder={order} orderId={id} />
    </div>
  )
}
