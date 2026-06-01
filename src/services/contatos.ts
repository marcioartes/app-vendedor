import { supabase } from '../lib/supabase'
import type { Contato } from '../types'

export async function getContatos(prospectId: string): Promise<Contato[]> {
  const { data, error } = await supabase
    .from('contatos')
    .select('*')
    .eq('prospect_id', prospectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createContato(prospectId: string, anotacao: string): Promise<Contato> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const { data, error } = await supabase
    .from('contatos')
    .insert({
      prospect_id: prospectId,
      vendedor_id: user.id,
      anotacao,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteContato(id: string): Promise<void> {
  const { error } = await supabase
    .from('contatos')
    .delete()
    .eq('id', id)

  if (error) throw error
}
