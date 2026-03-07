'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ChevronLeft, CheckCircle2, Package, Truck, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface OrderTrackingProps {
  initialOrder: any;
  orderId: string;
}

const statusMap: Record<string, { label: string; icon: any; color: string; step: number }> = {
  'pending': { label: 'Aguardando Confirmação', icon: Clock, color: 'text-orange-500', step: 1 },
  'preparing': { label: 'Em Preparo', icon: Package, color: 'text-blue-500', step: 2 },
  'delivering': { label: 'Saiu para Entrega', icon: Truck, color: 'text-purple-500', step: 3 },
  'delivered': { label: 'Entregue', icon: CheckCircle2, color: 'text-green-500', step: 4 },
  'cancelled': { label: 'Cancelado', icon: AlertCircle, color: 'text-red-500', step: 0 },
}

export default function OrderTrackingClient({ initialOrder, orderId }: OrderTrackingProps) {
  const [order, setOrder] = useState(initialOrder)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to realtime updates on the 'orders' table specifically for this order.id
    const channel = supabase
      .channel(`order_tracking_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log('Order status updated!', payload.new)
          setOrder((prev: any) => ({ ...prev, ...payload.new }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, supabase])

  const currentStatus = order.status || 'pending'
  const statusInfo = statusMap[currentStatus] || statusMap['pending']

  // Helper for timeline
  const getStepStatus = (stepIndicator: number) => {
    if (statusInfo.step === 0) return 'cancelled' // Cancelled aborts the pipeline
    if (stepIndicator < statusInfo.step) return 'completed'
    if (stepIndicator === statusInfo.step) return 'active'
    return 'pending'
  }

  const formatPrice = (price: number) => {
    return `R$ ${Number(price).toFixed(2).replace('.', ',')}`
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-stone-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-stone-500 hover:text-stone-800 transition p-2 -ml-2" suppressHydrationWarning>
            <ChevronLeft size={24} />
          </Link>
          <h1 className="font-bold text-lg text-stone-800">Acompanhamento</h1>
          <div className="w-8" />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        
        {/* Status Hero */}
        <section className={`bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center justify-center py-10 transition-colors ${currentStatus === 'cancelled' ? 'bg-red-50 border-red-100' : ''}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
            currentStatus === 'cancelled' ? 'bg-red-100 text-red-500' : 
            currentStatus === 'delivered' ? 'bg-green-100 text-green-500' : 
            'bg-orange-100 text-orange-500'
          } animate-pulse-slow`}>
            <statusInfo.icon size={40} />
          </div>
          <h2 className="text-2xl font-black text-stone-800 mb-1">{statusInfo.label}</h2>
          <p className="text-stone-500 text-sm">Pedido #{order.id.split('-')[0].toUpperCase()}</p>
        </section>

        {/* Visual Timeline */}
        {currentStatus !== 'cancelled' && (
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
            <h3 className="font-bold text-sm text-stone-800 mb-6 uppercase tracking-wider">Status do Pedido</h3>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-200 before:to-transparent">
              
              {/* Step 1: Confirmed */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${
                  getStepStatus(1) === 'completed' ? 'bg-green-500 text-white' : 
                  getStepStatus(1) === 'active' ? 'bg-orange-500 text-white animate-pulse' : 'bg-stone-200 text-stone-400'
                }`}>
                  <Clock size={14} />
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] ml-4 md:ml-0 md:p-4">
                  <h4 className={`font-bold text-sm ${getStepStatus(1) === 'pending' ? 'text-stone-400' : 'text-stone-800'}`}>Aguardando Confirmação</h4>
                  {getStepStatus(1) === 'active' && <p className="text-xs text-stone-500 mt-1">O restaurante está revisando o seu pedido.</p>}
                </div>
              </div>

               {/* Step 2: Preparing */}
               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mt-6">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${
                   getStepStatus(2) === 'completed' ? 'bg-green-500 text-white' : 
                   getStepStatus(2) === 'active' ? 'bg-blue-500 text-white animate-pulse' : 'bg-stone-200 text-stone-400'
                }`}>
                  <Package size={14} />
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] ml-4 md:ml-0 md:p-4">
                  <h4 className={`font-bold text-sm ${getStepStatus(2) === 'pending' ? 'text-stone-400' : 'text-stone-800'}`}>Em Preparo</h4>
                  {getStepStatus(2) === 'active' && <p className="text-xs text-stone-500 mt-1">Seu pedido está sendo feito com muito carinho.</p>}
                </div>
              </div>

               {/* Step 3: Delivering */}
               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mt-6">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${
                   getStepStatus(3) === 'completed' ? 'bg-green-500 text-white' : 
                   getStepStatus(3) === 'active' ? 'bg-purple-500 text-white animate-pulse' : 'bg-stone-200 text-stone-400'
                }`}>
                  <Truck size={14} />
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] ml-4 md:ml-0 md:p-4">
                  <h4 className={`font-bold text-sm ${getStepStatus(3) === 'pending' ? 'text-stone-400' : 'text-stone-800'}`}>Saiu para Entrega</h4>
                  {getStepStatus(3) === 'active' && <p className="text-xs text-stone-500 mt-1">O entregador está a caminho do seu endereço.</p>}
                </div>
              </div>

               {/* Step 4: Delivered */}
               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mt-6">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${
                   getStepStatus(4) === 'completed' ? 'bg-green-500 text-white' : 
                   getStepStatus(4) === 'active' ? 'bg-green-500 text-white' : 'bg-stone-200 text-stone-400'
                }`}>
                  <CheckCircle2 size={14} />
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] ml-4 md:ml-0 md:p-4">
                  <h4 className={`font-bold text-sm ${getStepStatus(4) === 'pending' ? 'text-stone-400' : 'text-stone-800'}`}>Entregue</h4>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* Order Details Summary */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100">
          <h3 className="font-bold text-sm text-stone-800 mb-4 uppercase tracking-wider">Detalhes</h3>
          
          <div className="space-y-3 mb-4">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-stone-600">{item.quantity}x {item.products?.name || 'Item'}</span>
                <span className="font-medium text-stone-800">{formatPrice(item.unit_price * item.quantity)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-stone-100 pt-4 mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-stone-500">Endereço de Entrega</span>
              <span className="font-medium text-stone-800 text-right w-2/3">{order.delivery_address}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Forma de Pagamento</span>
              <span className="font-medium text-stone-800 capitalize">{order.payment_method?.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-stone-200 pt-4 flex justify-between items-center bg-stone-50 -mx-5 px-5 -mb-5 py-4 rounded-b-2xl">
            <span className="font-medium text-stone-600">Total Pago</span>
            <span className="font-black text-xl text-primary">{formatPrice(order.total_amount)}</span>
          </div>
        </section>

      </main>
    </>
  )
}
