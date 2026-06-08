import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface AlterarSenhaProps {
  onClose: () => void
}

export default function AlterarSenha({ onClose }: AlterarSenhaProps) {
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)

    if (novaSenha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (novaSenha !== confirmar) {
      setErro('As senhas não conferem')
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.updateUser({ password: novaSenha })
      if (error) throw error
      setSucesso(true)
      setTimeout(() => onClose(), 2000)
    } catch {
      setErro('Erro ao alterar senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm rounded-t-3xl sm:rounded-2xl">
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Alterar Senha</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {sucesso ? (
            <div className="bg-green-50 text-green-600 text-sm px-3 py-4 rounded-xl text-center font-medium">
              ✅ Senha alterada com sucesso!
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova senha
                </label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar nova senha
                </label>
                <input
                  type="password"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Repita a nova senha"
                  required
                />
              </div>

              {erro && (
                <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-xl">
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
