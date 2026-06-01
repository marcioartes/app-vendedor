import { useState } from 'react'
import { X } from 'lucide-react'
import type { Prospect, ProspectInsert, ProspectUpdate, Status } from '../../types'

interface ProspectFormProps {
  prospect?: Prospect
  onSave: (data: ProspectInsert | ProspectUpdate) => Promise<void>
  onClose: () => void
}

export default function ProspectForm({ prospect, onSave, onClose }: ProspectFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    nome_prospecto: prospect?.nome_prospecto ?? '',
    telefone: prospect?.telefone ?? '',
    cliente_codigo_citel: prospect?.cliente_codigo_citel ?? '',
    numero_orcamento_citel: prospect?.numero_orcamento_citel ?? '',
    resumo_orcamento: prospect?.resumo_orcamento ?? '',
    proximo_retorno: prospect?.proximo_retorno ?? '',
    status: prospect?.status ?? 'aberto' as Status,
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome_prospecto || !form.telefone || !form.resumo_orcamento || !form.proximo_retorno) {
      setError('Preencha todos os campos obrigatórios')
      return
    }
    try {
      setLoading(true)
      setError(null)
      await onSave({
        ...form,
        cliente_codigo_citel: form.cliente_codigo_citel || null,
        numero_orcamento_citel: form.numero_orcamento_citel || null,
      })
      onClose()
    } catch {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            {prospect ? 'Editar Prospecto' : 'Novo Prospecto'}
          </h2>
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
              Código cliente Citel
            </label>
            <input
              type="text"
              value={form.cliente_codigo_citel}
              onChange={(e) => set('cliente_codigo_citel', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="Opcional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número orçamento Citel
            </label>
            <input
              type="text"
              value={form.numero_orcamento_citel}
              onChange={(e) => set('numero_orcamento_citel', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="Opcional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resumo / Observações <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.resumo_orcamento}
              onChange={(e) => set('resumo_orcamento', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base resize-none"
              placeholder="Descreva o orçamento ou observações importantes"
              rows={3}
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
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            >
              <option value="aberto">Aberto</option>
              <option value="finalizado">Finalizado</option>
              <option value="perdido">Perdido</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Salvar Prospecto'}
          </button>
        </form>
      </div>
    </div>
  )
}
