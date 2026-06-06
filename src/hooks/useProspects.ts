import { useState, useEffect } from 'react'
import type { Prospect, Etapa, FilterState, ProspectInsert, ProspectUpdate } from '../types'
import * as prospectService from '../services/prospects'

function ordenarProspects(prospects: Prospect[]): Prospect[] {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const contatoAtrasados: Prospect[] = []
  const contatoHoje: Prospect[] = []
  const contatoFuturos: Prospect[] = []
  const orcamento: Prospect[] = []
  const negociacao: Prospect[] = []
  const fechados: Prospect[] = []
  const perdidos: Prospect[] = []

  prospects.forEach((p) => {
    if (p.etapa === 'fechado') { fechados.push(p); return }
    if (p.etapa === 'perdido') { perdidos.push(p); return }
    if (p.etapa === 'negociacao') { negociacao.push(p); return }
    if (p.etapa === 'orcamento') { orcamento.push(p); return }

    const retorno = new Date(p.proximo_retorno + 'T00:00:00')
    if (retorno < hoje) { contatoAtrasados.push(p); return }
    if (retorno.getTime() === hoje.getTime()) { contatoHoje.push(p); return }
    contatoFuturos.push(p)
  })

  const sortByRetorno = (a: Prospect, b: Prospect) =>
    new Date(a.proximo_retorno).getTime() - new Date(b.proximo_retorno).getTime()

  const sortByUpdated = (a: Prospect, b: Prospect) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()

  return [
    ...contatoAtrasados.sort(sortByRetorno),
    ...contatoHoje,
    ...contatoFuturos.sort(sortByRetorno),
    ...orcamento.sort(sortByUpdated),
    ...negociacao.sort(sortByUpdated),
    ...fechados.sort(sortByUpdated),
    ...perdidos.sort(sortByUpdated),
  ]
}

export function useProspects(filters: FilterState) {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true)
        setError(null)
        const data = await prospectService.getProspects(filters)
        setProspects(ordenarProspects(data))
      } catch (err) {
        setError('Erro ao carregar prospectos')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [filters.etapa, filters.search])

  async function createProspect(data: ProspectInsert) {
    const novo = await prospectService.createProspect(data)
    setProspects((prev) => ordenarProspects([novo, ...prev]))
  }

  async function updateProspect(id: string, data: ProspectUpdate) {
    const atualizado = await prospectService.updateProspect(id, data)
    setProspects((prev) =>
      ordenarProspects(prev.map((p) => (p.id === id ? atualizado : p)))
    )
  }

  async function avancarEtapa(id: string, etapa: Etapa, dados?: ProspectUpdate) {
    const atualizado = await prospectService.avancarEtapa(id, etapa, dados)
    setProspects((prev) =>
      ordenarProspects(prev.map((p) => (p.id === id ? atualizado : p)))
    )
  }

  async function deleteProspect(id: string) {
    await prospectService.deleteProspect(id)
    setProspects((prev) => prev.filter((p) => p.id !== id))
  }

  return {
    prospects,
    loading,
    error,
    createProspect,
    updateProspect,
    avancarEtapa,
    deleteProspect,
  }
}
