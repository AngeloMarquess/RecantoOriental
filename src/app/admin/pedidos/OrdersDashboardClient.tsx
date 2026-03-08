'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Clock, Package, Truck, CheckCircle2, AlertCircle, Phone, MapPin, ChevronRight } from 'lucide-react'
import { updateOrderStatus } from '../actions'

// Type definition for the dashboard
type Order = {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  payment_method: string;
  payment_status: string;
  profiles: {
    full_name: string;
    phone_number: string;
  };
  order_items: {
    quantity: number;
    unit_price: number;
    extras?: { id: string, name: string, quantity: number, price: number }[];
    comment?: string;
    products: {
      name: string;
    }
  }[]
}

const statusColumns = [
  { id: 'pending', title: 'Novos', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  { id: 'preparing', title: 'Preparo', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'out_for_delivery', title: 'Entrega', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  { id: 'delivered', title: 'Entregues', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  { id: 'cancelled', title: 'Cancelados', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
]

export default function OrdersDashboardClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to all changes on the orders table
    const channel = supabase
      .channel('admin_orders_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Realtime Order Event:', payload)

          if (payload.eventType === 'INSERT') {
            // A completely new order arrived. We lack the JOIN data (profiles, items) in the simple payload.
            // Let's refetch this specific order to get the full shape, then prepend it.
            fetchFullOrder(payload.new.id)
          }
          else if (payload.eventType === 'UPDATE') {
            // Update the specific order in our state array.
            setOrders(currentOrders =>
              currentOrders.map(o =>
                o.id === payload.new.id ? { ...o, ...payload.new } : o
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const fetchFullOrder = async (orderId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), profiles!orders_customer_id_fkey(full_name, phone_number)')
      .eq('id', orderId)
      .single()

    if (data && !error) {
      // Play a sound (optional UX, skipped for now to avoid browser autoplay restrictions)
      setOrders(current => [data, ...current])
    }
  }

  const handleStatusChange = async (orderId: string, currentStatus: string) => {
    // Define the forward flow
    const flow = ['pending', 'preparing', 'out_for_delivery', 'delivered']
    const currentIndex = flow.indexOf(currentStatus)

    if (currentIndex === -1 || currentIndex === flow.length - 1) return // Already delivered or cancelled

    const nextStatus = flow[currentIndex + 1]

    setLoadingOrderId(orderId)
    const result = await updateOrderStatus(orderId, nextStatus)
    setLoadingOrderId(null)

    if (result.error) {
      alert('Erro ao atualizar status: ' + result.error)
    }
    // Note: If successful, we don't need to manually update state here.
    // The Supabase Realtime subscription will catch the UPDATE and auto-update the UI!
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este pedido?')) return;

    setLoadingOrderId(orderId)
    await updateOrderStatus(orderId, 'cancelled')
    setLoadingOrderId(null)
  }

  const formatPrice = (price: number) => `R$ ${Number(price).toFixed(2).replace('.', ',')}`
  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[70vh] snap-x">
      {statusColumns.map((col) => {
        const columnOrders = orders.filter(o => o.status === col.id)

        return (
          <div key={col.id} className={`flex-shrink-0 w-80 md:w-96 rounded-2xl border ${col.border} bg-white shadow-sm flex flex-col max-h-[85vh] snap-center`}>

            {/* Column Header */}
            <div className={`p-4 rounded-t-2xl border-b ${col.border} ${col.bg} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <col.icon size={20} className={col.color} />
                <h2 className={`font-bold ${col.color}`}>{col.title}</h2>
              </div>
              <span className="bg-white px-2 py-1 rounded-full text-xs font-bold text-stone-600 shadow-sm border border-stone-100">
                {columnOrders.length}
              </span>
            </div>

            {/* Column Body (Cards) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-stone-50/50">
              {columnOrders.length === 0 ? (
                <div className="text-center py-10 text-stone-400 text-sm font-medium">Vazio</div>
              ) : (
                columnOrders.map(order => (
                  <div key={order.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition">

                    {/* Card Header (ID + Time) */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded">
                        #{order.id.split('-')[0].toUpperCase()}
                      </span>
                      <span className="text-xs font-medium text-stone-400 flex items-center gap-1">
                        <Clock size={12} /> {formatTime(order.created_at)}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-4">
                      <h3 className="font-bold text-stone-800 text-sm">{order.profiles?.full_name || 'Cliente'}</h3>
                      <div className="mt-2 space-y-1.5">
                        <p className="text-xs text-stone-500 flex items-start gap-1.5 leading-tight">
                          <MapPin size={14} className="shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{order.delivery_address}</span>
                        </p>
                        <p className="text-xs text-stone-500 flex items-center gap-1.5">
                          <Phone size={14} className="shrink-0" />
                          <span>{order.profiles?.phone_number || 'S/N'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100 mb-4">
                      <ul className="space-y-2">
                        {order.order_items?.map((item, idx) => (
                          <li key={idx} className="text-xs text-stone-700 flex flex-col border-b border-stone-100 last:border-0 pb-1.5 last:pb-0">
                            <span className="truncate pr-2"><span className="font-bold">{item.quantity}x</span> {item.products?.name}</span>

                            {item.extras && item.extras.length > 0 && (
                              <div className="pl-4 mt-1 space-y-0.5 text-stone-500 text-[11px]">
                                {item.extras.map((extra, eIdx) => (
                                  <div key={eIdx}>+ {extra.quantity}x {extra.name}</div>
                                ))}
                              </div>
                            )}

                            {item.comment && (
                              <div className="pl-4 mt-0.5 italic text-stone-500 text-[11px] font-medium text-orange-600/80">
                                Obs: {item.comment}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 pt-2 border-t border-stone-200 flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-stone-500">
                            {order.payment_method === 'cash' ? 'Dinheiro' :
                              order.payment_method === 'online_stripe' ? 'Online (Stripe)' : 'Cartão (Máquina)'}
                          </span>
                          {order.payment_method === 'online_stripe' && (
                            <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded w-fit mt-0.5 ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                              order.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                              {order.payment_status === 'paid' ? 'PAGO' :
                                order.payment_status === 'failed' ? 'FALHOU' : 'AGUARDANDO PIX/CARTÃO'}
                            </span>
                          )}
                        </div>
                        <span className="font-black text-primary text-sm">{formatPrice(order.total_amount)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto pt-1">
                      {/* Cancel Button - Only for early stages */}
                      {['pending', 'preparing'].includes(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={loadingOrderId === order.id}
                          className="flex-1 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      )}

                      {/* Advance Button - Only if there is a next step */}
                      {['pending', 'preparing', 'out_for_delivery'].includes(order.status) && (
                        <button
                          onClick={() => handleStatusChange(order.id, order.status)}
                          disabled={loadingOrderId === order.id}
                          className="flex-[2] py-2 px-2 text-xs font-bold text-white bg-stone-900 hover:bg-primary rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-1 shadow-sm"
                        >
                          {loadingOrderId === order.id ? '...' :
                            order.status === 'pending' ? 'Preparar' :
                              order.status === 'preparing' ? 'Despachar' :
                                'Finalizar'
                          }
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
