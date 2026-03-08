import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import ProductDetailsClient from './ProductDetailsClient'

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const { id } = resolvedParams

  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Ensure Admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    console.warn('User attempted to access admin product editor without permission:', user.email);
    // redirect('/') 
  }

  // Fetch Product
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('id', id)
    .single()

  if (productError || !product) {
    redirect('/admin/products')
  }

  // Fetch Categories for Dropdown
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('sort_order', { ascending: true })

  // Fetch Complement Categories + Items for this Product
  const { data: complementCats } = await supabase
    .from('product_complement_categories')
    .select('*, product_complements(*)')
    .eq('product_id', id)
    .order('sort_order', { ascending: true })

  // Ensure we sort the nested array
  if (complementCats) {
    complementCats.forEach(cat => {
      cat.product_complements?.sort((a: any, b: any) => a.sort_order - b.sort_order)
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition text-stone-500">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Editar Produto</h1>
          <p className="text-sm text-stone-500">#{product.id.split('-')[0]}</p>
        </div>
      </div>

      <ProductDetailsClient 
        product={product} 
        categories={categories || []}
        complementCategories={complementCats || []}
      />
      
    </div>
  )
}
