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

// ── Relatório com filtros de data ──────────────────────────────────

export interface RelatorioVendedor {
  vendedor_id: string
  vendedor_nome: string
  total: number
  ativos: number
  fechados: number
  perdidos: number
  taxaConversao: number
  pendentes: number
  atrasados: number
  ultimaAtividade: string | null
}

export interface RelatorioGeral {
  total: number
  ativos: number
  fechados: number
  perdidos: number
  taxaConversao: number
  pendentes: number
  atrasados: number
}

export function filtrarProspectsPorData(
  prospects: ProspectComVendedor[],
  dataInicio: Date,
  dataFim: Date
): ProspectComVendedor[] {
  const inicio = new Date(dataInicio)
  inicio.setHours(0, 0, 0, 0)
  const fim = new Date(dataFim)
  fim.setHours(23, 59, 59, 999)

  return prospects.filter((p) => {
    const criado = new Date(p.created_at)
    return criado >= inicio && criado <= fim
  })
}

export function calcularRelatorioVendedores(
  prospects: ProspectComVendedor[]
): { vendedores: RelatorioVendedor[]; geral: RelatorioGeral } {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const amanha = new Date(hoje)
  amanha.setDate(amanha.getDate() + 1)

  const map = new Map<string, RelatorioVendedor>()

  prospects.forEach((p) => {
    if (!map.has(p.vendedor_id)) {
      map.set(p.vendedor_id, {
        vendedor_id: p.vendedor_id,
        vendedor_nome: p.vendedor_nome,
        total: 0,
        ativos: 0,
        fechados: 0,
        perdidos: 0,
        taxaConversao: 0,
        pendentes: 0,
        atrasados: 0,
        ultimaAtividade: null,
      })
    }

    const r = map.get(p.vendedor_id)!
    r.total++

    if (p.etapa === 'fechado' || p.etapa === 'concluido') {
      r.fechados++
    } else if (p.etapa === 'perdido') {
      r.perdidos++
    } else {
      r.ativos++

      // pendentes = retorno agendado para hoje
      const retorno = new Date(p.proximo_retorno + 'T00:00:00')
      if (retorno >= hoje && retorno < amanha) {
        r.pendentes++
      }

      // atrasados = retorno antes de hoje
      if (retorno < hoje) {
        r.atrasados++
      }
    }

    // última atividade = updated_at mais recente
    if (!r.ultimaAtividade || new Date(p.updated_at) > new Date(r.ultimaAtividade)) {
      r.ultimaAtividade = p.updated_at
    }
  })

  // calcular taxa de conversão para cada vendedor
  map.forEach((r) => {
    r.taxaConversao = r.total > 0 ? Math.round((r.fechados / r.total) * 100) : 0
  })

  const vendedores = Array.from(map.values()).sort((a, b) => b.total - a.total)

  // resumo geral
  const geral: RelatorioGeral = {
    total: 0,
    ativos: 0,
    fechados: 0,
    perdidos: 0,
    taxaConversao: 0,
    pendentes: 0,
    atrasados: 0,
  }

  vendedores.forEach((v) => {
    geral.total += v.total
    geral.ativos += v.ativos
    geral.fechados += v.fechados
    geral.perdidos += v.perdidos
    geral.pendentes += v.pendentes
    geral.atrasados += v.atrasados
  })

  geral.taxaConversao = geral.total > 0 ? Math.round((geral.fechados / geral.total) * 100) : 0

  return { vendedores, geral }
}
