import { useState, useRef } from 'react'
import { LogOut, KeyRound, User, Shield, Camera, Loader2 } from 'lucide-react'
import type { Perfil } from '../../services/auth'
import { uploadAvatar } from '../../services/auth'
import AlterarSenha from './AlterarSenha'

interface PerfilVendedorProps {
  perfil: Perfil
  onSignOut: () => void
  onAvatarUpdate?: (url: string) => void
}

export default function PerfilVendedor({ perfil, onSignOut, onAvatarUpdate }: PerfilVendedorProps) {
  const [showAlterarSenha, setShowAlterarSenha] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(perfil.avatar_url)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const dataCriacao = new Date(perfil.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validações
    if (!file.type.startsWith('image/')) {
      alert('Selecione um arquivo de imagem')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB')
      return
    }

    try {
      setUploading(true)
      const url = await uploadAvatar(perfil.id, file)
      setAvatarUrl(url)
      onAvatarUpdate?.(url)
    } catch (err) {
      console.error(err)
      alert('Erro ao enviar foto. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Avatar + info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={perfil.nome}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-100"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                <User size={40} className="text-white" />
              </div>
            )}

            {/* Botão de câmera */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 size={14} className="text-white animate-spin" />
              ) : (
                <Camera size={14} className="text-white" />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <h2 className="text-lg font-bold text-gray-900">{perfil.nome}</h2>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <Shield size={12} className="text-blue-500" />
            <span className="text-sm text-gray-500 capitalize">{perfil.role}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Membro desde {dataCriacao}</p>

          {uploading && (
            <p className="text-xs text-blue-500 mt-2 animate-pulse">Enviando foto...</p>
          )}
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
