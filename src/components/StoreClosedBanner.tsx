import { AlertCircle } from 'lucide-react'

export default function StoreClosedBanner() {
  return (
    <div className="bg-red-600 text-white px-4 py-3 shadow-md flex items-center justify-center gap-3">
      <AlertCircle size={20} className="shrink-0" />
      <div className="text-sm font-medium">
         <strong className="block md:inline">Estamos fechados momento.</strong>{' '}
         Nosso cardápio está disponível para visualização, mas não é possível realizar pedidos agora.
      </div>
    </div>
  )
}
