import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useProspects } from '../hooks/useProspects'
import Header from '../components/layout/Header'
import FilterBar from '../components/layout/FilterBar'
import AlertaBanner from '../components/layout/AlertaBanner'
import ProspectCard from '../components/prospects/ProspectCard'
import ProspectForm from '../components/prospects/ProspectForm'
import type { Prospect, Status, FilterState, ProspectInsert, ProspectUpdate } from '../types'

export default function DashboardVendedor() {
  const { perfil, signOut } = useAuth()
  const [filters, setFilters] = useState<FilterState>({ status: 'todos', search: '' })
  const { prospects, loading, error, createProspect, updateProspect, updateStatus } = useProspects(filters)
  const [allProspects, setAllProspects] = useState<Prospect[]>([])
  const { prospects: todosProspects } = useProspects({ status: 'todos', search: '' })
  const [showForm, setShowForm] = useState(false)
  const [editingProspect, setEditingProspect] = useState<Prospect | undefined>()

  function handleEdit(prospect: Prospect) {
    setEditingProspect(prospect)
    setShowForm(true)
  }

  function handleClose() {
    setShowForm(false)
    setEditingProspect(undefined)
  }

  async function handleSave(data: ProspectInsert | ProspectUpdate) {
    if (editingProspect) {
      await updateProspect(editingProspect.id, data as ProspectUpdate)
    } else {
      await createProspect(data as ProspectInsert)
    }
  }

  if (!perfil) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header perfil={perfil} onSignOut={signOut} />
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
            onStatusChange={updateStatus}
          />
        ))}
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-2xl px-5 py-3.5 flex items-center gap-2 shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium"
      >
        <Plus size={20} />
        Novo Prospecto
      </button>

      {showForm && (
        <ProspectForm
          prospect={editingProspect}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
