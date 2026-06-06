import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useProspects } from '../hooks/useProspects'
import Header from '../components/layout/Header'
import FilterBar from '../components/layout/FilterBar'
import AlertaBanner from '../components/layout/AlertaBanner'
import ProspectCard from '../components/prospects/ProspectCard'
import ProspectForm from '../components/prospects/ProspectForm'
import type { Prospect, Etapa, FilterState, ProspectInsert, ProspectUpdate } from '../types'

export default function DashboardVendedor() {
  const { perfil, signOut } = useAuth()
  const [filters, setFilters] = useState<FilterState>({ etapa: 'todos', search: '' })
  const { prospects, loading, error, createProspect, updateProspect, avancarEtapa } = useProspects(filters)
  const { prospects: todosProspects } = useProspects({ etapa: 'todos', search: '' })
  const [showForm, setShowForm] = useState(false)
  const [editingProspect, setEditingProspect] = useState<Prospect | undefined>()
  const [etapaForm, setEtapaForm] = useState<Etapa>('contato')

  function handleEdit(prospect: Prospect) {
    setEditingProspect(prospect)
    setEtapaForm(prospect.etapa)
    setShowForm(true)
  }

  function handleAvancar(prospect: Prospect) {
    setEditingProspect(prospect)
    setEtapaForm(prospect.etapa)
    setShowForm(true)
  }

  function handleClose() {
    setShowForm(false)
    setEditingProspect(undefined)
    setEtapaForm('contato')
  }

  async function handleSave(data: ProspectInsert | ProspectUpdate) {
    if (editingProspect) {
      await avancarEtapa(editingProspect.id, etapaForm, data as ProspectUpdate)
    } else {
      await createProspect(data as ProspectInsert)
    }
  }

  if (!perfil) return null

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const contatosHoje = todosProspects.filter(p => {
    if (p.etapa === 'fechado' || p.etapa === 'perdido') return false
    const retorno = new Date(p.proximo_retorno + 'T00:00:00')
    return retorno.getTime() === hoje.getTime()
  }).length

  const atrasados = todosProspects.filter(p => {
    if (p.etapa === 'fechado' || p.etapa === 'perdido') return false
    const retorno = new Date(p.proximo_retorno + 'T00:00:00')
    return retorno < hoje
  }).length

  const emNegociacao = todosProspects.filter(p => p.etapa === 'negociacao').length
  const fechadosHoje = todosProspects.filter(p => {
    if (p.etapa !== 'fechado') return false
    const updated = new Date(p.updated_at)
    updated.setHours(0, 0, 0, 0)
    return updated.getTime() === hoje.getTime()
  }).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header perfil={perfil} onSignOut={signOut} />

      {/* Métricas do dia */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Meu Dia</p>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <p className="text-xl font-bold text-blue-600">{todosProspects.filter(p => p.etapa !== 'fechado' && p.etapa !== 'perdido').length}</p>
              <p className="text-xs text-gray-400">ativos</p>
            </div>
            <div className="text-center">
              <p className={`text-xl font-bold ${atrasados > 0 ? 'text-red-500' : 'text-gray-300'}`}>{atrasados}</p>
              <p className="text-xs text-gray-400">atrasados</p>
            </div>
            <div className="text-center">
              <p className={`text-xl font-bold ${contatosHoje > 0 ? 'text-yellow-500' : 'text-gray-300'}`}>{contatosHoje}</p>
              <p className="text-xs text-gray-400">hoje</p>
            </div>
            <div className="text-center">
              <p className={`text-xl font-bold ${emNegociacao > 0 ? 'text-purple-600' : 'text-gray-300'}`}>{emNegociacao}</p>
              <p className="text-xs text-gray-400">negociando</p>
            </div>
          </div>
        </div>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />
      <AlertaBanner prospects={todosProspects} />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {!loading && prospects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">Nenhum prospecto encontrado</p>
            <p className="text-gray-300 text-xs mt-1">Clique em + para adicionar o primeiro</p>
          </div>
        )}

        {prospects.map((prospect) => (
          <ProspectCard
            key={prospect.id}
            prospect={prospect}
            onEdit={handleEdit}
            onAvancar={handleAvancar}
          />
        ))}
      </div>

      <button
        onClick={() => {
          setEditingProspect(undefined)
          setEtapaForm('contato')
          setShowForm(true)
        }}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-2xl px-5 py-3.5 flex items-center gap-2 shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium"
      >
        <Plus size={20} />
        Novo Prospecto
      </button>

      {showForm && (
        <ProspectForm
          prospect={editingProspect}
          etapaInicial={etapaForm}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
