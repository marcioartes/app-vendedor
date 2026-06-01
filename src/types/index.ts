export type Status = 'aberto' | 'finalizado' | 'perdido'

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
  cliente_codigo_citel: string | null
  nome_prospecto: string
  telefone: string
  numero_orcamento_citel: string | null
  resumo_orcamento: string
  status: Status
  proximo_retorno: string
}

export interface ProspectInsert {
  cliente_codigo_citel?: string | null
  nome_prospecto: string
  telefone: string
  numero_orcamento_citel?: string | null
  resumo_orcamento: string
  status: Status
  proximo_retorno: string
}

export interface ProspectUpdate {
  cliente_codigo_citel?: string | null
  nome_prospecto?: string
  telefone?: string
  numero_orcamento_citel?: string | null
  resumo_orcamento?: string
  status?: Status
  proximo_retorno?: string
}

export interface FilterState {
  status: Status | 'todos'
  search: string
}

export interface Contato {
  id: string
  created_at: string
  prospect_id: string
  vendedor_id: string
  anotacao: string
}
