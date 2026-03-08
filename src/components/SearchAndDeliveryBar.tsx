'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, MapPin, PersonStanding, ChevronDown, CheckCircle2 } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import * as Dialog from '@radix-ui/react-dialog'

export default function SearchAndDeliveryBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  
  const [query, setQuery] = useState(initialQuery)
  const { deliveryMode, setDeliveryMode } = useCartStore()
  
  const [modalOpen, setModalOpen] = useState(false)
  const [tempMode, setTempMode] = useState<'delivery' | 'pickup'>(deliveryMode)

  // Update tempMode when opening modal
  useEffect(() => {
    if (modalOpen) {
      setTempMode(deliveryMode)
    }
  }, [modalOpen, deliveryMode])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/')
    }
  }

  const handleConfirmMode = () => {
    setDeliveryMode(tempMode)
    setModalOpen(false)
  }

  return (
    <div className="flex gap-2">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar no cardápio" 
          className="w-full bg-white border border-stone-200 text-stone-800 rounded-lg py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm h-[42px]"
          suppressHydrationWarning
        />
      </form>

      {/* Delivery Mode Button & Modal */}
      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Trigger asChild>
          <button className="flex items-center justify-between gap-1.5 bg-white border border-stone-200 text-stone-700 rounded-lg px-3 py-2.5 text-xs font-medium hover:bg-stone-50 transition shadow-sm h-[42px] whitespace-nowrap min-w-[100px]" suppressHydrationWarning>
            <div className="flex items-center gap-1.5">
              {deliveryMode === 'delivery' ? (
                <MapPin size={16} className="text-stone-500" />
              ) : (
                <PersonStanding size={16} className="text-stone-500" />
              )}
              {deliveryMode === 'delivery' ? 'Entrega' : 'Retirada'}
            </div>
            <ChevronDown size={14} className="text-primary" />
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-50 w-[90vw] max-w-sm overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6">
              <h2 className="text-lg font-bold text-center text-stone-800 mb-6">Como quer receber o pedido?</h2>
              
              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 rounded-xl border-2 transition cursor-pointer ${tempMode === 'delivery' ? 'border-primary bg-red-50/50' : 'border-stone-100 hover:border-stone-200'}`}>
                  <div className="flex items-center gap-3">
                    <MapPin className={tempMode === 'delivery' ? 'text-primary' : 'text-stone-400'} size={24} />
                    <div>
                      <p className={`font-semibold text-sm ${tempMode === 'delivery' ? 'text-stone-900' : 'text-stone-600'}`}>Entrega</p>
                      <p className="text-xs text-stone-500">A gente leva até você</p>
                    </div>
                  </div>
                  <input type="radio" className="sr-only" checked={tempMode === 'delivery'} onChange={() => setTempMode('delivery')} name="deliveryModeGroup" />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${tempMode === 'delivery' ? 'border-primary' : 'border-stone-200'}`}>
                    {tempMode === 'delivery' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                  </div>
                </label>

                <label className={`flex items-center justify-between p-4 rounded-xl border-2 transition cursor-pointer ${tempMode === 'pickup' ? 'border-primary bg-red-50/50' : 'border-stone-100 hover:border-stone-200'}`}>
                  <div className="flex items-center gap-3">
                    <PersonStanding className={tempMode === 'pickup' ? 'text-primary' : 'text-stone-400'} size={24} />
                    <div>
                      <p className={`font-semibold text-sm ${tempMode === 'pickup' ? 'text-stone-900' : 'text-stone-600'}`}>Retirada</p>
                      <p className="text-xs text-stone-500">Você retira no local</p>
                    </div>
                  </div>
                  <input type="radio" className="sr-only" checked={tempMode === 'pickup'} onChange={() => setTempMode('pickup')} name="deliveryModeGroup" />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${tempMode === 'pickup' ? 'border-primary' : 'border-stone-200'}`}>
                    {tempMode === 'pickup' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                  </div>
                </label>
              </div>
            </div>
            
            <div className="p-4 bg-white border-t border-stone-100">
              <button 
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-red-700 transition active:scale-[0.98]"
                onClick={handleConfirmMode}
              >
                Confirmar {tempMode === 'delivery' ? 'entrega' : 'retirada'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
