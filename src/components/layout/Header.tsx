import { LogOut } from 'lucide-react'
import type { Perfil } from '../../services/auth'

interface HeaderProps {
  perfil: Perfil
  onSignOut: () => void
}

export default function Header({ perfil, onSignOut }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-gray-900">Follow-up Loja 14</h1>
          <p className="text-xs text-gray-500">{perfil.nome}</p>
        </div>
        <button
          onClick={onSignOut}
          className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors text-sm"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </header>
  )
}
