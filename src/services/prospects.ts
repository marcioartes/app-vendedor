import { supabase } from '../lib/supabase'
import type { Prospect, ProspectInsert, ProspectUpdate, Etapa } from '../types'

export async function getProspects(filters?: {
  etapa?: Etapa | 'todos'
  search?: string
}): Promise<Prospect[]> {
  let query = supabase.from('prospects').select('*')

  if (filters?.etapa && filters.etapa !== 'todos') {
    query = query.eq('etapa', filters.etapa)
  }

  if (filters?.search) {
    query = query.or(
      `nome_prospecto.ilike.%${filters.search}%,` +
      `telefone.ilike.%${filters.search}%,` +
      `numero_orcamento_citel.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query.order('created_at', { ascending: false })
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

export async function avancarEtapa(id: string, etapa: Etapa, dados?: ProspectUpdate): Promise<Prospect> {
  const { data: prospect, error } = await supabase
    .from('prospects')
    .update({ etapa, ...dados })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return prospect
}

export async function deleteProspect(id: string): Promise<void> {
  const { error } = await supabase
    .from('prospects')
    .delete()
    .eq('id', id)

  if (error) throw error
}
