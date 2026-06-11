import { supabase } from '../lib/supabase'

export interface Perfil {
  id: string
  nome: string
  role: 'vendedor' | 'gerente'
  created_at: string
  avatar_url: string | null
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

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  const filePath = `${userId}/avatar.${ext}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })

  if (uploadError) throw uploadError

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  // Update profile with avatar URL (cache-busting)
  const urlWithCache = `${publicUrl}?t=${Date.now()}`
  const { error: updateError } = await supabase
    .from('perfis')
    .update({ avatar_url: urlWithCache })
    .eq('id', userId)

  if (updateError) throw updateError

  return urlWithCache
}
