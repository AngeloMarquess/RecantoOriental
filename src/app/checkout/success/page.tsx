'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const clearCart = useCartStore((state) => state.clearCart)

  const sessionId = searchParams.get('session_id')
  const orderId = searchParams.get('order_id')

  useEffect(() => {
    // Clear cart upon successful Stripe payment
    if (sessionId) {
      clearCart()
    }
  }, [sessionId, clearCart])

  if (!sessionId || !orderId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-stone-600">Verificando pagamento...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50 relative overflow-hidden">
      
      {/* Decorative background shapes */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-100 max-w-sm w-full text-center relative z-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-inner">
          <CheckCircle2 size={40} />
        </div>
        
        <h1 className="text-2xl font-black text-stone-800 mb-2">Pagamento Aprovado!</h1>
        <p className="text-stone-500 mb-8 text-sm leading-relaxed">
          Seu pedido foi confirmado e já está na nossa cozinha. Agradecemos a preferência!
        </p>
        
        <div className="bg-stone-50 rounded-xl p-4 mb-8 text-left border border-stone-100">
          <p className="text-xs text-stone-500 mb-1 font-bold uppercase tracking-wider">Número do Pedido</p>
          <p className="font-mono font-bold text-stone-800 text-lg">#{orderId.split('-')[0].toUpperCase()}</p>
        </div>

        <Link 
          href={`/pedidos/${orderId}`}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl font-bold hover:bg-red-700 transition"
        >
          Acompanhar Pedido
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  )
}
