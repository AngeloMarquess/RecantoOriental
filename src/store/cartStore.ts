import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItemExtra {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  cartItemId: string; // Unique ID for this specific item configuration
  id: string;         // Base Product ID
  name: string;
  price: number;
  quantity: number;
  icon?: string; 
  extras?: CartItemExtra[];
  comment?: string;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, 'cartItemId'>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemPrice: (item: CartItem) => number;
  deliveryMode: 'delivery' | 'pickup';
  setDeliveryMode: (mode: 'delivery' | 'pickup') => void;
}

// Function to generate a unique ID based on product, extras, and comment
const generateCartItemId = (item: Omit<CartItem, 'cartItemId'>) => {
  const extrasString = item.extras ? item.extras.map(e => `${e.id}-${e.quantity}`).sort().join('|') : '';
  const commentString = item.comment ? item.comment.trim().toLowerCase() : '';
  return `${item.id}-${extrasString}-${commentString}`;
}

const calculateItemUnitTotal = (item: Omit<CartItem, 'cartItemId'>): number => {
  const extrasTotal = item.extras?.reduce((sum, extra) => sum + (extra.price * extra.quantity), 0) || 0;
  return item.price + extrasTotal;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      deliveryMode: 'delivery',

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      setDeliveryMode: (mode) => set({ deliveryMode: mode }),
      
      addItem: (newItemInput) => set((state) => {
        const cartItemId = generateCartItemId(newItemInput);
        const newItem = { ...newItemInput, cartItemId } as CartItem;
        
        const existingItemIndex = state.items.findIndex(item => item.cartItemId === cartItemId);
        
        if (existingItemIndex >= 0) {
          // If perfectly identical, just update quantity
          const updatedItems = [...state.items];
          updatedItems[existingItemIndex].quantity += newItem.quantity;
          return { items: updatedItems };
        } else {
          // Otherwise add as new line item
          return { items: [...state.items, newItem] };
        }
      }),
      
      removeItem: (cartItemId) => set((state) => ({
        items: state.items.filter(item => item.cartItemId !== cartItemId)
      })),
      
      updateQuantity: (cartItemId, quantity) => set((state) => {
        if (quantity <= 0) {
          return { items: state.items.filter(item => item.cartItemId !== cartItemId) };
        }
        
        return {
          items: state.items.map(item => 
            item.cartItemId === cartItemId ? { ...item, quantity } : item
          )
        };
      }),
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getItemPrice: (item) => {
        return calculateItemUnitTotal(item) * item.quantity;
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (calculateItemUnitTotal(item) * item.quantity), 0);
      }
    }),
    {
      name: 'recanto-cart-storage-v3', // bumped storage name due to schema change so it doesn't crash existing users
    }
  )
)
