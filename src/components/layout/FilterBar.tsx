import type { FilterState } from '../../types'
import { Search } from 'lucide-react'

interface FilterBarProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
}

const TABS = [
  { label: 'Todos', value: 'todos' },
  { label: '📞 Contato', value: 'contato' },
  { label: '📋 Orçamento', value: 'orcamento' },
  { label: '🤝 Negociação', value: 'negociacao' },
  { label: '✅ Fechado', value: 'fechado' },
  { label: '�� Pós-venda', value: 'pos_venda' },
  { label: '🏁 Concluído', value: 'concluido' },
  { label: '❌ Perdido', value: 'perdido' },
] as const

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-3 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou orçamento..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onChange({ ...filters, etapa: tab.value })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filters.etapa === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
