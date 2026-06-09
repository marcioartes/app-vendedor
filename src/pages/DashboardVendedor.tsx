import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useProspects } from '../hooks/useProspects'
import Header from '../components/layout/Header'
import MetaDia from '../components/layout/MetaDia'
import ProspectModal from '../components/prospects/ProspectModal'
import ProspectForm from '../components/prospects/ProspectForm'
import type { Prospect, Etapa, FilterState, ProspectInsert, ProspectUpdate } from '../types'

export default function DashboardVendedor() {
  const { perfil, signOut } = useAuth()
  const [filters] = useState<FilterState>({ etapa: 'todos', search: '' })
  const { prospects, loading, createProspect, updateProspect, avancarEtapa } = useProspects(filters)
  const [showForm, setShowForm] = useState(false)
  const [modalProspect, setModalProspect] = useState<Prospect | null>(null)

  async function handleSalvar(data: ProspectInsert | ProspectUpdate) {
    await createProspect(data as ProspectInsert)
    setShowForm(false)
  }

  async function handleUpdate(id: string, data: ProspectUpdate) {
    await updateProspect(id, data)
    if (modalProspect) {
      setModalProspect({ ...modalProspect, ...data })
    }
  }

  async function handleAvancar(id: string, etapa: Etapa, dados?: ProspectUpdate) {
    await avancarEtapa(id, etapa, dados)
    if (modalProspect) {
      setModalProspect({ ...modalProspect, etapa, ...dados })
    }
  }

  if (!perfil) return null

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const etapasFinalizadas = ['fechado', 'concluido', 'perdido']

  const atrasados = prospects.filter(p => {
    if (etapasFinalizadas.includes(p.etapa)) return false
    return new Date(p.proximo_retorno + 'T00:00:00') < hoje
  })

  const pendentes = prospects.filter(p => {
    if (etapasFinalizadas.includes(p.etapa)) return false
    const criado = new Date(p.created_at)
    criado.setHours(0, 0, 0, 0)
    return criado.getTime() !== hoje.getTime()
  })

  /*const atrasados = prospects.filter(p => {
    if (p.etapa === 'fechado' || p.etapa === 'perdido') return false
    return new Date(p.proximo_retorno + 'T00:00:00') < hoje
  })

  const pendentes = prospects.filter(p => {
    if (p.etapa === 'fechado' || p.etapa === 'perdido') return false
    const criado = new Date(p.created_at)
    criado.setHours(0, 0, 0, 0)
    return criado.getTime() !== hoje.getTime()
  })*/

  return (
    <div className="min-h-screen bg-gray-50">
      <Header perfil={perfil} onSignOut={signOut} />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          {/* Meta do dia */}
          <MetaDia
            prospects={prospects}
            onNovo={() => setShowForm(true)}
            onAbrir={(p) => setModalProspect(p)}
          />

          {/* Alertas */}
          <div className="max-w-2xl mx-auto px-4 pt-4 space-y-2">
            {atrasados.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 flex items-center justify-between">
                <p className="text-sm text-red-700 font-medium">
                  ⚠️ {atrasados.length} retorno(s) atrasado(s)
                </p>
                <div className="flex gap-2 overflow-x-auto">
                  {atrasados.slice(0, 3).map(p => (
                    <button
                      key={p.id}
                      onClick={() => setModalProspect(p)}
                      className="text-xs bg-white text-red-600 px-2 py-1 rounded-lg whitespace-nowrap border border-red-100"
                    >
                      {p.nome_prospecto}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {pendentes.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-2xl px-4 py-3 flex items-center justify-between">
                <p className="text-sm text-yellow-700 font-medium">
                  📋 {pendentes.length} prospecto(s) pendente(s)
                </p>
                <div className="flex gap-2 overflow-x-auto">
                  {pendentes.slice(0, 3).map(p => (
                    <button
                      key={p.id}
                      onClick={() => setModalProspect(p)}
                      className="text-xs bg-white text-yellow-600 px-2 py-1 rounded-lg whitespace-nowrap border border-yellow-100"
                    >
                      {p.nome_prospecto}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal do prospecto */}
      {modalProspect && (
        <ProspectModal
          prospect={modalProspect}
          onClose={() => setModalProspect(null)}
          onUpdate={handleUpdate}
          onAvancar={handleAvancar}
        />
      )}

      {/* Formulário novo prospecto */}
      {showForm && (
        <ProspectForm
          etapaInicial="contato"
          onSave={handleSalvar}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
