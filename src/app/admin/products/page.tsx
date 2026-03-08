import { createClient } from '@/utils/supabase/server'
import { createProduct, deleteProduct, toggleProductAvailability } from '../actions'
import { Trash2, Edit2 } from 'lucide-react'
import Link from 'next/link'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const error = resolvedSearchParams?.error as string | undefined
  const success = resolvedSearchParams?.success as string | undefined

  const supabase = await createClient()
  
  // Fetch products with their categories
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })

  // Fetch categories for the select dropdown
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('sort_order', { ascending: true })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Itens do Cardápio</h1>
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
        <h2 className="text-lg font-bold text-stone-800 mb-4">Novo Produto</h2>
        
        {categories?.length === 0 ? (
          <div className="p-4 bg-orange-50 text-orange-800 rounded-lg border border-orange-200 text-sm">
            Você precisa cadastrar pelo menos uma Categoria antes de adicionar produtos.
          </div>
        ) : (
          <form action={createProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-stone-500 mb-1">Categoria</label>
              <select name="category_id" required className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-stone-50 text-stone-900 focus:ring-primary focus:border-primary" suppressHydrationWarning>
                <option value="">Selecione...</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-stone-500 mb-1">Nome do Item</label>
              <input name="name" type="text" required className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-stone-50 text-stone-900 focus:ring-primary focus:border-primary" suppressHydrationWarning />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-stone-500 mb-1">Preço (R$)</label>
              <input name="price" type="number" step="0.01" required placeholder="0.00" className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-stone-50 text-stone-900 focus:ring-primary focus:border-primary" suppressHydrationWarning />
            </div>
            <div className="md:col-span-1 pt-5">
              <button type="submit" className="w-full bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition" suppressHydrationWarning>
                Adicionar
              </button>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-stone-500 mb-1">Descrição</label>
              <input name="description" type="text" className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-stone-50 text-stone-900 focus:ring-primary focus:border-primary" placeholder="Detalhes do prato" suppressHydrationWarning />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-stone-500 mb-1">Foto do Produto (Opcional)</label>
              <input name="image" type="file" accept="image/*" className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer bg-white border border-stone-300 rounded-lg focus:ring-primary focus:border-primary" suppressHydrationWarning />
            </div>
          </form>
        )}
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden auto-cols-max">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 whitespace-nowrap">
              <tr>
                <th className="px-6 py-3 font-medium">Nome</th>
                <th className="px-6 py-3 font-medium">Categoria</th>
                <th className="px-6 py-3 font-medium">Preço</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products?.map((prod) => (
                <tr key={prod.id} className="hover:bg-stone-50">
                  <td className="px-6 py-3">
                    <p className="font-semibold text-stone-800">{prod.name}</p>
                    <p className="text-xs text-stone-500 truncate max-w-[200px]">{prod.description}</p>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap"><span className="bg-stone-100 text-stone-700 px-2 py-1 rounded-md text-xs">{prod.categories?.name}</span></td>
                  <td className="px-6 py-3 font-bold text-stone-900 whitespace-nowrap">
                    R$ {prod.price.toString().replace('.', ',')}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <form action={async () => {
                      'use server'
                      await toggleProductAvailability(prod.id, prod.is_available)
                    }}>
                      <button type="submit" className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold transition ${prod.is_available ? 'text-green-700 bg-green-100 hover:bg-green-200' : 'text-stone-500 bg-stone-100 hover:bg-stone-200'}`}>
                        {prod.is_available ? 'Ativo' : 'Esgotado'}
                      </button>
                    </form>
                  </td>
                  <td className="px-6 py-3 text-right whitespace-nowrap flex items-center justify-end gap-2">
                    <Link href={`/admin/products/${prod.id}`} className="text-blue-500 hover:text-blue-700 p-1 rounded transition" title="Editar">
                      <Edit2 size={16} />
                    </Link>
                    <form action={async () => {
                      'use server'
                      await deleteProduct(prod.id)
                    }}>
                      <button type="submit" className="text-red-500 hover:text-red-700 p-1 rounded transition" title="Excluir">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {!products?.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-stone-400">
                    Nenhum produto cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
