export interface MetricasMarketing {
  clicaram_no_anuncio: number
  conversas_iniciadas: number
  primeiras_consultas: number
  consultas_presenciais: number
  consultas_online: number
  ticket_medio_consultas: number
}

export interface MetricasVendas {
  numero_orcamentos: number
  contratos_online: number
  contratos_presencial: number
  total_contratos: number
  ticket_medio_cirurgias: number
  percentual_conversao: number
  valor_total_fechado: number
  cirurgias_orcadas: string
  cirurgias_fechadas: string
}

export interface MetricasFinanceiro {
  pagamento_avista: number
  pagamento_ate6x: number
  pagamento_acima6x: number
  reserva_tecnica: number
  contratos_prevenda: number
  inadimplencia: number
  adimplencia: number
  margem_bruta: number
  recebiveis_6meses: number
  despesas_fixas: number
}

export interface MetricasOperacional {
  jornada_paciente: number
  satisfacao_nps: number
  avaliacao_google: number
}

export interface Semana {
  semana: number
  label: string
  periodo_label: string
  metricas: MetricasMarketing & MetricasVendas & MetricasFinanceiro & MetricasOperacional
}

export interface SummaryResponse {
  generated_at: string
  aba: string
  periodo_label: string
  semanas_com_dados: number
  marketing: MetricasMarketing
  vendas: MetricasVendas
  financeiro: MetricasFinanceiro
  operacional: MetricasOperacional
  metas: Record<string, number>
  semanas: Semana[]
}

export interface MesDisponivel {
  aba: string
  mes: string
  ano: string
  mes_nome: string
  periodo_label: string
}

export interface MesesResponse {
  meses: MesDisponivel[]
  mes_atual: string
}
