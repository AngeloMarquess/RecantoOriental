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

  // Image Upload Handling
  const imageFile = formData.get('image') as File | null
  let image_url: string | undefined = undefined

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `cat-${Date.now()}.${fileExt}`
    const filePath = `categories/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('category-images')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading category image:', uploadError)
      redirect('/admin/categories?error=Erro ao fazer upload da imagem. Verifique o bucket category-images.')
    }

    const { data: publicUrlData } = supabase.storage
      .from('category-images')
      .getPublicUrl(filePath)
      
    image_url = publicUrlData.publicUrl
  }

  const { error } = await supabase
    .from('categories')
    .insert([{ name, description, sort_order, image_url }])

  if (error) {
    console.error('Error creating category:', error)
    redirect('/admin/categories?error=Erro ao criar categoria: ' + encodeURIComponent(error.message))
  }

  revalidatePath('/admin/categories')
  revalidatePath('/')
  redirect('/admin/categories?success=Categoria adicionada')
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = createAdminClient()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const sort_orderStr = formData.get('sort_order') as string
  const sort_order = parseInt(sort_orderStr || '0')

  // Image Upload Handling
  const imageFile = formData.get('image') as File | null
  
  const updatePayload: any = { name, description, sort_order }

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `cat-update-${Date.now()}.${fileExt}`
    const filePath = `categories/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('category-images')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading category image:', uploadError)
      return { error: 'Erro ao fazer upload da imagem.' }
    }

    const { data: publicUrlData } = supabase.storage
      .from('category-images')
      .getPublicUrl(filePath)
      
    updatePayload.image_url = publicUrlData.publicUrl
  }

  const { error } = await supabase
    .from('categories')
    .update(updatePayload)
    .eq('id', id)

  if (error) {
    console.error('Error updating category:', error)
    return { error: 'Erro ao atualizar categoria.' }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/')
  return { success: true }
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

  // New fields
  const originalPriceStr = formData.get('original_price') as string
  const original_price = originalPriceStr ? parseFloat(originalPriceStr.replace(',','.')) : null
  
  const servesStr = formData.get('serves') as string
  const serves = servesStr ? parseInt(servesStr) : null

  // Image Upload Handling
  const imageFile = formData.get('image') as File | null
  let image_url: string | undefined = undefined

  if (imageFile && imageFile.size > 0) {
    // Generate a unique file name
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `new-${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      redirect('/admin/products?error=Erro ao fazer upload da imagem. Verifique o bucket product-images.')
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)
      
    image_url = publicUrlData.publicUrl
  }

  const { error } = await supabase
    .from('products')
    .insert([{ 
      name, 
      description, 
      price, 
      original_price,
      serves,
      category_id: category_id === '' ? null : category_id,
      image_url
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

// --- ORDERS ACTIONS ---
export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = createAdminClient()

  // Verify auth for safety even though we are using admin client
  const client = await createClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return { error: 'Unauthorized.' }

  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId)

  if (error) {
    console.error('Error updating order:', JSON.stringify(error, null, 2))
    return { error: `Falha ao atualizar: ${error.message || 'Erro desconhecido'}` }
  }

  revalidatePath('/admin/pedidos')
  return { success: true }
}

// --- STORE SETTINGS ACTIONS ---
export async function updateStoreSettings(formData: FormData) {
  const supabase = createAdminClient()
  
  const is_open = formData.get('is_open') === 'true'
  const opening_time = formData.get('opening_time') as string || null
  const closing_time = formData.get('closing_time') as string || null

  const { error } = await supabase
    .from('store_settings')
    .upsert({ 
      id: 1, 
      is_open, 
      opening_time, 
      closing_time 
    })

  if (error) {
    console.error('Error updating store settings:', error)
    redirect('/admin/settings?error=' + encodeURIComponent('Falha ao atualizar configurações da loja: ' + error.message))
  }

  revalidatePath('/admin/settings')
  revalidatePath('/')
  revalidatePath('/checkout')
  redirect('/admin/settings?success=Configurações salvas com sucesso!')
}
