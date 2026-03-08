'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

// --- Product Updates ---
export async function updateProductDetails(productId: string, formData: FormData) {
  const adminSupabase = createAdminClient()
  
  const name = formData.get('name') as string
  const category_id = formData.get('category_id') as string
  const price = parseFloat(formData.get('price') as string)
  const description = formData.get('description') as string
  
  // New Fields
  const originalPriceStr = formData.get('original_price') as string
  const original_price = originalPriceStr ? parseFloat(originalPriceStr) : null
  
  const servesStr = formData.get('serves') as string
  const serves = servesStr ? parseInt(servesStr) : null

  // Image Upload Handling
  const imageFile = formData.get('image') as File | null
  let image_url: string | undefined = undefined

  if (imageFile && imageFile.size > 0) {
    // Generate a unique file name
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${productId}-${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from('product-images')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      return { error: 'Garantir que a pasta (bucket) `product-images` foi criada e é pública no Supabase.' }
    }

    // Get public URL
    const { data: publicUrlData } = adminSupabase.storage
      .from('product-images')
      .getPublicUrl(filePath)
      
    image_url = publicUrlData.publicUrl
  }

  // Build update payload dynamically
  const updatePayload: any = { 
    name, 
    category_id, 
    price, 
    description,
    original_price,
    serves
  }
  
  if (image_url) {
    updatePayload.image_url = image_url;
  }

  const { error } = await adminSupabase
    .from('products')
    .update(updatePayload)
    .eq('id', productId)

  if (error) {
    console.error('Error updating product:', error)
    return { error: 'Erro ao atualizar produto.' }
  }

  revalidatePath(`/admin/products/${productId}`)
  revalidatePath('/admin/products')
  revalidatePath('/')
  return { success: true }
}

// --- Complements Categories ---
export async function createComplementCategory(productId: string, formData: FormData) {
  const adminSupabase = createAdminClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const min_selections = parseInt(formData.get('min_selections') as string) || 0
  const max_selections = parseInt(formData.get('max_selections') as string) || 1
  const is_required = formData.get('is_required') === 'on'

  const { error } = await adminSupabase
    .from('product_complement_categories')
    .insert({
      product_id: productId,
      name,
      description,
      min_selections,
      max_selections,
      is_required
    })

  if (error) {
    console.error('Error creating complement category:', error)
    return { error: 'Erro ao criar categoria de complemento.' }
  }

  revalidatePath(`/admin/products/${productId}`)
  return { success: true }
}

export async function deleteComplementCategory(productId: string, categoryId: string) {
  const adminSupabase = createAdminClient()

  const { error } = await adminSupabase
    .from('product_complement_categories')
    .delete()
    .eq('id', categoryId)

  if (error) {
    console.error('Error deleting complement category:', error)
    return { error: 'Erro ao deletar categoria.' }
  }

  revalidatePath(`/admin/products/${productId}`)
  return { success: true }
}

// --- Complements Items ---
export async function createComplementItem(productId: string, categoryId: string, formData: FormData) {
  const adminSupabase = createAdminClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string) || 0

  const { error } = await adminSupabase
    .from('product_complements')
    .insert({
      category_id: categoryId,
      name,
      description,
      price
    })

  if (error) {
    console.error('Error creating complement item:', error)
    return { error: 'Erro ao criar complemento.' }
  }

  revalidatePath(`/admin/products/${productId}`)
  return { success: true }
}

export async function updateComplementItem(productId: string, itemId: string, formData: FormData) {
  const adminSupabase = createAdminClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string) || 0

  const { error } = await adminSupabase
    .from('product_complements')
    .update({
      name,
      description,
      price
    })
    .eq('id', itemId)

  if (error) {
    console.error('Error updating complement item:', error)
    return { error: 'Erro ao atualizar complemento.' }
  }

  revalidatePath(`/admin/products/${productId}`)
  return { success: true }
}

export async function deleteComplementItem(productId: string, itemId: string) {
  const adminSupabase = createAdminClient()

  const { error } = await adminSupabase
    .from('product_complements')
    .delete()
    .eq('id', itemId)

  if (error) {
    console.error('Error deleting complement item:', error)
    return { error: 'Erro ao deletar complemento.' }
  }

  revalidatePath(`/admin/products/${productId}`)
  return { success: true }
}
