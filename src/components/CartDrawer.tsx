'use client'

import { useCartStore } from "@/store/cartStore"
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CartDrawer() {
  const [mounted, setMounted] = useState(false)
  const cartState = useCartStore()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const { items, isCartOpen, closeCart, updateQuantity, removeItem, getTotalPrice, getItemPrice } = cartState
  
  // Format currency
  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`
  }

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[60] transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-96 bg-stone-50 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-stone-100">
          <h2 className="font-bold text-lg text-stone-800 flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" />
            Seu Pedido
          </h2>
          <button 
            onClick={closeCart}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-500 space-y-4">
              <ShoppingBag size={48} className="text-stone-300" />
              <p className="font-medium">Sua sacola está vazia</p>
              <button 
                onClick={closeCart}
                className="text-primary font-bold text-sm bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
              >
                Voltar ao cardápio
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.cartItemId} className="bg-white p-3 rounded-xl border border-stone-100 shadow-sm flex flex-col gap-2">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-stone-50 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                      {item.icon || '🥡'}
                    </div>
                    
                    <div className="flex flex-col flex-1 py-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-stone-800 text-sm leading-tight line-clamp-2">{item.name}</h4>
                        <button 
                          onClick={() => removeItem(item.cartItemId)}
                          className="text-stone-300 hover:text-red-500 transition-colors shrink-0 ml-2"
                          title="Remover item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Details (Extras & Comments) */}
                      {(item.extras?.length || item.comment) && (
                        <div className="mb-2 text-xs text-stone-500 space-y-1">
                          {item.extras?.map(extra => (
                            <div key={extra.id} className="flex justify-between">
                              <span>+ {extra.quantity}x {extra.name}</span>
                              <span>{formatPrice(extra.price * extra.quantity)}</span>
                            </div>
                          ))}
                          {item.comment && (
                            <div className="italic mt-1 text-stone-400">
                              Obs: {item.comment}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-auto">
                        <span className="font-bold text-primary text-sm">
                          {formatPrice(getItemPrice(item))}
                        </span>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center bg-stone-100 rounded-lg border border-stone-200">
                          <button 
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-primary transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-stone-800">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-primary transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Area */}
        {items.length > 0 && (
          <div className="bg-white border-t border-stone-200 p-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-stone-500 font-medium text-sm">Total do pedido</span>
              <span className="text-xl font-black text-stone-800">
                {formatPrice(getTotalPrice())}
              </span>
            </div>
            
            <button 
              className="w-full bg-primary text-white py-3 md:py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition shadow-lg shadow-red-500/30 active:scale-[0.98]"
              onClick={() => {
                closeCart()
                router.push('/checkout')
              }}
            >
              Finalizar Pedido
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function ChevronRight({ size }: { size: number }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
}
