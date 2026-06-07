import { supabase } from '../lib/supabase'
import type { Prospect } from '../types'

export interface ProspectComVendedor extends Prospect {
  vendedor_nome: string
}

export interface ResumoVendedor {
  vendedor_id: string
  vendedor_nome: string
  total: number
  contato: number
  orcamento: number
  negociacao: number
  fechado: number
  pos_venda: number
  concluido: number
  perdido: number
  atrasados: number
}

export async function getProspectsComVendedores(): Promise<ProspectComVendedor[]> {
  const [{ data: prospects, error: err1 }, { data: perfis, error: err2 }] = await Promise.all([
    supabase.from('prospects').select('*').order('created_at', { ascending: false }),
    supabase.from('perfis').select('id, nome'),
  ])

  if (err1) throw err1
  if (err2) throw err2

  const perfilMap = new Map((perfis || []).map((p: { id: string; nome: string }) => [p.id, p.nome]))

  return (prospects || []).map((p: any) => ({
    ...p,
    vendedor_nome: perfilMap.get(p.vendedor_id) || 'Desconhecido',
  }))
}

export function calcularResumoVendedores(prospects: ProspectComVendedor[]): ResumoVendedor[] {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const map = new Map<string, ResumoVendedor>()

  prospects.forEach((p) => {
    if (!map.has(p.vendedor_id)) {
      map.set(p.vendedor_id, {
        vendedor_id: p.vendedor_id,
        vendedor_nome: p.vendedor_nome,
        total: 0,
        contato: 0,
        orcamento: 0,
        negociacao: 0,
        fechado: 0,
        pos_venda: 0,
        concluido: 0,
        perdido: 0,
        atrasados: 0,
      })
    }

    const r = map.get(p.vendedor_id)!
    r.total++

    if (p.etapa === 'contato') r.contato++
    else if (p.etapa === 'orcamento') r.orcamento++
    else if (p.etapa === 'negociacao') r.negociacao++
    else if (p.etapa === 'fechado') r.fechado++
    else if (p.etapa === 'pos_venda') r.pos_venda++
    else if (p.etapa === 'concluido') r.concluido++
    else if (p.etapa === 'perdido') r.perdido++

    if (!['fechado', 'concluido', 'perdido'].includes(p.etapa)) {
      const retorno = new Date(p.proximo_retorno + 'T00:00:00')
      if (retorno < hoje) r.atrasados++
    }
  })

  return Array.from(map.values()).sort((a, b) => b.fechado - a.fechado)
}
