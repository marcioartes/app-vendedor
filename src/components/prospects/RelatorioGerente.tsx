import { useState, useMemo } from 'react'
import {
  FileSpreadsheet,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import {
  filtrarProspectsPorData,
  calcularRelatorioVendedores,
} from '../../services/gerente'
import { exportarRelatorioFiltrado } from '../../services/exportar'
import type { ProspectComVendedor } from '../../services/gerente'

type Periodo = 'hoje' | 'semanal' | 'mensal' | 'personalizado'

function getIntervalo(periodo: Periodo, customInicio?: string, customFim?: string) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  switch (periodo) {
    case 'hoje':
      return { inicio: hoje, fim: new Date() }
    case 'semanal': {
      const inicio = new Date(hoje)
      inicio.setDate(inicio.getDate() - 6)
      return { inicio, fim: new Date() }
    }
    case 'mensal': {
      const inicio = new Date(hoje)
      inicio.setDate(inicio.getDate() - 29)
      return { inicio, fim: new Date() }
    }
    case 'personalizado': {
      if (customInicio && customFim) {
        return {
          inicio: new Date(customInicio + 'T00:00:00'),
          fim: new Date(customFim + 'T23:59:59'),
        }
      }
      return { inicio: hoje, fim: new Date() }
    }
  }
}

function formatarPeriodoLabel(periodo: Periodo, inicio: Date, fim: Date): string {
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }
  const fmtInicio = inicio.toLocaleDateString('pt-BR', opts)
  const fmtFim = fim.toLocaleDateString('pt-BR', opts)

  switch (periodo) {
    case 'hoje':
      return `Hoje — ${fmtInicio}`
    case 'semanal':
      return `${fmtInicio} a ${fmtFim}`
    case 'mensal':
      return `${fmtInicio} a ${fmtFim}`
    case 'personalizado':
      return `${fmtInicio} a ${fmtFim}`
  }
}

