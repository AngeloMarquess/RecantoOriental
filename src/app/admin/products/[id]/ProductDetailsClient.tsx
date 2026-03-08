'use client'

import { useState } from 'react'
import { Plus, Trash2, Settings2, Save, X, Edit3 } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { 
  updateProductDetails, 
  createComplementCategory, 
  deleteComplementCategory,
  createComplementItem,
  updateComplementItem,
  deleteComplementItem
} from './actions'

type Category = { id: string; name: string }
type ComplementItem = { id: string; name: string; price: number; description: string }
type ComplementCategory = { 
  id: string; 
  name: string; 
  description: string;
  min_selections: number;
  max_selections: number;
  is_required: boolean;
  product_complements: ComplementItem[] 
}

interface ProductDetailsProps {
  product: any;
  categories: Category[];
  complementCategories: ComplementCategory[];
}

export default function ProductDetailsClient({ product, categories, complementCategories }: ProductDetailsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  // Dialog States
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false)
  
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  
  const [editingItem, setEditingItem] = useState<ComplementItem | null>(null)

  // --- Handlers ---
  const handleUpdateProduct = async (formData: FormData) => {
    setIsSubmitting(true)
    setError('')
    const result = await updateProductDetails(product.id, formData)
    if (result.error) setError(result.error)
    setIsSubmitting(false)
  }

  const handleCreateCategory = async (formData: FormData) => {
    setIsSubmitting(true)
    setError('')
    const result = await createComplementCategory(product.id, formData)
    if (result.error) setError(result.error)
    else setIsCatDialogOpen(false)
    setIsSubmitting(false)
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Deseja excluir esta categoria e todos os seus itens?')) return
    setIsSubmitting(true)
    const result = await deleteComplementCategory(product.id, categoryId)
    if (result.error) alert(result.error)
    setIsSubmitting(false)
  }

  const handleCreateItem = async (formData: FormData) => {
    if (!activeCategoryId) return
    setIsSubmitting(true)
    setError('')
    const result = await createComplementItem(product.id, activeCategoryId, formData)
    if (result.error) setError(result.error)
    else setIsItemDialogOpen(false)
    setIsSubmitting(false)
  }

  const handleUpdateItem = async (formData: FormData) => {
    if (!editingItem) return
    setIsSubmitting(true)
    setError('')
    const result = await updateComplementItem(product.id, editingItem.id, formData)
    if (result.error) setError(result.error)
    else setEditingItem(null)
    setIsSubmitting(false)
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Excluir este item?')) return
    setIsSubmitting(true)
    const result = await deleteComplementItem(product.id, itemId)
    if (result.error) alert(result.error)
    setIsSubmitting(false)
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 shadow-sm text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Basic Details */}
        <div className="md:col-span-1 space-y-6">
          <form action={handleUpdateProduct} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm sticky top-6">
            <h2 className="font-bold text-stone-800 text-lg mb-4 flex items-center gap-2">
              <Edit3 size={18} className="text-primary"/>
              Info Básica
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Nome</label>
                <input name="name" type="text" defaultValue={product.name} required className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 focus:ring-primary focus:border-primary bg-white" />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Categoria Principal</label>
                <select name="category_id" defaultValue={product.category_id} required className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 focus:ring-primary focus:border-primary bg-white">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Preço Base (R$)</label>
                <input name="price" type="number" step="0.01" defaultValue={product.price} required className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 focus:ring-primary focus:border-primary bg-white" />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Preço Original Riscado (Opcional)</label>
                <input name="original_price" type="number" step="0.01" defaultValue={product.original_price || ''} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 focus:ring-primary focus:border-primary bg-white" placeholder="Ex: De R$ 37,90..." />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Rendimento (Serve X pessoas?)</label>
                <input name="serves" type="number" min="1" step="1" defaultValue={product.serves || ''} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 focus:ring-primary focus:border-primary bg-white" placeholder="1" />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Descrição</label>
                <textarea name="description" rows={3} defaultValue={product.description || ''} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 focus:ring-primary focus:border-primary bg-white resize-none" />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1 flex justify-between">
                  <span>Foto do Produto</span>
                  {product.image_url && <a href={product.image_url} target="_blank" className="text-primary hover:underline">Ver atual</a>}
                </label>
                <input name="image" type="file" accept="image/*" className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer" />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-stone-800 text-white font-bold py-2.5 rounded-lg flex justify-center items-center gap-2 hover:bg-stone-700 transition disabled:opacity-50">
                <Save size={16} /> Salvar Alterações
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Complements Editor */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
              <div>
                <h2 className="font-bold text-stone-800 text-lg flex items-center gap-2">
                  <Settings2 size={18} className="text-primary"/>
                  Classes de Adicionais
                </h2>
                <p className="text-xs text-stone-500 mt-1">Crie opções como "Bebidas", "Turbine seu Lanche".</p>
              </div>
              <button onClick={() => setIsCatDialogOpen(true)} className="bg-primary text-white p-2 rounded-lg hover:bg-red-700 transition shadow-sm text-sm font-bold flex items-center gap-1">
                <Plus size={16} /> Nova Categoria
              </button>
            </div>

            <div className="space-y-6">
              {complementCategories.length === 0 ? (
                <div className="text-center py-8 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                   <p className="text-stone-500 text-sm">Nenhum adicional configurado para este produto.</p>
                </div>
              ) : (
                complementCategories.map(cat => (
                  <div key={cat.id} className="border border-stone-200 rounded-xl shadow-sm bg-stone-50/50 overflow-hidden">
                    
                    {/* Cat Header box */}
                    <div className="bg-white p-4 border-b border-stone-200 flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-stone-800">{cat.name}</h3>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                            Min: {cat.min_selections} | Max: {cat.max_selections}
                          </span>
                          {cat.is_required && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-600 uppercase tracking-widest">
                              Obrigatório
                            </span>
                          )}
                        </div>
                        {cat.description && <p className="text-xs text-stone-500 mt-1">{cat.description}</p>}
                      </div>
                      
                      <button onClick={() => handleDeleteCategory(cat.id)} className="text-stone-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-md transition" title="Excluir Categoria">
                        <Trash2 size={16}/>
                      </button>
                    </div>

                    {/* Cat Items List */}
                    <div className="p-4">
                      <div className="flex justify-between items-end mb-3">
                        <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Itens</h4>
                        <button 
                          onClick={() => {
                            setActiveCategoryId(cat.id)
                            setIsItemDialogOpen(true)
                          }}
                          className="text-xs font-bold text-primary flex items-center gap-1 hover:text-red-700 transition"
                        >
                          <Plus size={14} /> Adicionar Item
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(!cat.product_complements || cat.product_complements.length === 0) ? (
                           <p className="text-xs text-stone-400 italic bg-white p-3 rounded-lg border border-stone-100">Nenhum item nesta lista.</p>
                        ) : (
                           cat.product_complements.map(item => (
                             <div key={item.id} className="bg-white p-3 rounded-lg border border-stone-200 flex justify-between items-center group">
                               <div>
                                 <p className="font-medium text-stone-800 text-sm">{item.name}</p>
                                 {item.description && <p className="text-xs text-stone-400">{item.description}</p>}
                               </div>
                               <div className="flex items-center gap-4">
                                 <span className="font-bold text-primary text-sm whitespace-nowrap">
                                   {item.price > 0 ? `+ R$ ${item.price.toFixed(2).replace('.',',')}` : 'Grátis'}
                                 </span>
                                 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button onClick={() => setEditingItem(item)} className="text-stone-400 hover:text-blue-500 transition p-1" title="Editar item">
                                      <Settings2 size={16}/>
                                   </button>
                                   <button onClick={() => handleDeleteItem(item.id)} className="text-stone-400 hover:text-red-500 transition p-1" title="Excluir item">
                                      <Trash2 size={16}/>
                                   </button>
                                 </div>
                               </div>
                             </div>
                           ))
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- DIALOGS --- */}

      {/* Dialog: Create Category */}
      <Dialog.Root open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 z-[60] w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-bold text-stone-800">Nova Categoria de Adicional</Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-stone-400 hover:text-stone-700"><X size={20}/></button>
              </Dialog.Close>
            </div>
            
            <form action={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Nome Exibido (Ex: Tamanho, Turbine)</label>
                <input name="name" type="text" required className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:ring-primary focus:border-primary" placeholder="Borda Recheada" />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Descrição (Opcional)</label>
                <input name="description" type="text" className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:ring-primary focus:border-primary" placeholder="Escolha a borda da sua pizza" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Mínimo (Qtd)</label>
                  <input name="min_selections" type="number" defaultValue={0} min={0} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Máximo (Qtd)</label>
                  <input name="max_selections" type="number" defaultValue={1} min={1} required className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:ring-primary focus:border-primary" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 pb-2">
                <input type="checkbox" name="is_required" id="is_required" className="w-4 h-4 text-primary rounded ring-primary focus:ring-primary accent-primary" />
                <label htmlFor="is_required" className="text-sm font-medium text-stone-700 cursor-pointer">É obrigatório o cliente escolher?</label>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-red-700 transition disabled:opacity-50">
                Criar Categoria
              </button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Dialog: Create Item */}
      <Dialog.Root open={isItemDialogOpen} onOpenChange={(open) => {
        setIsItemDialogOpen(open);
        if(!open) setActiveCategoryId(null);
      }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 z-[60] w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-bold text-stone-800">Novo Item</Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-stone-400 hover:text-stone-700"><X size={20}/></button>
              </Dialog.Close>
            </div>
            
            <form action={handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Nome do Item</label>
                <input name="name" type="text" required className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:ring-primary focus:border-primary" placeholder="Ex: Bacon, Maionese" />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Preço Adicional (+R$)</label>
                <input name="price" type="number" step="0.01" defaultValue={0} min={0} required className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:ring-primary focus:border-primary" />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-stone-900 text-white font-bold py-3 rounded-xl hover:bg-stone-800 transition disabled:opacity-50 mt-2">
                Adicionar Opção
              </button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>


      {/* Dialog: Edit Item */}
      <Dialog.Root open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 z-[60] w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-bold text-stone-800">Editar Item</Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-stone-400 hover:text-stone-700"><X size={20}/></button>
              </Dialog.Close>
            </div>
            
            {editingItem && (
              <form action={handleUpdateItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Nome do Item</label>
                  <input name="name" type="text" required defaultValue={editingItem.name} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:ring-primary focus:border-primary" placeholder="Ex: Bacon, Maionese" />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Preço Adicional (+R$)</label>
                  <input name="price" type="number" step="0.01" defaultValue={editingItem.price} min={0} required className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:ring-primary focus:border-primary" />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-stone-900 text-white font-bold py-3 rounded-xl hover:bg-stone-800 transition disabled:opacity-50 mt-2">
                  Salvar Alterações
                </button>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </>
  )
}
