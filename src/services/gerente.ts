import { supabase } from '../lib/supabase'
import type { Prospect } from '../types'

export interface ProspectComVendedor extends Prospect {
  vendedor_nome: string
}

export interface ResumoVendedor {
  vendedor_id: string
  vendedor_nome: string
  total: number
  abertos: number
  finalizados: number
  perdidos: number
  atrasados: number
}

export async function getProspectsComVendedores(): Promise<ProspectComVendedor[]> {
  const [{ data: prospects, error: err1 }, { data: perfis, error: err2 }] = await Promise.all([
    supabase.from('prospects').select('*').order('created_at', { ascending: false }),
    supabase.from('perfis').select('id, nome'),
  ])

  if (err1) throw err1
  if (err2) throw err2

  const perfilMap = new Map((perfis || []).map(p => [p.id, p.nome]))

  return (prospects || []).map(p => ({
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
        abertos: 0,
        finalizados: 0,
        perdidos: 0,
        atrasados: 0,
      })
    }

    const r = map.get(p.vendedor_id)!
    r.total++

    if (p.status === 'aberto') {
      r.abertos++
      const retorno = new Date(p.proximo_retorno + 'T00:00:00')
      if (retorno < hoje) r.atrasados++
    }
    if (p.status === 'finalizado') r.finalizados++
    if (p.status === 'perdido') r.perdidos++
  })

  return Array.from(map.values()).sort((a, b) => b.total - a.total)
}