function formatarUltimaAtividade(data: string | null): string {
  if (!data) return '—'
  const d = new Date(data)
  const agora = new Date()
  const diffMs = agora.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHoras = Math.floor(diffMin / 60)
  const diffDias = Math.floor(diffHoras / 24)

  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `${diffMin}min atrás`
  if (diffHoras < 24) return `${diffHoras}h atrás`
  if (diffDias === 1) return 'ontem'
  if (diffDias < 7) return `${diffDias}d atrás`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

interface Props {
  prospects: ProspectComVendedor[]
}

export default function RelatorioGerente({ prospects }: Props) {
  const [periodo, setPeriodo] = useState<Periodo>('mensal')
  const [customInicio, setCustomInicio] = useState('')
  const [customFim, setCustomFim] = useState('')
  const [expandido, setExpandido] = useState(true)

  const { inicio, fim } = getIntervalo(periodo, customInicio, customFim)
  const periodoLabel = formatarPeriodoLabel(periodo, inicio, fim)

  const { prospectsFiltrados, vendedores, geral } = useMemo(() => {
    const filtrados = filtrarProspectsPorData(prospects, inicio, fim)
    const { vendedores, geral } = calcularRelatorioVendedores(filtrados)
    return { prospectsFiltrados: filtrados, vendedores, geral }
  }, [prospects, periodo, customInicio, customFim])

  const handleExportar = () => {
    exportarRelatorioFiltrado(prospectsFiltrados, vendedores, geral, periodoLabel)
  }

  const periodos: { key: Periodo; label: string }[] = [
    { key: 'hoje', label: 'Hoje' },
    { key: 'semanal', label: '7 dias' },
    { key: 'mensal', label: '30 dias' },
    { key: 'personalizado', label: 'Personalizado' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={16} className="text-indigo-500" />
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Relatório
          </h2>
        </div>
        <button
          onClick={() => setExpandido(!expandido)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          {expandido ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {expandido && (
        <div className="space-y-4">
          {/* Filtros de período */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Calendar size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500 font-medium">Período:</span>
              <div className="flex gap-1 flex-wrap">
                {periodos.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPeriodo(p.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      periodo === p.key
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Campos de data personalizada */}
            {periodo === 'personalizado' && (
              <div className="flex flex-wrap gap-3 items-center pt-2 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">De:</label>
                  <input
                    type="date"
                    value={customInicio}
                    onChange={(e) => setCustomInicio(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">Até:</label>
                  <input
                    type="date"
                    value={customFim}
                    onChange={(e) => setCustomFim(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Label do período ativo */}
            <p className="text-xs text-gray-400 mt-2">
              📅 {periodoLabel} — {geral.total} prospect{geral.total !== 1 ? 's' : ''} encontrado{geral.total !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Cards resumo geral */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
              <Users size={14} className="text-blue-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{geral.total}</p>
              <p className="text-[10px] text-gray-400">Total</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
              <Activity size={14} className="text-cyan-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{geral.ativos}</p>
              <p className="text-[10px] text-gray-400">Ativos</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
              <CheckCircle2 size={14} className="text-green-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{geral.fechados}</p>
              <p className="text-[10px] text-gray-400">Fechados</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
              <XCircle size={14} className="text-red-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{geral.perdidos}</p>
              <p className="text-[10px] text-gray-400">Perdidos</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
              <TrendingUp size={14} className="text-emerald-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{geral.taxaConversao}%</p>
              <p className="text-[10px] text-gray-400">Conversão</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
              <Clock size={14} className="text-yellow-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{geral.pendentes}</p>
              <p className="text-[10px] text-gray-400">Pendentes</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
              <AlertTriangle size={14} className="text-orange-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{geral.atrasados}</p>
              <p className="text-[10px] text-gray-400">Atrasados</p>
            </div>
          </div>

          {/* Tabela por vendedor */}
          {vendedores.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">Métricas por Vendedor</h3>
                <button
                  onClick={handleExportar}
                  className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                >
                  <FileSpreadsheet size={13} />
                  Exportar Excel
                </button>
              </div>

              {/* Mobile: cards */}
              <div className="sm:hidden divide-y divide-gray-50">
                {vendedores.map((v) => (
                  <div key={v.vendedor_id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 text-sm">{v.vendedor_nome}</p>
                      <span className="text-xs text-gray-400">
                        {formatarUltimaAtividade(v.ultimaAtividade)}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center bg-blue-50 rounded-xl py-1.5">
                        <p className="text-sm font-bold text-blue-600">{v.total}</p>
                        <p className="text-[10px] text-gray-400">total</p>
                      </div>
                      <div className="text-center bg-cyan-50 rounded-xl py-1.5">
                        <p className="text-sm font-bold text-cyan-600">{v.ativos}</p>
                        <p className="text-[10px] text-gray-400">ativos</p>
                      </div>
                      <div className="text-center bg-green-50 rounded-xl py-1.5">
                        <p className="text-sm font-bold text-green-600">{v.fechados}</p>
                        <p className="text-[10px] text-gray-400">fechados</p>
                      </div>
                      <div className="text-center bg-red-50 rounded-xl py-1.5">
                        <p className="text-sm font-bold text-red-500">{v.perdidos}</p>
                        <p className="text-[10px] text-gray-400">perdidos</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex gap-3">
                        <span className="text-emerald-600 font-medium">{v.taxaConversao}% conv.</span>
                        <span className="text-yellow-600">{v.pendentes} pend.</span>
                        {v.atrasados > 0 && (
                          <span className="text-orange-600 font-medium">⚠️ {v.atrasados} atras.</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 uppercase tracking-wide">
                      <th className="px-4 py-3 font-medium">Vendedor</th>
                      <th className="px-3 py-3 font-medium text-center">Total</th>
                      <th className="px-3 py-3 font-medium text-center">Ativos</th>
                      <th className="px-3 py-3 font-medium text-center">Fechados</th>
                      <th className="px-3 py-3 font-medium text-center">Perdidos</th>
                      <th className="px-3 py-3 font-medium text-center">Conversão</th>
                      <th className="px-3 py-3 font-medium text-center">Pendentes</th>
                      <th className="px-3 py-3 font-medium text-center">Atrasados</th>
                      <th className="px-3 py-3 font-medium text-right">Última Ativ.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {vendedores.map((v) => (
                      <tr key={v.vendedor_id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{v.vendedor_nome}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-lg text-xs">
                            {v.total}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-cyan-600 font-medium">{v.ativos}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-green-600 font-medium">{v.fechados}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-red-500 font-medium">{v.perdidos}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`font-semibold text-xs px-2 py-0.5 rounded-lg ${
                            v.taxaConversao >= 50
                              ? 'bg-green-50 text-green-600'
                              : v.taxaConversao >= 25
                              ? 'bg-yellow-50 text-yellow-600'
                              : 'bg-red-50 text-red-500'
                          }`}>
                            {v.taxaConversao}%
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-yellow-600 font-medium">{v.pendentes}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {v.atrasados > 0 ? (
                            <span className="bg-orange-50 text-orange-600 font-semibold px-2 py-0.5 rounded-lg text-xs">
                              ⚠️ {v.atrasados}
                            </span>
                          ) : (
                            <span className="text-gray-300">0</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right text-xs text-gray-400">
                          {formatarUltimaAtividade(v.ultimaAtividade)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <Calendar size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Nenhum prospect encontrado neste período</p>
              <p className="text-xs text-gray-300 mt-1">Tente selecionar um intervalo maior</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
