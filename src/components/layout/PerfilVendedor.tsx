import { useState } from 'react'
import { LogOut, KeyRound, User, Shield } from 'lucide-react'
import type { Perfil } from '../../services/auth'
import AlterarSenha from './AlterarSenha'

interface PerfilVendedorProps {
  perfil: Perfil
  onSignOut: () => void
}

export default function PerfilVendedor({ perfil, onSignOut }: PerfilVendedorProps) {
  const [showAlterarSenha, setShowAlterarSenha] = useState(false)

  const dataCriacao = new Date(perfil.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Avatar + info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mx-auto flex items-center justify-center mb-4">
            <User size={36} className="text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">{perfil.nome}</h2>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <Shield size={12} className="text-blue-500" />
            <span className="text-sm text-gray-500 capitalize">{perfil.role}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Membro desde {dataCriacao}</p>
        </div>

        {/* Ações */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Configurações
          </h3>

          <button
            onClick={() => setShowAlterarSenha(true)}
            className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <KeyRound size={18} className="text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Alterar Senha</p>
              <p className="text-xs text-gray-400">Atualize sua senha de acesso</p>
            </div>
          </button>

          <button
            onClick={onSignOut}
            className="w-full bg-white rounded-2xl border border-red-50 shadow-sm px-4 py-4 flex items-center gap-3 hover:bg-red-50 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <LogOut size={18} className="text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-600">Sair da Conta</p>
              <p className="text-xs text-gray-400">Encerrar sessão atual</p>
            </div>
          </button>
        </div>

        {/* Versão */}
        <p className="text-center text-xs text-gray-300 pt-4">
          Follow-up Loja 14 • v1.0
        </p>
      </div>

      {showAlterarSenha && (
        <AlterarSenha onClose={() => setShowAlterarSenha(false)} />
      )}
    </>
  )
}
