import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import type { Prospect, ProspectInsert, ProspectUpdate, Etapa } from '../../types'

interface ProspectFormProps {
  prospect?: Prospect
  etapaInicial?: Etapa
  onSave: (data: ProspectInsert | ProspectUpdate) => Promise<void>
  onClose: () => void
}

const ETAPA_LABEL: Record<Etapa, string> = {
  contato:    'Contato',
  orcamento:  'Orçamento',
  negociacao: 'Negociação',
  fechado:    'Fechado',
  pos_venda:  'Pós-venda',
  concluido:  'Concluído',
  perdido:    'Perdido',
}

export default function ProspectForm({ prospect, etapaInicial, onSave, onClose }: ProspectFormProps) {
  const [loading, setLoading] = useState(false)
  const etapa = etapaInicial || prospect?.etapa || 'contato'

  const [form, setForm] = useState({
    nome_prospecto: prospect?.nome_prospecto ?? '',
    telefone: prospect?.telefone ?? '',
    observacoes: prospect?.observacoes ?? '',
    proximo_retorno: prospect?.proximo_retorno ?? '',
    cliente_codigo_citel: prospect?.cliente_codigo_citel ?? '',
    numero_orcamento_citel: prospect?.numero_orcamento_citel ?? '',
    valor_estimado: prospect?.valor_estimado?.toString() ?? '',
    numero_nf: prospect?.numero_nf ?? '',
    logistica: prospect?.logistica ?? '',
    motivo_perda: prospect?.motivo_perda ?? '',
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.nome_prospecto.trim()) {
      toast.error('Nome do prospecto é obrigatório')
      return
    }
    if (!form.telefone.trim()) {
      toast.error('Telefone é obrigatório')
      return
    }
    if (!form.proximo_retorno) {
      toast.error('Próximo retorno é obrigatório')
      return
    }

    try {
      setLoading(true)
      await onSave({
        etapa,
        nome_prospecto: form.nome_prospecto.trim(),
        telefone: form.telefone.trim(),
        observacoes: form.observacoes.trim() || null,
        proximo_retorno: form.proximo_retorno,
        cliente_codigo_citel: form.cliente_codigo_citel.trim() || null,
        numero_orcamento_citel: form.numero_orcamento_citel.trim() || null,
        valor_estimado: form.valor_estimado ? parseFloat(form.valor_estimado) : null,
        numero_nf: form.numero_nf.trim() || null,
        logistica: form.logistica.trim() || null,
        motivo_perda: form.motivo_perda.trim() || null,
      })
      toast.success(prospect ? 'Prospecto atualizado!' : 'Prospecto salvo com sucesso!')
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar. Tente novamente.')
      setLoading(false)
    }
  }

  const mostrarOrcamento = ['orcamento', 'negociacao', 'fechado', 'pos_venda', 'concluido'].includes(etapa)
  const mostrarNF = ['negociacao', 'fechado', 'pos_venda', 'concluido'].includes(etapa)
  const mostrarLogistica = ['pos_venda', 'concluido'].includes(etapa)
  const mostrarPerda = etapa === 'perdido'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">
              {prospect ? 'Editar Prospecto' : 'Novo Prospecto'}
            </h2>
            <span className="text-xs text-gray-400">{ETAPA_LABEL[etapa]}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do prospecto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.nome_prospecto}
              onChange={(e) => set('nome_prospecto', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="Nome do cliente"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={form.telefone}
              onChange={(e) => set('telefone', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Próximo retorno <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.proximo_retorno}
              onChange={(e) => set('proximo_retorno', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              value={form.observacoes}
              onChange={(e) => set('observacoes', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base resize-none"
              placeholder="Observações do contato"
              rows={2}
            />
          </div>

          {mostrarOrcamento && (
            <>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Orçamento</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código cliente Citel</label>
                <input
                  type="text"
                  value={form.cliente_codigo_citel}
                  onChange={(e) => set('cliente_codigo_citel', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Código no sistema"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número orçamento Citel</label>
                <input
                  type="text"
                  value={form.numero_orcamento_citel}
                  onChange={(e) => set('numero_orcamento_citel', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Número do orçamento"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor estimado (R$)</label>
                <input
                  type="number"
                  value={form.valor_estimado}
                  onChange={(e) => set('valor_estimado', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="0,00"
                  step="0.01"
                />
              </div>
            </>
          )}

          {mostrarNF && (
            <>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Documento Fiscal</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número NF / Cupom Fiscal</label>
                <input
                  type="text"
                  value={form.numero_nf}
                  onChange={(e) => set('numero_nf', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Número da nota ou cupom"
                />
              </div>
            </>
          )}

          {mostrarLogistica && (
            <>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Pós-venda</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logística / Entrega</label>
                <textarea
                  value={form.logistica}
                  onChange={(e) => set('logistica', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base resize-none"
                  placeholder="Entrega ok? Aplicação correta? Cliente satisfeito?"
                  rows={3}
                />
              </div>
            </>
          )}

          {mostrarPerda && (
            <>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Venda Perdida</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo real da perda</label>
                <textarea
                  value={form.motivo_perda}
                  onChange={(e) => set('motivo_perda', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base resize-none"
                  placeholder="Por que perdemos essa venda?"
                  rows={3}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  )
}
