'use client'

import { ShoppingBag } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { useEffect, useState } from "react"

export default function CartButton() {
  const [mounted, setMounted] = useState(false)
  const getTotalItems = useCartStore(state => state.getTotalItems)
  const openCart = useCartStore(state => state.openCart)
  const totalItems = getTotalItems()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <button 
      onClick={openCart}
      className="relative bg-white/20 p-2 rounded-full hover:bg-white/30 transition"
      suppressHydrationWarning
    >
      <ShoppingBag size={22} className="text-white" />
      {mounted && totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-primary">
          {totalItems}
        </span>
      )}
    </button>
  )
}
