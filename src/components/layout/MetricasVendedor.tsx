import { useState, useMemo } from 'react'
import {
  Phone,
  FileText,
  Handshake,
  CheckCircle,
  RefreshCw,
  Flag,
  AlertCircle,
  TrendingUp,
  XCircle,
  Users,
  Activity,
  Calendar,
} from 'lucide-react'
import type { Prospect, Etapa } from '../../types'

interface MetricasVendedorProps {
  prospects: Prospect[]
}

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

const ETAPA_CONFIG: {
  key: Etapa
  label: string
  cor: string
  bgGradient: string
  icon: React.ReactNode
}[] = [
  { key: 'contato', label: 'Contato', cor: 'text-blue-500', bgGradient: 'bg-gradient-to-r from-blue-400 to-blue-500', icon: <Phone size={14} /> },
  { key: 'orcamento', label: 'Orçamento', cor: 'text-yellow-500', bgGradient: 'bg-gradient-to-r from-yellow-400 to-yellow-500', icon: <FileText size={14} /> },
  { key: 'negociacao', label: 'Negociação', cor: 'text-purple-500', bgGradient: 'bg-gradient-to-r from-purple-400 to-purple-500', icon: <Handshake size={14} /> },
  { key: 'fechado', label: 'Fechado', cor: 'text-green-500', bgGradient: 'bg-gradient-to-r from-green-400 to-green-500', icon: <CheckCircle size={14} /> },
  { key: 'pos_venda', label: 'Pós-venda', cor: 'text-teal-500', bgGradient: 'bg-gradient-to-r from-teal-400 to-teal-500', icon: <RefreshCw size={14} /> },
  { key: 'concluido', label: 'Concluído', cor: 'text-green-600', bgGradient: 'bg-gradient-to-r from-green-500 to-green-600', icon: <Flag size={14} /> },
  { key: 'perdido', label: 'Perdido', cor: 'text-red-500', bgGradient: 'bg-gradient-to-r from-red-300 to-red-400', icon: <AlertCircle size={14} /> },
]

// Funil visual: exclui "perdido" que é mostrado separadamente
const FUNIL_ETAPAS = ETAPA_CONFIG.filter(e => e.key !== 'perdido')

const PERIODOS: { key: Periodo; label: string }[] = [
  { key: 'hoje', label: 'Hoje' },
  { key: 'semanal', label: '7 dias' },
  { key: 'mensal', label: '30 dias' },
  { key: 'personalizado', label: 'Personalizado' },
]

