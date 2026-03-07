'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// CATEGORIES ACTIONS
export async function createCategory(formData: FormData) {
  const supabase = createAdminClient()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const sort_order = parseInt((formData.get('sort_order') as string) || '0')

  const { error } = await supabase
    .from('categories')
    .insert([{ name, description, sort_order }])

  if (error) {
    console.error('Error creating category:', error)
    redirect('/admin/categories?error=Erro ao criar categoria: ' + encodeURIComponent(error.message))
  }

  revalidatePath('/admin/categories')
  redirect('/admin/categories?success=Categoria adicionada')
}

export async function deleteCategory(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  
  if (error) {
    console.error('Error deleting category:', error)
    redirect('/admin/categories?error=Erro ao excluir. Verifique se existem produtos nela.')
  }

  revalidatePath('/admin/categories')
  redirect('/admin/categories?success=Categoria excluída')
}

// PRODUCTS ACTIONS
export async function createProduct(formData: FormData) {
  const supabase = createAdminClient()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat((formData.get('price') as string).replace(',','.'))
  const category_id = formData.get('category_id') as string

  // Temporarily ignoring image uploads for simplicity
  const { error } = await supabase
    .from('products')
    .insert([{ 
      name, 
      description, 
      price, 
      category_id: category_id === '' ? null : category_id 
    }])

  if (error) {
    console.error('Error creating product:', error)
    redirect('/admin/products?error=Erro ao cadastrar produto: ' + encodeURIComponent(error.message))
  }

  revalidatePath('/admin/products')
  redirect('/admin/products?success=Produto adicionado')
}

export async function toggleProductAvailability(id: string, currentStatus: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('products')
    .update({ is_available: !currentStatus })
    .eq('id', id)

  if (error) {
    console.error('Error updating product:', error)
    return { success: false }
  }

  revalidatePath('/admin/products')
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  
  if (error) {
    console.error('Error deleting product:', error)
    redirect('/admin/products?error=Erro ao excluir produto.')
  }

  revalidatePath('/admin/products')
  redirect('/admin/products?success=Produto excluído')
}
