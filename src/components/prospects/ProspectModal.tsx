import { useState } from 'react'
import { X, Phone, ChevronRight, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Prospect, Etapa, ProspectUpdate } from '../../types'
import Timeline from './Timeline'
import ProspectForm from './ProspectForm'
import ModalFechamento from './ModalFechamento'

interface ProspectModalProps {
  prospect: Prospect
  onClose: () => void
  onUpdate: (id: string, data: ProspectUpdate) => Promise<void>
  onAvancar: (id: string, etapa: Etapa, dados?: ProspectUpdate) => Promise<void>
}

const ETAPA_CONFIG: Record<Etapa, { label: string; cor: string; progresso: number; proxima?: Etapa }> = {
  contato:    { label: 'Contato',    cor: 'bg-blue-400',   progresso: 15,  proxima: 'orcamento' },
  orcamento:  { label: 'Orçamento',  cor: 'bg-yellow-400', progresso: 35,  proxima: 'negociacao' },
  negociacao: { label: 'Negociação', cor: 'bg-purple-500', progresso: 55,  proxima: 'fechado' },
  fechado:    { label: 'Fechado',    cor: 'bg-green-500',  progresso: 75 },
  pos_venda:  { label: 'Pós-venda', cor: 'bg-teal-500',   progresso: 90,  proxima: 'concluido' },
  concluido:  { label: 'Concluído',  cor: 'bg-green-600',  progresso: 100 },
  perdido:    { label: 'Perdido',    cor: 'bg-red-400',    progresso: 0 },
}

const PROXIMA_LABEL: Record<string, string> = {
  orcamento:  'Avançar para Orçamento',
  negociacao: 'Avançar para Negociação',
  fechado:    'Marcar como Fechado',
  pos_venda:  'Iniciar Pós-venda',
  concluido:  'Concluir',
}

const ETAPAS_FUNIL: Etapa[] = ['contato', 'orcamento', 'negociacao', 'fechado', 'pos_venda', 'concluido']

