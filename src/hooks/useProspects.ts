import { useState, useEffect, useRef } from 'react'
import type { Prospect, Status, FilterState, ProspectInsert, ProspectUpdate } from '../types'
import * as prospectService from '../services/prospects'

function ordenarProspects(prospects: Prospect[]): Prospect[] {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const abertosAtrasados: Prospect[] = []
  const abertosHoje: Prospect[] = []
  const abertosFuturos: Prospect[] = []
  const finalizados: Prospect[] = []
  const perdidos: Prospect[] = []

  prospects.forEach((p) => {
    if (p.status === 'finalizado') { finalizados.push(p); return }
    if (p.status === 'perdido') { perdidos.push(p); return }
    const retorno = new Date(p.proximo_retorno + 'T00:00:00')
    if (retorno < hoje) { abertosAtrasados.push(p); return }
    if (retorno.getTime() === hoje.getTime()) { abertosHoje.push(p); return }
    abertosFuturos.push(p)
  })

  const sortByRetorno = (a: Prospect, b: Prospect) =>
    new Date(a.proximo_retorno).getTime() - new Date(b.proximo_retorno).getTime()

  const sortByUpdated = (a: Prospect, b: Prospect) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()

  return [
    ...abertosAtrasados.sort(sortByRetorno),
    ...abertosHoje,
    ...abertosFuturos.sort(sortByRetorno),
    ...finalizados.sort(sortByUpdated),
    ...perdidos.sort(sortByUpdated),
  ]
}

export function useProspects(filters: FilterState) {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const statusRef = useRef(filters.status)
  const searchRef = useRef(filters.search)

  useEffect(() => {
    statusRef.current = filters.status
    searchRef.current = filters.search

    async function fetch() {
      try {
        setLoading(true)
        setError(null)
        const data = await prospectService.getProspects({
          status: statusRef.current,
          search: searchRef.current,
        })
        setProspects(ordenarProspects(data))
      } catch (err) {
        setError('Erro ao carregar prospectos')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [filters.status, filters.search])

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

  async function updateStatus(id: string, status: Status) {
    await prospectService.updateStatus(id, status)
    setProspects((prev) =>
      ordenarProspects(prev.map((p) => (p.id === id ? { ...p, status } : p)))
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
    updateStatus,
    deleteProspect,
  }
}
