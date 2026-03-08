'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

type OrderPayload = {
  address: string;
  reference?: string;
  paymentMethod: string;
  totalAmount: number;
  items: {
    cartItemId: string;
    id: string; // product_id
    name?: string;
    quantity: number;
    price: number;
    extras?: any;
    comment?: string;
  }[]
}

export async function createOrder(payload: OrderPayload) {
  const supabase = await createClient()

  // 1. Check if user is logged in
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Você precisa estar logado para finalizar o pedido.' }
  }

  // 2. We use the admin client for inserts to bypass RLS if needed, or normal client if RLS allows it.
  // Since we don't have a specific policy for customers inserting orders yet, using AdminClient ensures it works.
  const adminSupabase = createAdminClient()

  try {
    // 3. Insert the Order
    const { data: order, error: orderError } = await adminSupabase
      .from('orders')
      .insert({
        customer_id: user.id,
        status: 'pending',
        total_amount: payload.totalAmount,
        delivery_address: `${payload.address}${payload.reference ? ' - ' + payload.reference : ''}`,
        payment_method: payload.paymentMethod === 'dinheiro' ? 'cash' :
          payload.paymentMethod === 'online' ? 'online_stripe' : 'card_machine'
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return { error: `Erro banco (Orders): ${orderError.message || orderError.details || JSON.stringify(orderError)}` }
    }

    // 4. Insert Order Items
    const orderItems = payload.items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      extras: item.extras || null,
      comment: item.comment || null
    }))

    const { error: itemsError } = await adminSupabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Note: In a real production app, we would rollback the order creation here (transactions).
      return { error: `Erro banco (Items): ${itemsError.message || itemsError.details || JSON.stringify(itemsError)}` }
    }

    return { success: true, orderId: order.id }

  } catch (err) {
    console.error('Unexpected checkout error:', err)
    return { error: 'Ocorreu um erro inesperado.' }
  }
}
