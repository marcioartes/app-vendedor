import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Users, TrendingUp, Clock, XCircle, AlertCircle, Trophy } from 'lucide-react'
import { getProspectsComVendedores, calcularResumoVendedores } from '../services/gerente'
import type { ProspectComVendedor, ResumoVendedor } from '../services/gerente'

function getMedalha(index: number) {
  if (index === 0) return '🥇'
  if (index === 1) return '🥈'
  if (index === 2) return '🥉'
  return `${index + 1}º`
}

function getPerformanceColor(taxa: number) {
  if (taxa >= 50) return 'bg-green-500'
  if (taxa >= 25) return 'bg-yellow-500'
  return 'bg-red-400'
}

export default function DashboardGerente() {
  const { perfil, signOut } = useAuth()
  const [prospects, setProspects] = useState<ProspectComVendedor[]>([])
  const [resumos, setResumos] = useState<ResumoVendedor[]>([])
  const [loading, setLoading] = useState(true)
  const [vendedorSelecionado, setVendedorSelecionado] = useState<string | null>(null)

  useEffect(() => {
    getProspectsComVendedores()
      .then((data) => {
        setProspects(data)
        setResumos(calcularResumoVendedores(data))
      })
      .finally(() => setLoading(false))
  }, [])

  if (!perfil) return null

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const total = prospects.length
  const fechados = prospects.filter(p => p.etapa === 'fechado' || p.etapa === 'concluido').length
  const perdidos = prospects.filter(p => p.etapa === 'perdido').length
  const ativos = prospects.filter(p => !['fechado', 'concluido', 'perdido'].includes(p.etapa)).length
  const taxaConversao = total > 0 ? Math.round((fechados / total) * 100) : 0

  const atrasados = prospects.filter(p => {
    if (['fechado', 'concluido', 'perdido'].includes(p.etapa)) return false
    return new Date(p.proximo_retorno + 'T00:00:00') < hoje
  })

  const vendedoresComProblema = resumos.filter(r => r.atrasados > 0)
  const prospectsFiltrados = vendedorSelecionado
    ? prospects.filter(p => p.vendedor_id === vendedorSelecionado)
    : []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-900">Follow-up Citel</h1>
            <p className="text-xs text-gray-500">{perfil.nome} — Gerente</p>
          </div>
          <button onClick={signOut} className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors text-sm">
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            {/* Cards resumo */}
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Saúde Geral</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={16} className="text-blue-500" />
                    <span className="text-xs text-gray-500">Total</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{total}</p>
                  <p className="text-xs text-gray-400 mt-1">prospectos</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-yellow-500" />
                    <span className="text-xs text-gray-500">Ativos</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{ativos}</p>
                  <p className="text-xs text-gray-400 mt-1">em andamento</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-green-500" />
                    <span className="text-xs text-gray-500">Conversão</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{taxaConversao}%</p>
                  <p className="text-xs text-gray-400 mt-1">{fechados} fechados</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle size={16} className="text-red-500" />
                    <span className="text-xs text-gray-500">Perdidos</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{perdidos}</p>
                  <p className="text-xs text-gray-400 mt-1">não convertidos</p>
                </div>
              </div>
            </div>

            {/* Alertas */}
            {vendedoresComProblema.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={16} className="text-red-500" />
                  <h3 className="font-semibold text-red-700 text-sm">Vendedores com retornos atrasados</h3>
                </div>
                <div className="space-y-2">
                  {vendedoresComProblema.map(v => (
                    <div key={v.vendedor_id} className="bg-white rounded-xl px-3 py-2 flex items-center justify-between">
                      <p className="font-medium text-gray-900 text-sm">{v.vendedor_nome}</p>
                      <span className="text-xs text-red-500 font-medium">⚠️ {v.atrasados} atrasado(s)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ranking */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={16} className="text-yellow-500" />
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ranking da Equipe</h2>
              </div>
              <div className="space-y-3">
                {resumos.map((r, index) => {
                  const taxa = r.total > 0 ? Math.round(((r.fechado + r.concluido) / r.total) * 100) : 0
                  const isSelected = vendedorSelecionado === r.vendedor_id

                  return (
                    <div
                      key={r.vendedor_id}
                      className={`bg-white rounded-2xl border shadow-sm p-4 cursor-pointer transition-all ${
                        isSelected ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-100 hover:border-gray-200'
                      }`}
                      onClick={() => setVendedorSelecionado(isSelected ? null : r.vendedor_id)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xl w-8 text-center">{getMedalha(index)}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-900">{r.vendedor_nome}</p>
                            {r.atrasados > 0 && (
                              <span className="bg-red-50 text-red-600 text-xs font-medium px-2 py-0.5 rounded-lg">
                                ⚠️ {r.atrasados} atrasado(s)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{r.total} prospectos</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-3">
                        <div className="text-center bg-blue-50 rounded-xl py-2">
                          <p className="text-sm font-bold text-blue-600">{r.contato}</p>
                          <p className="text-xs text-gray-400">contato</p>
                        </div>
                        <div className="text-center bg-yellow-50 rounded-xl py-2">
                          <p className="text-sm font-bold text-yellow-600">{r.orcamento + r.negociacao}</p>
                          <p className="text-xs text-gray-400">negoc.</p>
                        </div>
                        <div className="text-center bg-green-50 rounded-xl py-2">
                          <p className="text-sm font-bold text-green-600">{r.fechado + r.concluido}</p>
                          <p className="text-xs text-gray-400">fechado</p>
                        </div>
                        <div className="text-center bg-red-50 rounded-xl py-2">
                          <p className="text-sm font-bold text-red-500">{r.perdido}</p>
                          <p className="text-xs text-gray-400">perdido</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Taxa de conversão</span>
                          <span className="font-medium">{taxa}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${getPerformanceColor(taxa)}`}
                            style={{ width: `${taxa}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Prospectos do vendedor selecionado */}
            {vendedorSelecionado && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Prospectos de {resumos.find(r => r.vendedor_id === vendedorSelecionado)?.vendedor_nome}
                  </h3>
                  <button onClick={() => setVendedorSelecionado(null)} className="text-xs text-blue-600">Fechar</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {prospectsFiltrados.map(p => {
                    const atrasado = !['fechado', 'concluido', 'perdido'].includes(p.etapa) &&
                      new Date(p.proximo_retorno + 'T00:00:00') < hoje
                    return (
                      <div key={p.id} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{p.nome_prospecto}</p>
                          <p className="text-xs text-gray-500">{p.telefone}</p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{p.observacoes || '-'}</p>
                        </div>
                        <div className="text-right ml-4 shrink-0 space-y-1">
                          <span className={`block text-xs font-medium px-2 py-1 rounded-lg ${
                            p.etapa === 'contato'    ? 'bg-blue-50 text-blue-600' :
                            p.etapa === 'orcamento'  ? 'bg-yellow-50 text-yellow-600' :
                            p.etapa === 'negociacao' ? 'bg-purple-50 text-purple-600' :
                            p.etapa === 'fechado'    ? 'bg-green-50 text-green-600' :
                            p.etapa === 'pos_venda'  ? 'bg-teal-50 text-teal-600' :
                            p.etapa === 'concluido'  ? 'bg-green-50 text-green-700' :
                            'bg-red-50 text-red-600'
                          }`}>
                            {p.etapa}
                          </span>
                          <p className={`text-xs ${atrasado ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                            {new Date(p.proximo_retorno + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
