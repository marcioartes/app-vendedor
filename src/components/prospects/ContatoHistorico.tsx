import { useState, useEffect } from 'react'
import { Plus, Trash2, MessageSquare } from 'lucide-react'
import type { Contato } from '../../types'
import { getContatos, createContato, deleteContato } from '../../services/contatos'

interface ContatoHistoricoProps {
  prospectId: string
}

export default function ContatoHistorico({ prospectId }: ContatoHistoricoProps) {
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
      const novo = await createContato(prospectId, anotacao.trim())
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

  return (
    <div className="border-t border-gray-100 pt-3 mt-1">
      <button
        onClick={() => setAberto(!aberto)}
        className="flex items-center gap-1.5 text-sm text-blue-600 font-medium"
      >
        <MessageSquare size={14} />
        {aberto ? 'Fechar histórico' : 'Ver histórico de contatos'}
      </button>

      {aberto && (
        <div className="mt-3 space-y-3">
          <div className="flex gap-2">
            <textarea
              value={anotacao}
              onChange={(e) => setAnotacao(e.target.value)}
              placeholder="Registre o que foi conversado..."
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
              Nenhum contato registrado ainda
            </p>
          )}

          {contatos.map((contato) => (
            <div key={contato.id} className="flex gap-2 items-start bg-gray-50 rounded-xl p-3">
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">{formatData(contato.created_at)}</p>
                <p className="text-sm text-gray-700">{contato.anotacao}</p>
              </div>
              <button
                onClick={() => handleDelete(contato.id)}
                className="text-gray-300 hover:text-red-400 transition-colors mt-0.5"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
