import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  // Optional image or icon for display in the cart
  icon?: string; 
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      
      addItem: (newItem) => set((state) => {
        const existingItemIndex = state.items.findIndex(item => item.id === newItem.id);
        
        if (existingItemIndex >= 0) {
          // Update existing item
          const updatedItems = [...state.items];
          updatedItems[existingItemIndex].quantity += newItem.quantity;
          return { items: updatedItems };
        } else {
          // Add new item
          return { items: [...state.items, newItem] };
        }
      }),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      
      updateQuantity: (id, quantity) => set((state) => {
        if (quantity <= 0) {
          return { items: state.items.filter(item => item.id !== id) };
        }
        
        return {
          items: state.items.map(item => 
            item.id === id ? { ...item, quantity } : item
          )
        };
      }),
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'recanto-cart-storage', // name of item in the storage (must be unique)
    }
  )
)