export default function MetricasVendedor({ prospects }: MetricasVendedorProps) {
  const [periodo, setPeriodo] = useState<Periodo>('mensal')
  const [customInicio, setCustomInicio] = useState('')
  const [customFim, setCustomFim] = useState('')

  const { inicio, fim } = getIntervalo(periodo, customInicio, customFim)
  const periodoLabel = formatarPeriodoLabel(periodo, inicio, fim)

  // Filtrar prospects pelo período
  const prospectsFiltrados = useMemo(() => {
    const inicioDate = new Date(inicio)
    inicioDate.setHours(0, 0, 0, 0)
    const fimDate = new Date(fim)
    fimDate.setHours(23, 59, 59, 999)

    return prospects.filter((p) => {
      const criado = new Date(p.created_at)
      return criado >= inicioDate && criado <= fimDate
    })
  }, [prospects, periodo, customInicio, customFim])

  const total = prospectsFiltrados.length
  const contagem: Record<string, number> = {}

  ETAPA_CONFIG.forEach((e) => {
    contagem[e.key] = prospectsFiltrados.filter((p) => p.etapa === e.key).length
  })

  const ativos = prospectsFiltrados.filter(
    (p) => !['fechado', 'concluido', 'perdido'].includes(p.etapa)
  ).length
  const fechados = (contagem['fechado'] || 0) + (contagem['concluido'] || 0)
  const perdidos = contagem['perdido'] || 0
  const taxaConversao = total > 0 ? Math.round((fechados / total) * 100) : 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Filtro de período */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-xs text-gray-500 font-medium">Período:</span>
          <div className="flex gap-1 flex-wrap">
            {PERIODOS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriodo(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  periodo === p.key
                    ? 'bg-blue-500 text-white shadow-sm'
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
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Até:</label>
              <input
                type="date"
                value={customFim}
                onChange={(e) => setCustomFim(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
              />
            </div>
          </div>
        )}

        {/* Label do período ativo */}
        <p className="text-xs text-gray-400 mt-2">
          📅 {periodoLabel} — {total} prospect{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Resumo geral */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Suas Métricas
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <Users size={16} className="text-blue-500 mx-auto mb-1.5" />
            <p className="text-2xl font-bold text-gray-900">{total}</p>
            <p className="text-xs text-gray-400">Total</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <Activity size={16} className="text-cyan-500 mx-auto mb-1.5" />
            <p className="text-2xl font-bold text-gray-900">{ativos}</p>
            <p className="text-xs text-gray-400">Ativos</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <TrendingUp size={16} className="text-green-500 mx-auto mb-1.5" />
            <p className="text-2xl font-bold text-gray-900">{taxaConversao}%</p>
            <p className="text-xs text-gray-400">Conversão</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <XCircle size={16} className="text-red-500 mx-auto mb-1.5" />
            <p className="text-2xl font-bold text-gray-900">{perdidos}</p>
            <p className="text-xs text-gray-400">Perdidos</p>
          </div>
        </div>
      </div>

      {/* Funil visual */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Funil de Vendas
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex flex-col items-center gap-1">
            {FUNIL_ETAPAS.map((etapa, index) => {
              const qtd = contagem[etapa.key] || 0
              // Largura do funil: vai de 100% no topo até ~30% na base
              const widthPct = 100 - (index * (70 / (FUNIL_ETAPAS.length - 1 || 1)))

              return (
                <div key={etapa.key} className="w-full flex items-center gap-3">
                  {/* Label à esquerda */}
                  <div className="w-24 shrink-0 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className={`${etapa.cor}`}>{etapa.icon}</span>
                      <span className="text-xs font-medium text-gray-600">{etapa.label}</span>
                    </div>
                  </div>

                  {/* Barra do funil (trapézio) */}
                  <div className="flex-1 flex justify-center">
                    <div
                      className={`${etapa.bgGradient} h-9 rounded-sm flex items-center justify-center transition-all duration-500`}
                      style={{
                        width: `${widthPct}%`,
                        clipPath: index < FUNIL_ETAPAS.length - 1
                          ? `polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)`
                          : `polygon(4% 0%, 96% 0%, 96% 100%, 4% 100%)`,
                      }}
                    >
                      {qtd > 0 && (
                        <span className="text-white text-xs font-bold drop-shadow-sm">{qtd}</span>
                      )}
                    </div>
                  </div>

                  {/* Resultado à direita */}
                  <div className="w-10 shrink-0">
                    <span className="text-sm font-bold text-gray-900">{qtd}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Perdidos (fora do funil) */}
          {perdidos > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center gap-2">
              <AlertCircle size={14} className="text-red-400" />
              <span className="text-xs text-gray-500">Perdidos:</span>
              <span className="text-sm font-bold text-red-500">{perdidos}</span>
            </div>
          )}
        </div>
      </div>

      {/* Resumo textual */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-4">
        <p className="text-sm text-gray-700">
          Você tem <strong className="text-blue-600">{ativos} prospect{ativos !== 1 ? 's' : ''} ativo{ativos !== 1 ? 's' : ''}</strong> e
          já fechou <strong className="text-green-600">{fechados}</strong> negócio{fechados !== 1 ? 's' : ''}.
          {taxaConversao >= 50
            ? ' 🎉 Excelente taxa de conversão!'
            : taxaConversao >= 25
            ? ' 💪 Bom trabalho, continue assim!'
            : ' 📈 Foque nos follow-ups para melhorar sua conversão!'}
        </p>
      </div>
    </div>
  )
}
