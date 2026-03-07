import { createClient } from '@/utils/supabase/server'
import { createCategory, deleteCategory } from '../actions'
import { Trash2 } from 'lucide-react'

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const error = resolvedSearchParams?.error as string | undefined
  const success = resolvedSearchParams?.success as string | undefined

  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Categorias do Cardápio</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-100 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 rounded-lg bg-green-100 text-green-700 text-sm border border-green-200">
          {success}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm mb-8">
        <h2 className="text-lg font-bold text-stone-800 mb-4">Nova Categoria</h2>
        <form action={createCategory} className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-stone-500 mb-1">Nome (ex: Combinados)</label>
            <input name="name" type="text" required className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-stone-50 text-stone-900 focus:ring-primary focus:border-primary" suppressHydrationWarning />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-stone-500 mb-1">Descrição</label>
            <input name="description" type="text" className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-stone-50 text-stone-900 focus:ring-primary focus:border-primary" placeholder="Opcional" suppressHydrationWarning />
          </div>
          <div className="w-24">
            <label className="block text-xs font-medium text-stone-500 mb-1">Ordem</label>
            <input name="sort_order" type="number" defaultValue="0" className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-stone-50 text-stone-900 focus:ring-primary focus:border-primary" suppressHydrationWarning />
          </div>
          <div className="pt-5 w-full md:w-auto">
            <button type="submit" className="w-full md:w-auto bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition" suppressHydrationWarning>
              Adicionar
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-stone-600">
          <thead className="bg-stone-50 border-b border-stone-200 text-stone-500">
            <tr>
              <th className="px-6 py-3 font-medium">Ordem</th>
              <th className="px-6 py-3 font-medium">Nome</th>
              <th className="px-6 py-3 font-medium">Descrição</th>
              <th className="px-6 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {categories?.map((cat) => (
              <tr key={cat.id} className="hover:bg-stone-50">
                <td className="px-6 py-3 font-medium">{cat.sort_order}</td>
                <td className="px-6 py-3 font-semibold text-stone-800">{cat.name}</td>
                <td className="px-6 py-3 text-stone-500">{cat.description || '-'}</td>
                <td className="px-6 py-3 text-right">
                  <form action={async () => {
                    'use server'
                    await deleteCategory(cat.id)
                  }}>
                    <button type="submit" className="text-red-500 hover:text-red-700 p-1 rounded transition" title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!categories?.length && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-stone-400">
                  Nenhuma categoria cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
