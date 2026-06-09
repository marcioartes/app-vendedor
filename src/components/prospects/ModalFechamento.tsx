import { useState } from 'react'
import { X, CheckCircle } from 'lucide-react'

interface ModalFechamentoProps {
  nomeProspecto: string
  onAgendar: (dataRetorno: string) => Promise<void>
  onConcluir: () => Promise<void>
  onClose: () => void
}

export default function ModalFechamento({ nomeProspecto, onAgendar, onConcluir, onClose }: ModalFechamentoProps) {
  const [dataRetorno, setDataRetorno] = useState('')
  const [loading, setLoading] = useState(false)
  const [opcao, setOpcao] = useState<'agendar' | 'concluir' | null>(null)

  async function handleAgendar() {
    if (!dataRetorno) return
    try {
      setLoading(true)
      await onAgendar(dataRetorno)
    } finally {
      setLoading(false)
    }
  }

  async function handleConcluir() {
    try {
      setLoading(true)
      await onConcluir()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm rounded-t-3xl sm:rounded-2xl">
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" />
            <h2 className="font-semibold text-gray-900">Venda Fechada!</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-600">
            Parabéns pela venda com <strong>{nomeProspecto}</strong>! 🎉
          </p>
          <p className="text-sm text-gray-500">
            Deseja agendar um retorno de pós-venda?
          </p>

          <div className="space-y-3">
            <button
              onClick={() => setOpcao('agendar')}
              className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-medium transition-colors text-left ${
                opcao === 'agendar'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              🔄 Sim, agendar pós-venda
            </button>

            <button
              onClick={() => setOpcao('concluir')}
              className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-medium transition-colors text-left ${
                opcao === 'concluir'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              🏁 Não, concluir agora
            </button>
          </div>

          {opcao === 'agendar' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data do retorno de pós-venda
              </label>
              <input
                type="date"
                value={dataRetorno}
                onChange={(e) => setDataRetorno(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
            </div>
          )}

          {opcao === 'agendar' && (
            <button
              onClick={handleAgendar}
              disabled={loading || !dataRetorno}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Agendar Pós-venda'}
            </button>
          )}

          {opcao === 'concluir' && (
            <button
              onClick={handleConcluir}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Concluir Venda'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
