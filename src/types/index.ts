export type Etapa = 'contato' | 'orcamento' | 'negociacao' | 'fechado' | 'perdido'

export type Role = 'vendedor' | 'gerente'

export interface Perfil {
  id: string
  nome: string
  role: Role
  created_at: string
}

export interface Prospect {
  id: string
  created_at: string
  updated_at: string
  vendedor_id: string
  etapa: Etapa
  nome_prospecto: string
  telefone: string
  observacoes: string | null
  proximo_retorno: string
  cliente_codigo_citel: string | null
  numero_orcamento_citel: string | null
  valor_estimado: number | null
  numero_nf: string | null
  logistica: string | null
  motivo_perda: string | null
}

export interface ProspectInsert {
  etapa: Etapa
  nome_prospecto: string
  telefone: string
  observacoes?: string | null
  proximo_retorno: string
  cliente_codigo_citel?: string | null
  numero_orcamento_citel?: string | null
  valor_estimado?: number | null
  numero_nf?: string | null
  logistica?: string | null
  motivo_perda?: string | null
}

export type ProspectUpdate = Partial<ProspectInsert>

export interface Contato {
  id: string
  created_at: string
  prospect_id: string
  vendedor_id: string
  etapa: Etapa
  anotacao: string
}

export interface FilterState {
  etapa: Etapa | 'todos'
  search: string
}
