import { supabase } from '../lib/supabase'

export interface Perfil {
  id: string
  nome: string
  role: 'vendedor' | 'gerente'
  created_at: string
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getPerfil(userId: string): Promise<Perfil> {
  const { data, error } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}
