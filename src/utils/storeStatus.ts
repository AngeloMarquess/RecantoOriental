import { createClient } from '@/utils/supabase/server'

export type StoreSettings = {
  is_open: boolean
  opening_time: string | null
  closing_time: string | null
}

export async function getStoreStatus(): Promise<{ isOpen: boolean; reason?: string }> {
  const supabase = await createClient()

  const { data: settings } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', 1)
    .single()

  if (!settings) {
    return { isOpen: true } // Default open if no settings configured
  }

  if (!settings.is_open) {
    return { isOpen: false, reason: 'manual' }
  }

  if (settings.opening_time && settings.closing_time) {
    // Check operating hours based on BRT (UTC-3)
    const now = new Date()
    // Create Date objects for today with the setting's time to compare
    const currentStr = now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour12: false })
    const currentTime = currentStr.slice(0, 5) // HH:MM

    const openTime = settings.opening_time.slice(0, 5)
    const closeTime = settings.closing_time.slice(0, 5)

    let isWithinHours = false

    // Handle overnight shifts (e.g. 18:00 to 02:00)
    if (closeTime < openTime) {
      isWithinHours = currentTime >= openTime || currentTime <= closeTime
    } else {
      // Normal shift (e.g. 10:00 to 22:00)
      isWithinHours = currentTime >= openTime && currentTime <= closeTime
    }

    if (!isWithinHours) {
      return { isOpen: false, reason: 'hours' }
    }
  }

  return { isOpen: true }
}
