import { createClient } from '@supabase/supabase-js'

// Cria um cliente com a Service Role Key que ignora políticas RLS.
// IMPORTANTE: Este cliente SÓ deve ser usado em Server Actions protegidas!
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
