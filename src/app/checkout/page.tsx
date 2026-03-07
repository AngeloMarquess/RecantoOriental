'use client'

import { useState, useEffect, useRef } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useRouter } from 'next/navigation'
import { ChevronLeft, MapPin, CreditCard, Banknote, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { createOrder } from './actions'

export default function CheckoutPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { items, getTotalPrice, clearCart } = useCartStore()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const isNavigating = useRef(false)
  
  useEffect(() => {
    setMounted(true)
    // If cart is empty on mount, send them back to home
    if (items.length === 0 && !isNavigating.current) {
      router.push('/')
    }
  }, [items.length, router])

  if (!mounted || (items.length === 0 && !isNavigating.current)) {
    return null // prevent flashing or hydration errors
  }

  const handleCheckout = async (formData: FormData) => {
    setIsSubmitting(true)
    setError('')

    const address = formData.get('address') as string
    const reference = formData.get('reference') as string
    const paymentMethod = formData.get('payment_method') as string
    
    // Simplistic validation
    if (!address || !paymentMethod) {
      setError('Por favor, preencha o endereço e escolha a forma de pagamento.')
      setIsSubmitting(false)
      return
    }

    try {
      const result = await createOrder({
        address,
        reference,
        paymentMethod,
        items: items.map(item => ({ id: item.id, quantity: item.quantity, price: item.price })),
        totalAmount: getTotalPrice()
      })

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
      } else {
        isNavigating.current = true
        clearCart()
        // Here we redirect to the realtime order status page!
        router.push(`/pedidos/${result.orderId}`)
      }
    } catch (err: any) {
      setError('Ocorreu um erro ao finalizar o pedido. Tente novamente.')
      setIsSubmitting(false)
    }
  }

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-stone-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-stone-500 hover:text-stone-800 transition p-2 -ml-2">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="font-bold text-lg text-stone-800">Finalizar Pedido</h1>
          <div className="w-8" /> {/* spacing */}
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form action={handleCheckout} className="space-y-6">
          {/* Section: Delivery Details */}
          <section className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100">
            <h2 className="font-bold text-lg text-stone-800 mb-4 flex items-center gap-2">
              <MapPin className="text-primary" size={20} />
              Entrega
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Endereço Completo *</label>
                <input 
                  type="text" 
                  name="address"
                  required
                  placeholder="Rua, Número, Bairro"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
                  suppressHydrationWarning
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Complemento / Ponto de Referência</label>
                <input 
                  type="text" 
                  name="reference"
                  placeholder="Apto 101, Perto da padaria..."
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
                  suppressHydrationWarning
                />
              </div>
            </div>
          </section>

          {/* Section: Payment Method */}
          <section className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100">
            <h2 className="font-bold text-lg text-stone-800 mb-4 flex items-center gap-2">
              <CreditCard className="text-primary" size={20} />
              Pagamento na Entrega
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              <label className="relative cursor-pointer">
                <input type="radio" name="payment_method" value="dinheiro" className="peer sr-only" required suppressHydrationWarning />
                <div className="p-4 rounded-xl border-2 border-stone-100 peer-checked:border-primary peer-checked:bg-red-50 transition flex flex-col items-center gap-2">
                  <Banknote className="text-stone-500 peer-checked:text-primary" size={24} />
                  <span className="font-medium text-stone-700 peer-checked:text-primary text-sm">Dinheiro</span>
                </div>
              </label>

              <label className="relative cursor-pointer">
                <input type="radio" name="payment_method" value="cartao_maquineta" className="peer sr-only" suppressHydrationWarning />
                <div className="p-4 rounded-xl border-2 border-stone-100 peer-checked:border-primary peer-checked:bg-red-50 transition flex flex-col items-center gap-2">
                  <CreditCard className="text-stone-500 peer-checked:text-primary" size={24} />
                  <span className="font-medium text-stone-700 peer-checked:text-primary text-sm text-center">Cartão (Máquina)</span>
                </div>
              </label>
            </div>
          </section>

          {/* Section: Order Summary */}
          <section className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100">
            <h2 className="font-bold text-lg text-stone-800 mb-4 flex items-center gap-2">
              <ShoppingBag className="text-primary" size={20} />
              Resumo
            </h2>
            
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-stone-600">{item.quantity}x {item.name}</span>
                  <span className="font-medium text-stone-800">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-dashed border-stone-200 pt-4 flex justify-between items-center">
              <span className="font-medium text-stone-600">Total</span>
              <span className="font-black text-xl text-primary">{formatPrice(getTotalPrice())}</span>
            </div>
          </section>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 active:scale-[0.98] transition shadow-lg shadow-red-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
            suppressHydrationWarning
          >
            {isSubmitting ? 'Processando...' : 'Confirmar Pedido'}
          </button>
        </form>
      </main>
    </div>
  )
}
