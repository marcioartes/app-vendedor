import * as XLSX from 'xlsx'
import type { ProspectComVendedor, ResumoVendedor, RelatorioVendedor, RelatorioGeral } from './gerente'

export function exportarRelatorioMensal(
  prospects: ProspectComVendedor[],
  resumos: ResumoVendedor[],
  mes: string
) {
  const wb = XLSX.utils.book_new()

  const total = prospects.length
  const fechados = prospects.filter(p => p.etapa === 'fechado' || p.etapa === 'concluido').length
  const perdidos = prospects.filter(p => p.etapa === 'perdido').length
  const ativos = prospects.filter(p => !['fechado', 'concluido', 'perdido'].includes(p.etapa)).length
  const taxa = total > 0 ? Math.round((fechados / total) * 100) : 0

  const resumoGeral = [
    ['RELATÓRIO MENSAL DE FOLLOW-UP COMERCIAL'],
    ['Período:', mes],
    ['Gerado em:', new Date().toLocaleDateString('pt-BR')],
    [],
    ['RESUMO GERAL'],
    ['Total de Prospectos', total],
    ['Ativos', ativos],
    ['Fechados/Concluídos', fechados],
    ['Perdidos', perdidos],
    ['Taxa de Conversão', `${taxa}%`],
    [],
    ['RANKING POR VENDEDOR'],
    ['Vendedor', 'Total', 'Contato', 'Orçamento', 'Negociação', 'Fechado', 'Pós-venda', 'Concluído', 'Perdido', 'Conversão', 'Atrasados'],
    ...resumos.map((r, i) => [
      `${i + 1}º ${r.vendedor_nome}`,
      r.total,
      r.contato,
      r.orcamento,
      r.negociacao,
      r.fechado,
      r.pos_venda,
      r.concluido,
      r.perdido,
      `${r.total > 0 ? Math.round(((r.fechado + r.concluido) / r.total) * 100) : 0}%`,
      r.atrasados > 0 ? `⚠️ ${r.atrasados}` : '0',
    ]),
  ]

  const ws1 = XLSX.utils.aoa_to_sheet(resumoGeral)
  ws1['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Resumo Executivo')

  const detalhamento = [
    ['DETALHAMENTO DE PROSPECTOS'],
    ['Período:', mes],
    [],
    ['Vendedor', 'Cliente', 'Telefone', 'Nº Orçamento', 'Etapa', 'Próximo Retorno', 'Observações'],
    ...prospects.map(p => [
      p.vendedor_nome,
      p.nome_prospecto,
      p.telefone,
      p.numero_orcamento_citel || '-',
      p.etapa.toUpperCase(),
      new Date(p.proximo_retorno + 'T00:00:00').toLocaleDateString('pt-BR'),
      p.observacoes || '-',
    ]),
  ]

  const ws2 = XLSX.utils.aoa_to_sheet(detalhamento)
  ws2['!cols'] = [
    { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 40 },
  ]
  XLSX.utils.book_append_sheet(wb, ws2, 'Detalhamento')

  const nomeArquivo = `relatorio-followup-${mes.replace('/', '-')}.xlsx`
  XLSX.writeFile(wb, nomeArquivo)
}

export function exportarRelatorioFiltrado(
  prospects: ProspectComVendedor[],
  vendedores: RelatorioVendedor[],
  geral: RelatorioGeral,
  periodoLabel: string
) {
  const wb = XLSX.utils.book_new()

  const resumoSheet = [
    ['RELATÓRIO DE FOLLOW-UP COMERCIAL'],
    ['Período:', periodoLabel],
    ['Gerado em:', new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })],
    [],
    ['RESUMO GERAL'],
    ['Total de Prospectos', geral.total],
    ['Ativos', geral.ativos],
    ['Fechados/Concluídos', geral.fechados],
    ['Perdidos', geral.perdidos],
    ['Taxa de Conversão', `${geral.taxaConversao}%`],
    ['Pendentes (retorno hoje)', geral.pendentes],
    ['Atrasados', geral.atrasados],
    [],
    ['MÉTRICAS POR VENDEDOR'],
    ['Vendedor', 'Total', 'Ativos', 'Fechados', 'Perdidos', 'Conversão', 'Pendentes', 'Atrasados', 'Última Atividade'],
    ...vendedores.map((v) => [
      v.vendedor_nome,
      v.total,
      v.ativos,
      v.fechados,
      v.perdidos,
      `${v.taxaConversao}%`,
      v.pendentes,
      v.atrasados > 0 ? `⚠️ ${v.atrasados}` : '0',
      v.ultimaAtividade
        ? new Date(v.ultimaAtividade).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '—',
    ]),
  ]

  const ws1 = XLSX.utils.aoa_to_sheet(resumoSheet)
  ws1['!cols'] = [
    { wch: 28 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 },
  ]
  XLSX.utils.book_append_sheet(wb, ws1, 'Resumo')

  const detalhamento = [
    ['DETALHAMENTO DE PROSPECTOS'],
    ['Período:', periodoLabel],
    [],
    ['Vendedor', 'Cliente', 'Telefone', 'Nº Orçamento', 'Etapa', 'Próximo Retorno', 'Observações'],
    ...prospects.map((p) => [
      p.vendedor_nome,
      p.nome_prospecto,
      p.telefone,
      p.numero_orcamento_citel || '-',
      p.etapa.toUpperCase(),
      new Date(p.proximo_retorno + 'T00:00:00').toLocaleDateString('pt-BR'),
      p.observacoes || '-',
    ]),
  ]

  const ws2 = XLSX.utils.aoa_to_sheet(detalhamento)
  ws2['!cols'] = [
    { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 40 },
  ]
  XLSX.utils.book_append_sheet(wb, ws2, 'Detalhamento')

  const dataArquivo = new Date().toISOString().slice(0, 10)
  const nomeArquivo = `relatorio-followup-${dataArquivo}.xlsx`
  XLSX.writeFile(wb, nomeArquivo)
}
