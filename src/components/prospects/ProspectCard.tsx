import { Phone, Calendar, Edit2, ChevronRight, FileText } from 'lucide-react'
import type { Prospect, Etapa } from '../../types'
import Timeline from './Timeline'

interface ProspectCardProps {
  prospect: Prospect
  onEdit: (prospect: Prospect) => void
  onAvancar: (prospect: Prospect) => void
}

const ETAPA_CONFIG: Record<Etapa, { label: string; emoji: string; cor: string; proxima?: Etapa }> = {
  contato:    { label: 'Contato',    emoji: '📞', cor: 'bg-blue-50 text-blue-600',    proxima: 'orcamento' },
  orcamento:  { label: 'Orçamento',  emoji: '📋', cor: 'bg-yellow-50 text-yellow-600', proxima: 'negociacao' },
  negociacao: { label: 'Negociação', emoji: '🤝', cor: 'bg-purple-50 text-purple-600', proxima: 'fechado' },
  fechado:    { label: 'Fechado',    emoji: '✅', cor: 'bg-green-50 text-green-600',   proxima: 'pos_venda' },
  pos_venda:  { label: 'Pós-venda', emoji: '🔄', cor: 'bg-teal-50 text-teal-600',    proxima: 'concluido' },
  concluido:  { label: 'Concluído',  emoji: '🏁', cor: 'bg-green-50 text-green-700' },
  perdido:    { label: 'Perdido',    emoji: '❌', cor: 'bg-red-50 text-red-600' },
}

const PROXIMA_LABEL: Record<string, string> = {
  orcamento:  'Avançar para Orçamento',
  negociacao: 'Avançar para Negociação',
  fechado:    'Marcar como Fechado',
  pos_venda:  'Iniciar Pós-venda',
  concluido:  'Concluir',
}

function getRetornoInfo(data: string, etapa: Etapa) {
  if (etapa === 'concluido' || etapa === 'perdido') return null
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const retorno = new Date(data + 'T00:00:00')
  if (retorno < hoje) return { label: `Retornar em: ${retorno.toLocaleDateString('pt-BR')}`, color: 'text-red-500 bg-red-50' }
  if (retorno.getTime() === hoje.getTime()) return { label: 'Retornar em: hoje', color: 'text-yellow-600 bg-yellow-50' }
  return { label: `Retornar em: ${retorno.toLocaleDateString('pt-BR')}`, color: 'text-green-600 bg-green-50' }
}

export default function ProspectCard({ prospect, onEdit, onAvancar }: ProspectCardProps) {
  const config = ETAPA_CONFIG[prospect.etapa]
  const retorno = getRetornoInfo(prospect.proximo_retorno, prospect.etapa)
  const proxima = config.proxima

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${config.cor}`}>
              {config.emoji} {config.label}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900">{prospect.nome_prospecto}</h3>
          <p className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
            <Phone size={13} />
            {prospect.telefone}
          </p>
        </div>
        <button onClick={() => onEdit(prospect)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
          <Edit2 size={16} />
        </button>
      </div>

      {prospect.observacoes && (
        <p className="text-sm text-gray-600 line-clamp-2">{prospect.observacoes}</p>
      )}

      {(prospect.numero_orcamento_citel || prospect.numero_nf) && (
        <div className="flex items-center gap-3 flex-wrap">
          {prospect.numero_orcamento_citel && (
            <p className="flex items-center gap-1 text-xs text-gray-500">
              <FileText size={12} />
              Orç. #{prospect.numero_orcamento_citel}
              {prospect.valor_estimado && ` · R$ ${prospect.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            </p>
          )}
          {prospect.numero_nf && (
            <p className="flex items-center gap-1 text-xs font-medium text-green-600">
              <FileText size={12} />
              NF #{prospect.numero_nf}
            </p>
          )}
        </div>
      )}

      {prospect.etapa === 'perdido' && prospect.motivo_perda && (
        <p className="text-xs text-red-500 italic">"{prospect.motivo_perda}"</p>
      )}

      {prospect.etapa === 'concluido' && prospect.logistica && (
        <p className="text-xs text-gray-500">🚚 {prospect.logistica}</p>
      )}

      <div className="flex items-center justify-between pt-1">
        {retorno ? (
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${retorno.color}`}>
            <Calendar size={12} />
            {retorno.label}
          </span>
        ) : (
          <span className="text-xs text-gray-300">
            {new Date(prospect.proximo_retorno + 'T00:00:00').toLocaleDateString('pt-BR')}
          </span>
        )}

        {proxima && prospect.etapa !== 'perdido' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAvancar({ ...prospect, etapa: proxima })}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              {PROXIMA_LABEL[proxima]}
              <ChevronRight size={14} />
            </button>
            {prospect.etapa !== 'concluido' && (
              <button
                onClick={() => onAvancar({ ...prospect, etapa: 'perdido' })}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                ❌
              </button>
            )}
          </div>
        )}
      </div>

      <Timeline prospectId={prospect.id} etapaAtual={prospect.etapa} />
    </div>
  )
}
