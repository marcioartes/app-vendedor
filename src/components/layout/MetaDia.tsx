import { Phone, FileText, Handshake, CheckCircle, RefreshCw, Flag, AlertCircle, Plus } from 'lucide-react'
import type { Prospect, Etapa } from '../../types'

interface MetaDiaProps {
  prospects: Prospect[]
  onNovo: () => void
  onAbrir: (prospect: Prospect) => void
}

const META = 5

const ETAPA_PROGRESSO: Record<Etapa, number> = {
  contato:    15,
  orcamento:  35,
  negociacao: 55,
  fechado:    75,
  pos_venda:  90,
  concluido:  100,
  perdido:    100,
}

const ETAPA_COR: Record<Etapa, string> = {
  contato:    'bg-blue-400',
  orcamento:  'bg-yellow-400',
  negociacao: 'bg-purple-500',
  fechado:    'bg-green-500',
  pos_venda:  'bg-teal-500',
  concluido:  'bg-green-600',
  perdido:    'bg-red-400',
}

const ETAPA_LABEL: Record<Etapa, string> = {
  contato:    'Contato',
  orcamento:  'Orçamento',
  negociacao: 'Negoc.',
  fechado:    'Fechado',
  pos_venda:  'Pós-venda',
  concluido:  'Concluído',
  perdido:    'Perdido',
}

const ETAPA_TEXT_COR: Record<Etapa, string> = {
  contato:    'text-blue-500',
  orcamento:  'text-yellow-500',
  negociacao: 'text-purple-500',
  fechado:    'text-green-500',
  pos_venda:  'text-teal-500',
  concluido:  'text-green-600',
  perdido:    'text-red-500',
}

const ETAPAS_FUNIL: Etapa[] = ['contato', 'orcamento', 'negociacao', 'fechado', 'pos_venda', 'concluido']

const ETAPA_ICON: Record<Etapa, React.ReactNode> = {
  contato:    <Phone size={12} />,
  orcamento:  <FileText size={12} />,
  negociacao: <Handshake size={12} />,
  fechado:    <CheckCircle size={12} />,
  pos_venda:  <RefreshCw size={12} />,
  concluido:  <Flag size={12} />,
  perdido:    <AlertCircle size={12} />,
}

const MARCACOES = [15, 35, 55, 75, 90]

function getRetornoInfo(proximo_retorno: string) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const retorno = new Date(proximo_retorno + 'T00:00:00')
  if (retorno < hoje) return { label: `Retornar em: ${retorno.toLocaleDateString('pt-BR')}`, urgente: true }
  if (retorno.getTime() === hoje.getTime()) return { label: 'Retornar em: hoje', urgente: false }
  return { label: `Retornar em: ${retorno.toLocaleDateString('pt-BR')}`, urgente: false }
}

export default function MetaDia({ prospects, onNovo, onAbrir }: MetaDiaProps) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const prospectosDoDia = prospects.filter(p => {
    const criado = new Date(p.created_at)
    criado.setHours(0, 0, 0, 0)
    return criado.getTime() === hoje.getTime()
  }).slice(0, META)

  const progresso = prospectosDoDia.length
  const metaBatida = progresso >= META
  const slots = Array.from({ length: META })

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-4">

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Meta do Dia</p>
            <p className={`text-sm font-semibold mt-0.5 ${metaBatida ? 'text-green-600' : 'text-gray-700'}`}>
              {metaBatida ? 'Meta batida! Parabéns!' : `${progresso} de ${META} prospectos`}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {slots.map((_, i) => {
            const prospect = prospectosDoDia[i]

            if (prospect) {
              const retornoInfo = prospect.etapa !== 'concluido' && prospect.etapa !== 'perdido'
                ? getRetornoInfo(prospect.proximo_retorno)
                : null
              const urgente = retornoInfo?.urgente
              const perdido = prospect.etapa === 'perdido'
              const cor = perdido ? 'bg-red-400' : urgente ? 'bg-red-400' : ETAPA_COR[prospect.etapa]
              const pct = ETAPA_PROGRESSO[prospect.etapa]

              return (
                <button key={i} onClick={() => onAbrir(prospect)} className="w-full text-left">
                  {/* Nome e status */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {(urgente || perdido) && (
                        <AlertCircle size={14} className="text-red-500 shrink-0" />
                      )}
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {i + 1}. {prospect.nome_prospecto}
                      </span>
                    </div>
                    <span className={`text-xs font-medium ml-2 shrink-0 flex items-center gap-1 ${perdido ? 'text-red-500' : ETAPA_TEXT_COR[prospect.etapa]}`}>
                      {ETAPA_ICON[prospect.etapa]}
                      {ETAPA_LABEL[prospect.etapa]}
                    </span>
                  </div>

                  {/* Data retorno */}
                  {retornoInfo && (
                    <p className={`text-xs mb-1.5 ${urgente ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                      {retornoInfo.label}
                    </p>
                  )}

                  {/* Barra */}
                  <div className="relative w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${cor}`}
                      style={{ width: `${pct}%` }}
                    />
                    {MARCACOES.map((pos) => (
                      <div
                        key={pos}
                        className="absolute top-0 bottom-0 w-px bg-white opacity-40"
                        style={{ left: `${pos}%` }}
                      />
                    ))}
                  </div>

                  {/* Legenda do funil */}
                  <div className="flex justify-between mt-2">
                    {ETAPAS_FUNIL.map((etapa) => {
                      const ativo = prospect.etapa === etapa
                      return (
                        <div key={etapa} className={`flex flex-col items-center gap-0.5 ${ativo ? ETAPA_TEXT_COR[etapa] : 'text-gray-300'}`}>
                          {ETAPA_ICON[etapa]}
                          <span className="text-xs" style={{ fontSize: '9px' }}>
                            {ETAPA_LABEL[etapa].split('-')[0]}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </button>
              )
            }

            return (
              <button key={i} onClick={onNovo} className="w-full text-left group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-400">{i + 1}. —</span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-blue-500 group-hover:text-blue-700 transition-colors">
                    <Plus size={12} />
                    Iniciar prospecção
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 group-hover:bg-blue-50 transition-colors" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
