'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Login error:', error.message)
    if (error.message.includes('Invalid login credentials')) {
      redirect('/login?error=Email ou senha incorretos.')
    }
    if (error.message.includes('Email not confirmed')) {
      redirect('/login?error=Por favor, confirme seu email antes de fazer login.')
    }
    redirect('/login?error=Não foi possível fazer login. Verifique suas credenciais e tente novamente.')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    redirect('/signup?error=As senhas não coincidem.')
  }

  const data = {
    email: formData.get('email') as string,
    password,
    options: {
      data: {
        full_name: formData.get('fullName') as string,
        phone_number: formData.get('phone') as string,
        role: 'customer' // Padrão
      }
    }
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Signup error:', error.message)
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  // Se precisar de confirmação de e-mail:
  redirect('/login?message=Verifique seu e-mail para confirmar a conta.')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
