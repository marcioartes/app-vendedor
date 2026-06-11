import { AlertCircle, Clock, CalendarCheck, CalendarClock } from 'lucide-react'
import type { Prospect, Etapa } from '../../types'

interface AgendaVendedorProps {
  prospects: Prospect[]
  onAbrir: (prospect: Prospect) => void
}

const ETAPA_BADGE: Record<Etapa, { bg: string; text: string }> = {
  contato:    { bg: 'bg-blue-50', text: 'text-blue-600' },
  orcamento:  { bg: 'bg-yellow-50', text: 'text-yellow-600' },
  negociacao: { bg: 'bg-purple-50', text: 'text-purple-600' },
  fechado:    { bg: 'bg-green-50', text: 'text-green-600' },
  pos_venda:  { bg: 'bg-teal-50', text: 'text-teal-600' },
  concluido:  { bg: 'bg-green-50', text: 'text-green-700' },
  perdido:    { bg: 'bg-red-50', text: 'text-red-600' },
}

const ETAPA_LABEL: Record<Etapa, string> = {
  contato: 'Contato',
  orcamento: 'Orçamento',
  negociacao: 'Negociação',
  fechado: 'Fechado',
  pos_venda: 'Pós-venda',
  concluido: 'Concluído',
  perdido: 'Perdido',
}

interface GrupoRetorno {
  titulo: string
  icon: React.ReactNode
  cor: string
  prospects: Prospect[]
}

export default function AgendaVendedor({ prospects, onAbrir }: AgendaVendedorProps) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const amanha = new Date(hoje)
  amanha.setDate(amanha.getDate() + 1)

  const em7dias = new Date(hoje)
  em7dias.setDate(em7dias.getDate() + 7)

  // Filtrar apenas prospects ativos (não finalizados)
  const ativos = prospects.filter(
    (p) => !['fechado', 'concluido', 'perdido'].includes(p.etapa)
  )

  const atrasados: Prospect[] = []
  const retornoHoje: Prospect[] = []
  const retornoAmanha: Prospect[] = []
  const proximos7: Prospect[] = []
  const futuros: Prospect[] = []

  ativos.forEach((p) => {
    const retorno = new Date(p.proximo_retorno + 'T00:00:00')

    if (retorno < hoje) {
      atrasados.push(p)
    } else if (retorno.getTime() === hoje.getTime()) {
      retornoHoje.push(p)
    } else if (retorno.getTime() === amanha.getTime()) {
      retornoAmanha.push(p)
    } else if (retorno < em7dias) {
      proximos7.push(p)
    } else {
      futuros.push(p)
    }
  })

  // Ordenar cada grupo por data de retorno
  const sortByRetorno = (a: Prospect, b: Prospect) =>
    new Date(a.proximo_retorno).getTime() - new Date(b.proximo_retorno).getTime()

  atrasados.sort(sortByRetorno)
  retornoHoje.sort(sortByRetorno)
  retornoAmanha.sort(sortByRetorno)
  proximos7.sort(sortByRetorno)
  futuros.sort(sortByRetorno)

  const grupos: GrupoRetorno[] = [
    {
      titulo: `Atrasados (${atrasados.length})`,
      icon: <AlertCircle size={16} />,
      cor: 'text-red-500',
      prospects: atrasados,
    },
    {
      titulo: `Hoje (${retornoHoje.length})`,
      icon: <Clock size={16} />,
      cor: 'text-blue-500',
      prospects: retornoHoje,
    },
    {
      titulo: `Amanhã (${retornoAmanha.length})`,
      icon: <CalendarCheck size={16} />,
      cor: 'text-indigo-500',
      prospects: retornoAmanha,
    },
    {
      titulo: `Próximos 7 dias (${proximos7.length})`,
      icon: <CalendarClock size={16} />,
      cor: 'text-gray-500',
      prospects: proximos7,
    },
    {
      titulo: `Futuros (${futuros.length})`,
      icon: <CalendarClock size={16} />,
      cor: 'text-gray-600',
      prospects: futuros,
    },
  ]

  const totalRetornos = ativos.length

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Agenda de Retornos
        </h2>
        <span className="text-xs text-gray-600">{totalRetornos} retorno{totalRetornos !== 1 ? 's' : ''}</span>
      </div>

      {/* Banner de atrasados */}
      {atrasados.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
          <p className="text-sm text-red-700 font-medium">
            ⚠️ Você tem {atrasados.length} retorno{atrasados.length !== 1 ? 's' : ''} atrasado{atrasados.length !== 1 ? 's' : ''}!
          </p>
        </div>
      )}

      {/* Grupos de retorno */}
      {grupos.map((grupo) => {
        if (grupo.prospects.length === 0) return null

        return (
          <div key={grupo.titulo}>
            <div className={`flex items-center gap-2 mb-2 ${grupo.cor}`}>
              {grupo.icon}
              <h3 className="text-sm font-semibold">{grupo.titulo}</h3>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
              {grupo.prospects.map((p) => {
                const retorno = new Date(p.proximo_retorno + 'T00:00:00')
                const isAtrasado = retorno < hoje
                const badge = ETAPA_BADGE[p.etapa]

                return (
                  <button
                    key={p.id}
                    onClick={() => onAbrir(p)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {p.nome_prospecto}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.telefone}</p>
                      {p.observacoes && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{p.observacoes}</p>
                      )}
                    </div>
                    <div className="text-right ml-3 shrink-0 space-y-1">
                      <span className={`block text-xs font-medium px-2 py-0.5 rounded-lg ${badge.bg} ${badge.text}`}>
                        {ETAPA_LABEL[p.etapa]}
                      </span>
                      <p className={`text-xs font-medium ${isAtrasado ? 'text-red-500' : 'text-gray-600'}`}>
                        {retorno.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {totalRetornos === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <CalendarCheck size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Nenhum retorno agendado</p>
          <p className="text-xs text-gray-500 mt-1">Crie prospects para ver sua agenda</p>
        </div>
      )}
    </div>
  )
}
