import { createClient } from '@/utils/supabase/server'
import { createCategory } from '../actions'
import CategoryRow from './CategoryRow'

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
        <form action={createCategory} className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-start w-full">
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-stone-500 mb-1">Nome (ex: Combinados)</label>
              <input name="name" type="text" required className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-stone-50 text-stone-900 focus:ring-primary focus:border-primary" suppressHydrationWarning />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-stone-500 mb-1">Descrição</label>
              <input name="description" type="text" className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-stone-50 text-stone-900 focus:ring-primary focus:border-primary" placeholder="Opcional" suppressHydrationWarning />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-end w-full">
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-stone-500 mb-1">Imagem da Categoria</label>
              <input name="image" type="file" accept="image/*" className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer bg-white border border-stone-300 rounded-lg focus:ring-primary focus:border-primary" suppressHydrationWarning />
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium text-stone-500 mb-1">Ordem</label>
              <input name="sort_order" type="number" defaultValue="0" className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-stone-50 text-stone-900 focus:ring-primary focus:border-primary" suppressHydrationWarning />
            </div>
            <div className="w-full md:w-auto">
              <button type="submit" className="w-full md:w-auto bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition" suppressHydrationWarning>
                Adicionar
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-stone-600">
          <thead className="bg-stone-50 border-b border-stone-200 text-stone-500">
            <tr>
              <th className="px-6 py-3 font-medium w-20">Foto</th>
              <th className="px-6 py-3 font-medium w-20">Ordem</th>
              <th className="px-6 py-3 font-medium">Nome</th>
              <th className="px-6 py-3 font-medium">Descrição</th>
              <th className="px-6 py-3 font-medium text-right w-24">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {categories?.map((cat) => (
              <CategoryRow key={cat.id} category={cat} />
            ))}
            {!categories?.length && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-stone-400">
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
