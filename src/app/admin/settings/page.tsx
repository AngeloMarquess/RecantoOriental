import { createClient } from '@/utils/supabase/server'
import { updateStoreSettings } from '../actions'
import { Settings2, Clock, MapPin, CheckCircle2 } from 'lucide-react'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const success = resolvedSearchParams?.success as string | undefined
  const error = resolvedSearchParams?.error as string | undefined

  const supabase = await createClient()

  // Fetch current settings
  const { data: settings } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', 1)
    .single()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          <Settings2 className="text-primary" /> Configurações
        </h1>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-100 text-red-700 text-sm border border-red-200 mt-4">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-green-100 text-green-700 text-sm font-medium border border-green-200 mt-4 flex items-center gap-2">
          <CheckCircle2 size={18} /> Configurações salvas com sucesso!
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-100">
          <h2 className="font-bold text-lg text-stone-800">Status e Horários de Funcionamento</h2>
          <p className="text-sm text-stone-500 mt-1">
            Controle se o restaurante está aberto para receber novos pedidos e defina o horário de funcionamento padrão.
          </p>
        </div>
        
        <form action={updateStoreSettings} className="p-6 space-y-6">
          <div className="p-5 rounded-xl border-2 border-stone-100 bg-stone-50">
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-stone-800 block text-lg">Loja Aberta?</strong>
                <span className="text-sm text-stone-500">Desative para fechar a loja imediatamente.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="is_open" 
                  value="true" 
                  defaultChecked={settings?.is_open} 
                  className="sr-only peer" 
                />
                <div className="w-14 h-7 bg-stone-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center gap-2">
                <Clock size={16} className="text-primary"/> Horário de Abertura
              </label>
              <input 
                type="time" 
                name="opening_time" 
                defaultValue={settings?.opening_time || ''} 
                className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-white text-stone-800 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center gap-2">
                <Clock size={16} className="text-primary"/> Horário de Fechamento
              </label>
              <input 
                type="time" 
                name="closing_time" 
                defaultValue={settings?.closing_time || ''} 
                className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-white text-stone-800 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition outline-none" 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-stone-100">
             <button type="submit" className="w-full md:w-auto bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition">
                Salvar Configurações
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}