export default function ProspectModal({ prospect, onClose, onUpdate, onAvancar }: ProspectModalProps) {
  const [editando, setEditando] = useState(false)
  const [avancando, setAvancando] = useState<Etapa | null>(null)
  const [showFechamento, setShowFechamento] = useState(false)
  const [prospectAtual, setProspectAtual] = useState(prospect)

  const config = ETAPA_CONFIG[prospectAtual.etapa]
  const proxima = config.proxima

  async function handleSalvarEdicao(data: ProspectUpdate) {
    await onUpdate(prospectAtual.id, data)
    setProspectAtual({ ...prospectAtual, ...data })
    setEditando(false)
    toast.success('Prospecto atualizado!')
  }

  async function handleAvancar(etapa: Etapa, data?: ProspectUpdate) {
    // Se está avançando para fechado, mostra modal de fechamento
    if (etapa === 'fechado') {
      await onAvancar(prospectAtual.id, 'fechado', data)
      setProspectAtual({ ...prospectAtual, etapa: 'fechado', ...data })
      setAvancando(null)
      setShowFechamento(true)
      return
    }
    await onAvancar(prospectAtual.id, etapa, data)
    setProspectAtual({ ...prospectAtual, etapa, ...data })
    setAvancando(null)
    toast.success('Etapa atualizada!')
  }

  async function handleAgendarPosVenda(dataRetorno: string) {
    await onAvancar(prospectAtual.id, 'pos_venda', { proximo_retorno: dataRetorno })
    setProspectAtual({ ...prospectAtual, etapa: 'pos_venda', proximo_retorno: dataRetorno })
    setShowFechamento(false)
    toast.success('Pós-venda agendado!')
  }

  async function handleConcluirDireto() {
    await onAvancar(prospectAtual.id, 'concluido')
    setProspectAtual({ ...prospectAtual, etapa: 'concluido' })
    setShowFechamento(false)
    toast.success('Venda concluída!')
  }

  if (editando) {
    return (
      <ProspectForm
        prospect={prospectAtual}
        etapaInicial={prospectAtual.etapa}
        onSave={handleSalvarEdicao}
        onClose={() => setEditando(false)}
      />
    )
  }

  if (avancando) {
    return (
      <ProspectForm
        prospect={prospectAtual}
        etapaInicial={avancando}
        onSave={(data) => handleAvancar(avancando, data as ProspectUpdate)}
        onClose={() => setAvancando(null)}
      />
    )
  }

  if (showFechamento) {
    return (
      <ModalFechamento
        nomeProspecto={prospectAtual.nome_prospecto}
        onAgendar={handleAgendarPosVenda}
        onConcluir={handleConcluirDireto}
        onClose={() => setShowFechamento(false)}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">

        <div className="sticky top-0 bg-white px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">{prospectAtual.nome_prospecto}</h2>
            <p className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
              <Phone size={13} />
              {prospectAtual.telefone}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setEditando(true)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
              <Edit2 size={16} />
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">

          {/* Barra de progresso */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
                prospectAtual.etapa === 'contato'    ? 'bg-blue-50 text-blue-600' :
                prospectAtual.etapa === 'orcamento'  ? 'bg-yellow-50 text-yellow-600' :
                prospectAtual.etapa === 'negociacao' ? 'bg-purple-50 text-purple-600' :
                prospectAtual.etapa === 'fechado'    ? 'bg-green-50 text-green-600' :
                prospectAtual.etapa === 'pos_venda'  ? 'bg-teal-50 text-teal-600' :
                prospectAtual.etapa === 'concluido'  ? 'bg-green-50 text-green-700' :
                'bg-red-50 text-red-600'
              }`}>
                {config.label}
              </span>
              <span className="text-xs text-gray-400">{config.progresso}%</span>
            </div>

            <div className="relative w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${config.cor}`}
                style={{ width: `${config.progresso}%` }}
              />
              {ETAPAS_FUNIL.map((etapa) => {
                const pos = ETAPA_CONFIG[etapa].progresso
                if (pos === 100) return null
                return (
                  <div
                    key={etapa}
                    className="absolute top-0 bottom-0 w-px bg-white opacity-40"
                    style={{ left: `${pos}%` }}
                  />
                )
              })}
            </div>

            <div className="flex justify-between mt-1">
              {ETAPAS_FUNIL.map((e) => (
                <span key={e} className={`text-xs ${prospectAtual.etapa === e ? 'text-gray-700 font-medium' : 'text-gray-300'}`}>
                  {ETAPA_CONFIG[e].label.charAt(0)}
                </span>
              ))}
            </div>
          </div>

          {/* Dados */}
          {prospectAtual.observacoes && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Observações</p>
              <p className="text-sm text-gray-700">{prospectAtual.observacoes}</p>
            </div>
          )}

          {prospectAtual.numero_orcamento_citel && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Orçamento</p>
              <p className="text-sm text-gray-700">
                #{prospectAtual.numero_orcamento_citel}
                {prospectAtual.valor_estimado && ` · R$ ${prospectAtual.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              </p>
              {prospectAtual.numero_nf && (
                <p className="text-sm text-green-600 font-medium mt-1">NF #{prospectAtual.numero_nf}</p>
              )}
            </div>
          )}

          {prospectAtual.etapa === 'perdido' && prospectAtual.motivo_perda && (
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-xs text-red-400 mb-1">Motivo da perda</p>
              <p className="text-sm text-red-700">"{prospectAtual.motivo_perda}"</p>
            </div>
          )}

          {prospectAtual.etapa === 'concluido' && prospectAtual.logistica && (
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-xs text-green-400 mb-1">Logística</p>
              <p className="text-sm text-green-700">🚚 {prospectAtual.logistica}</p>
            </div>
          )}

          {/* Botões de avanço */}
          {proxima && prospectAtual.etapa !== 'perdido' && prospectAtual.etapa !== 'concluido' && (
            <div className="flex gap-2">
              <button
                onClick={() => setAvancando(proxima)}
                className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                {PROXIMA_LABEL[proxima]}
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setAvancando('perdido')}
                className="px-4 py-2.5 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
              >
                Perdido
              </button>
            </div>
          )}

          <Timeline prospectId={prospectAtual.id} etapaAtual={prospectAtual.etapa} />
        </div>
      </div>
    </div>
  )
}
