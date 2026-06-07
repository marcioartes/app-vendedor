import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Contato } from '../../types'
import { getContatos, createContato, deleteContato } from '../../services/contatos'

interface TimelineProps {
  prospectId: string
  etapaAtual: string
}

function agruparPorEtapa(contatos: Contato[]): Record<string, Contato[]> {
  return contatos.reduce((acc, c) => {
    if (!acc[c.etapa]) acc[c.etapa] = []
    acc[c.etapa].push(c)
    return acc
  }, {} as Record<string, Contato[]>)
}

const ETAPA_LABEL: Record<string, string> = {
  contato:    '�� Contato',
  orcamento:  '📋 Orçamento',
  negociacao: '🤝 Negociação',
  fechado:    '✅ Fechado',
  pos_venda:  '🔄 Pós-venda',
  concluido:  '🏁 Concluído',
  perdido:    '❌ Perdido',
}

const ETAPA_COLOR: Record<string, string> = {
  contato:    'bg-blue-50 text-blue-600',
  orcamento:  'bg-yellow-50 text-yellow-600',
  negociacao: 'bg-purple-50 text-purple-600',
  fechado:    'bg-green-50 text-green-600',
  pos_venda:  'bg-teal-50 text-teal-600',
  concluido:  'bg-green-50 text-green-700',
  perdido:    'bg-red-50 text-red-600',
}

export default function Timeline({ prospectId, etapaAtual }: TimelineProps) {
  const [contatos, setContatos] = useState<Contato[]>([])
  const [loading, setLoading] = useState(true)
  const [anotacao, setAnotacao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    if (!aberto) return
    getContatos(prospectId)
      .then(setContatos)
      .finally(() => setLoading(false))
  }, [prospectId, aberto])

  async function handleSalvar() {
    if (!anotacao.trim()) return
    try {
      setSalvando(true)
      const novo = await createContato(prospectId, etapaAtual as any, anotacao.trim())
      setContatos((prev) => [novo, ...prev])
      setAnotacao('')
    } finally {
      setSalvando(false)
    }
  }

  async function handleDelete(id: string) {
    await deleteContato(id)
    setContatos((prev) => prev.filter((c) => c.id !== id))
  }

  function formatData(data: string) {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const grupos = agruparPorEtapa(contatos)
  const etapasComEventos = Object.keys(grupos)

  return (
    <div className="border-t border-gray-100 pt-3 mt-1">
      <button
        onClick={() => setAberto(!aberto)}
        className="flex items-center gap-1.5 text-sm text-blue-600 font-medium"
      >
        {aberto ? '▲ Fechar timeline' : '▼ Ver timeline'}
      </button>

      {aberto && (
        <div className="mt-3 space-y-4">
          <div className="flex gap-2">
            <textarea
              value={anotacao}
              onChange={(e) => setAnotacao(e.target.value)}
              placeholder={`Registrar evento em ${ETAPA_LABEL[etapaAtual] || etapaAtual}...`}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              rows={2}
            />
            <button
              onClick={handleSalvar}
              disabled={salvando || !anotacao.trim()}
              className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Plus size={18} />
            </button>
          </div>

          {loading && (
            <div className="flex justify-center py-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
            </div>
          )}

          {!loading && contatos.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">
              Nenhum evento registrado ainda
            </p>
          )}

          {etapasComEventos.map((etapa) => (
            <div key={etapa}>
              <span className={`text-xs font-medium px-2 py-1 rounded-lg ${ETAPA_COLOR[etapa] || 'bg-gray-50 text-gray-600'}`}>
                {ETAPA_LABEL[etapa] || etapa}
              </span>
              <div className="mt-2 space-y-2 ml-2 border-l-2 border-gray-100 pl-3">
                {grupos[etapa].map((contato) => (
                  <div key={contato.id} className="flex gap-2 items-start">
                    <div className="flex-1 bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">{formatData(contato.created_at)}</p>
                      <p className="text-sm text-gray-700">{contato.anotacao}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(contato.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors mt-2"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
