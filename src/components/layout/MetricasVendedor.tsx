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
} from 'lucide-react'
import type { Prospect, Etapa } from '../../types'

interface MetricasVendedorProps {
  prospects: Prospect[]
}

const ETAPA_CONFIG: {
  key: Etapa
  label: string
  cor: string
  bgCor: string
  icon: React.ReactNode
}[] = [
  { key: 'contato', label: 'Contato', cor: 'text-blue-500', bgCor: 'bg-blue-500', icon: <Phone size={14} /> },
  { key: 'orcamento', label: 'Orçamento', cor: 'text-yellow-500', bgCor: 'bg-yellow-500', icon: <FileText size={14} /> },
  { key: 'negociacao', label: 'Negociação', cor: 'text-purple-500', bgCor: 'bg-purple-500', icon: <Handshake size={14} /> },
  { key: 'fechado', label: 'Fechado', cor: 'text-green-500', bgCor: 'bg-green-500', icon: <CheckCircle size={14} /> },
  { key: 'pos_venda', label: 'Pós-venda', cor: 'text-teal-500', bgCor: 'bg-teal-500', icon: <RefreshCw size={14} /> },
  { key: 'concluido', label: 'Concluído', cor: 'text-green-600', bgCor: 'bg-green-600', icon: <Flag size={14} /> },
  { key: 'perdido', label: 'Perdido', cor: 'text-red-500', bgCor: 'bg-red-400', icon: <AlertCircle size={14} /> },
]

export default function MetricasVendedor({ prospects }: MetricasVendedorProps) {
  const total = prospects.length
  const contagem: Record<string, number> = {}

  ETAPA_CONFIG.forEach((e) => {
    contagem[e.key] = prospects.filter((p) => p.etapa === e.key).length
  })

  const ativos = prospects.filter(
    (p) => !['fechado', 'concluido', 'perdido'].includes(p.etapa)
  ).length
  const fechados = (contagem['fechado'] || 0) + (contagem['concluido'] || 0)
  const perdidos = contagem['perdido'] || 0
  const taxaConversao = total > 0 ? Math.round((fechados / total) * 100) : 0

  const maxContagem = Math.max(...Object.values(contagem), 1)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
          {ETAPA_CONFIG.map((etapa) => {
            const qtd = contagem[etapa.key] || 0
            const pct = maxContagem > 0 ? (qtd / maxContagem) * 100 : 0

            return (
              <div key={etapa.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={etapa.cor}>{etapa.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{etapa.label}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{qtd}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${etapa.bgCor}`}
                    style={{ width: `${Math.max(pct, qtd > 0 ? 4 : 0)}%` }}
                  />
                </div>
              </div>
            )
          })}
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
