'use client'

import { useCartStore } from "@/store/cartStore"

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    icon?: string;
  }
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore(state => state.addItem)

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      icon: product.icon
    })
  }

  return (
    <button 
      onClick={handleAdd}
      className="bg-stone-100 text-stone-700 w-8 h-8 rounded-full flex items-center justify-center font-bold hover:bg-primary hover:text-white transition-colors active:scale-95" 
      title="Adicionar ao carrinho"
      suppressHydrationWarning
    >
      +
    </button>
  )
}
