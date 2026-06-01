import { Phone, Calendar, FileText, Edit2 } from 'lucide-react'
import type { Prospect, Status } from '../../types'
import ContatoHistorico from './ContatoHistorico'

interface ProspectCardProps {
  prospect: Prospect
  onEdit: (prospect: Prospect) => void
  onStatusChange: (id: string, status: Status) => void
}

function getRetornoInfo(data: string) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const retorno = new Date(data + 'T00:00:00')
  if (retorno < hoje) return { label: 'Atrasado', color: 'text-red-500 bg-red-50' }
  if (retorno.getTime() === hoje.getTime()) return { label: 'Hoje', color: 'text-yellow-600 bg-yellow-50' }
  return { label: retorno.toLocaleDateString('pt-BR'), color: 'text-green-600 bg-green-50' }
}

function getStatusStyle(status: Status) {
  if (status === 'aberto') return 'bg-blue-50 text-blue-600'
  if (status === 'finalizado') return 'bg-green-50 text-green-600'
  return 'bg-red-50 text-red-600'
}

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'aberto', label: 'Aberto' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'perdido', label: 'Perdido' },
]

export default function ProspectCard({ prospect, onEdit, onStatusChange }: ProspectCardProps) {
  const retorno = getRetornoInfo(prospect.proximo_retorno)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">{prospect.nome_prospecto}</h3>
          <p className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
            <Phone size={13} />
            {prospect.telefone}
          </p>
        </div>
        <button
          onClick={() => onEdit(prospect)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400"
        >
          <Edit2 size={16} />
        </button>
      </div>

      {prospect.numero_orcamento_citel && (
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <FileText size={13} />
          Orcamento #{prospect.numero_orcamento_citel}
        </div>
      )}

      <p className="text-sm text-gray-600 line-clamp-2">{prospect.resumo_orcamento}</p>

      <div className="flex items-center justify-between pt-1">
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${retorno.color}`}>
          <Calendar size={12} />
          {retorno.label}
        </span>

        <select
          value={prospect.status}
          onChange={(e) => onStatusChange(prospect.id, e.target.value as Status)}
          className={`text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusStyle(prospect.status)}`}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <ContatoHistorico prospectId={prospect.id} />
    </div>
  )
}
