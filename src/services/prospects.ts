import { supabase } from '../lib/supabase'
import type { Prospect, ProspectInsert, ProspectUpdate, Status } from '../types'

export async function getProspects(filters?: {
  status?: Status | 'todos'
  search?: string
}): Promise<Prospect[]> {
  let query = supabase.from('prospects').select('*')

  if (filters?.status && filters.status !== 'todos') {
    query = query.eq('status', filters.status)
  }

  if (filters?.search) {
    query = query.or(
      `nome_prospecto.ilike.%${filters.search}%,` +
      `telefone.ilike.%${filters.search}%,` +
      `numero_orcamento_citel.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function createProspect(data: ProspectInsert): Promise<Prospect> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const { data: prospect, error } = await supabase
    .from('prospects')
    .insert({ ...data, vendedor_id: user.id })
    .select()
    .single()

  if (error) throw error
  return prospect
}

export async function updateProspect(id: string, data: ProspectUpdate): Promise<Prospect> {
  const { data: prospect, error } = await supabase
    .from('prospects')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return prospect
}

export async function updateStatus(id: string, status: Status): Promise<void> {
  const { error } = await supabase
    .from('prospects')
    .update({ status })
    .eq('id', id)

  if (error) throw error
}

export async function deleteProspect(id: string): Promise<void> {
  const { error } = await supabase
    .from('prospects')
    .delete()
    .eq('id', id)

  if (error) throw error
}
