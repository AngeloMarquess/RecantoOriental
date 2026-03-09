'use client'

import { ShoppingCart } from "lucide-react"
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
      className="relative p-1 rounded-full text-white transition active:scale-95 hover:bg-white/10"
      suppressHydrationWarning
    >
      <ShoppingCart size={26} strokeWidth={2.5} />
      {mounted && totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-white text-primary text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-primary">
          {totalItems}
        </span>
      )}
    </button>
  )
}
