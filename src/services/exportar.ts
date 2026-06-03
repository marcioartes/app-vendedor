import * as XLSX from 'xlsx'
import type { ProspectComVendedor, ResumoVendedor } from './gerente'

export function exportarRelatorioMensal(
  prospects: ProspectComVendedor[],
  resumos: ResumoVendedor[],
  mes: string
) {
  const wb = XLSX.utils.book_new()

  // ABA 1 — Resumo Executivo
  const total = prospects.length
  const finalizados = prospects.filter(p => p.status === 'finalizado').length
  const perdidos = prospects.filter(p => p.status === 'perdido').length
  const abertos = prospects.filter(p => p.status === 'aberto').length
  const taxa = total > 0 ? Math.round((finalizados / total) * 100) : 0

  const resumoGeral = [
    ['RELATÓRIO MENSAL DE FOLLOW-UP COMERCIAL'],
    ['Período:', mes],
    ['Gerado em:', new Date().toLocaleDateString('pt-BR')],
    [],
    ['RESUMO GERAL'],
    ['Total de Prospectos', total],
    ['Abertos', abertos],
    ['Finalizados', finalizados],
    ['Perdidos', perdidos],
    ['Taxa de Conversão', `${taxa}%`],
    [],
    ['RANKING POR VENDEDOR'],
    ['Vendedor', 'Total', 'Abertos', 'Finalizados', 'Perdidos', 'Conversão', 'Atrasados'],
    ...resumos.map((r, i) => [
      `${i + 1}º ${r.vendedor_nome}`,
      r.total,
      r.abertos,
      r.finalizados,
      r.perdidos,
      `${r.total > 0 ? Math.round((r.finalizados / r.total) * 100) : 0}%`,
      r.atrasados > 0 ? `⚠️ ${r.atrasados}` : '0',
    ]),
  ]

  const ws1 = XLSX.utils.aoa_to_sheet(resumoGeral)
  ws1['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Resumo Executivo')

  // ABA 2 — Detalhamento
  const detalhamento = [
    ['DETALHAMENTO DE PROSPECTOS'],
    ['Período:', mes],
    [],
    ['Vendedor', 'Cliente', 'Telefone', 'Nº Orçamento', 'Status', 'Próximo Retorno', 'Resumo'],
    ...prospects.map(p => [
      p.vendedor_nome,
      p.nome_prospecto,
      p.telefone,
      p.numero_orcamento_citel || '-',
      p.status.toUpperCase(),
      new Date(p.proximo_retorno + 'T00:00:00').toLocaleDateString('pt-BR'),
      p.resumo_orcamento,
    ]),
  ]

  const ws2 = XLSX.utils.aoa_to_sheet(detalhamento)
  ws2['!cols'] = [
    { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
    { wch: 12 }, { wch: 15 }, { wch: 40 },
  ]
  XLSX.utils.book_append_sheet(wb, ws2, 'Detalhamento')

  // Baixar arquivo
  const nomeArquivo = `relatorio-followup-${mes.replace('/', '-')}.xlsx`
  XLSX.writeFile(wb, nomeArquivo)
}
