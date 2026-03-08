'use client'

import { useState } from 'react'
import { Trash2, Edit2, Save, X } from 'lucide-react'
import { updateCategory, deleteCategory } from '../actions'

type Category = {
  id: string
  name: string
  description: string | null
  sort_order: number
  image_url: string | null
}

interface CategoryRowProps {
  category: Category
}

export default function CategoryRow({ category }: CategoryRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUpdate = async (formData: FormData) => {
    setIsSubmitting(true)
    const result = await updateCategory(category.id, formData)
    setIsSubmitting(false)
    
    if (result.error) {
      alert(result.error)
    } else {
      setIsEditing(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('Deseja realmente excluir esta categoria? Os produtos atrelados a ela ficarão sem categoria.')) {
      setIsSubmitting(true)
      await deleteCategory(category.id)
      setIsSubmitting(false)
    }
  }

  if (isEditing) {
    return (
      <tr className="bg-stone-50 border-b-2 border-primary/20">
        <td colSpan={5} className="p-4">
          <form action={handleUpdate} className="flex flex-col gap-4">
            <div className="flex items-center gap-4 text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 border-b border-stone-200 pb-2">
              <span className="flex items-center gap-1 text-primary"><Edit2 size={14}/> Editando: {category.name}</span>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-stone-500 mb-1">Nome</label>
                <input name="name" type="text" defaultValue={category.name} required className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:ring-primary focus:border-primary" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-stone-500 mb-1">Descrição</label>
                <input name="description" type="text" defaultValue={category.description || ''} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:ring-primary focus:border-primary" />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-stone-500 mb-1">Nova Imagem (deixe em branco para manter a atual)</label>
                <input name="image" type="file" accept="image/*" className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-sm bg-white focus:ring-primary focus:border-primary file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200" />
              </div>
              <div className="w-32">
                <label className="block text-xs font-medium text-stone-500 mb-1">Ordem</label>
                <input name="sort_order" type="number" defaultValue={category.sort_order} required className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:ring-primary focus:border-primary" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={isSubmitting} className="bg-primary text-white font-bold py-2 px-4 rounded-lg flex items-center gap-1 hover:bg-red-700 transition disabled:opacity-50 text-sm">
                  <Save size={16}/> Salvar
                </button>
                <button type="button" onClick={() => setIsEditing(false)} disabled={isSubmitting} className="bg-stone-200 text-stone-700 font-bold py-2 px-4 rounded-lg flex items-center gap-1 hover:bg-stone-300 transition text-sm">
                  <X size={16}/> Cancelar
                </button>
              </div>
            </div>
          </form>
        </td>
      </tr>
    )
  }

  return (
    <tr className="hover:bg-stone-50 border-b border-stone-100 last:border-0">
      <td className="px-6 py-4">
        {category.image_url ? (
          <img src={category.image_url} alt={category.name} className="w-10 h-10 rounded-lg object-cover border border-stone-200" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 text-xs">Sem foto</div>
        )}
      </td>
      <td className="px-6 py-4 font-medium">{category.sort_order}</td>
      <td className="px-6 py-4 font-semibold text-stone-800">{category.name}</td>
      <td className="px-6 py-4 text-stone-500">{category.description || '-'}</td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button 
            type="button" 
            onClick={() => setIsEditing(true)} 
            className="text-blue-500 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded transition" 
            title="Editar Categoria"
          >
            <Edit2 size={16} />
          </button>
          <button 
            type="button" 
            onClick={handleDelete}
            disabled={isSubmitting}
            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition disabled:opacity-50" 
            title="Excluir Categoria"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  )
}
