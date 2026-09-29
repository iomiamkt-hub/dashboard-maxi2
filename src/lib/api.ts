import type { SummaryResponse, MesesResponse, MetricasMarketing, MetricasVendas, MetricasFinanceiro, MetricasOperacional, Semana } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL!

// ──────────────────────────────────────────────────────────────
// Tipos do novo formato retornado pelo Apps Script
// ──────────────────────────────────────────────────────────────
interface RawMetrica {
  meta: number
  semanas: (number | null)[]
  total: number | null
}
interface RawSetor { [chave: string]: RawMetrica }
interface RawMes {
  mes: string
  ano: number
  setores: { [setor: string]: RawSetor }
}
interface RawApiResponse {
  atualizadoEm: string
  referencia?: { mes: string; ano: number }
  mesAtual: RawMes
  mesAnterior?: RawMes
  comparativoSemanal?: unknown
  mesmoMesAnoAnterior?: unknown
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
function num(setor: RawSetor, chave: string): number {
  return setor[chave]?.total ?? 0
}
function sems(setor: RawSetor, chave: string): (number | null)[] {
  return setor[chave]?.semanas ?? []
}
function semNum(setor: RawSetor, chave: string, i: number): number {
  return (setor[chave]?.semanas?.[i] as number | null | undefined) ?? 0
}
function meta(setor: RawSetor, chave: string): number {
  return setor[chave]?.meta ?? 0
}

const MES_ABREV: Record<string, string> = {
  Janeiro:'JAN',Fevereiro:'FEV',Março:'MAR',Abril:'ABR',Maio:'MAI',Junho:'JUN',
  Julho:'JUL',Agosto:'AGO',Setembro:'SET',Outubro:'OUT',Novembro:'NOV',Dezembro:'DEZ',
}

const MESES_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function abaDoMesAtual(): string {
  const now = new Date()
  const nome = MESES_PT[now.getMonth()]
  return `${MES_ABREV[nome]}${now.getFullYear()}`
}

// ──────────────────────────────────────────────────────────────
// Transformador: novo formato → SummaryResponse
// ──────────────────────────────────────────────────────────────
function transformar(raw: RawApiResponse): SummaryResponse {
  const d = raw.mesAtual
  const MK = d.setores['MARKETING (JOICE)']    ?? {}
  const VD = d.setores['VENDAS (PATRICIA)']    ?? {}
  const FN = d.setores['FINANCEIRO (PAULA)']   ?? {}
  const OP = d.setores['OPERACIONAL (LETICIA)'] ?? {}

  const aba = `${MES_ABREV[d.mes] ?? d.mes.toUpperCase().slice(0,3)}${d.ano}`
  const periodo_label = `${d.mes} ${d.ano}`

  // Número de semanas: max entre as métricas-chave
  const nSem = Math.max(
    sems(MK, 'CLICARAM NO ANÚNCIO').length,
    sems(VD, 'TOTAL DE CONTRATOS FECHADOS').length,
    sems(VD, 'VALOR TOTAL FECHADO').length,
    0,
  )

  const semanas: Semana[] = Array.from({ length: nSem }, (_, i) => ({
    semana: i + 1,
    label: `${i + 1}ª Semana`,
    periodo_label: `${i + 1}ª Sem — ${periodo_label}`,
    metricas: {
      // Marketing
      clicaram_no_anuncio:   semNum(MK, 'CLICARAM NO ANÚNCIO', i),
      conversas_iniciadas:   semNum(MK, 'CONVERSAS INICIADAS', i),
      primeiras_consultas:   semNum(MK, 'PRIMEIRAS CONSULTAS', i),
      consultas_presenciais: semNum(MK, 'CONSULTAS PRESENCIAIS', i),
      consultas_online:      semNum(MK, 'CONSULTAS ONLINE', i),
      ticket_medio_consultas:semNum(MK, 'TICKET MÉDIO DAS CONSULTAS', i),
      // Vendas
      numero_orcamentos:     semNum(VD, 'NÚMERO DE ORÇAMENTOS', i),
      contratos_online:      semNum(VD, 'CONTRATOS FECHADOS ONLINE', i),
      contratos_presencial:  semNum(VD, 'CONTRATOS FECHADOS PRESENCIAL', i),
      total_contratos:       semNum(VD, 'TOTAL DE CONTRATOS FECHADOS', i),
      ticket_medio_cirurgias:semNum(VD, 'TICKET MÉDIO DAS CIRURGIAS', i),
      percentual_conversao:  semNum(VD, 'PERCENTUAL DE CONVERSÃO', i),
      valor_total_fechado:   semNum(VD, 'VALOR TOTAL FECHADO', i),
      cirurgias_orcadas:     '',
      cirurgias_fechadas:    '',
      // Financeiro
      pagamento_avista:      semNum(FN, 'PAGAMENTO À VISTA', i),
      pagamento_ate6x:       semNum(FN, 'PAGAMENTO À PRAZO (ATÉ 6X)', i),
      pagamento_acima6x:     semNum(FN, 'PAGAMENTO À PRAZO (ACIMA DE 6X)', i),
      reserva_tecnica:       semNum(FN, 'RESERVA TÉCNICA', i),
      contratos_prevenda:    semNum(FN, 'CONTRATOS PRÉ-VENDA', i),
      inadimplencia:         semNum(FN, 'INADIMPLÊNCIA', i),
      adimplencia:           semNum(FN, 'ADIMPLÊNCIA', i),
      margem_bruta:          semNum(FN, 'MARGEM BRUTA', i),
      recebiveis_6meses:     semNum(FN, 'RECEBÍVEIS 6 MESES', i),
      despesas_fixas:        semNum(FN, 'DESPESAS FIXAS MENSAIS', i),
      // Operacional
      jornada_paciente:      semNum(OP, 'JORNADA DO PACIENTE', i),
      satisfacao_nps:        semNum(OP, 'SATISFAÇÃO PACIENTES (INTERNO)', i),
      avaliacao_google:      semNum(OP, 'AVALIAÇÃO GOOGLE', i),
    } as unknown as MetricasMarketing & MetricasVendas & MetricasFinanceiro & MetricasOperacional,
  }))

  const marketing: MetricasMarketing = {
    clicaram_no_anuncio:    num(MK, 'CLICARAM NO ANÚNCIO'),
    conversas_iniciadas:    num(MK, 'CONVERSAS INICIADAS'),
    primeiras_consultas:    num(MK, 'PRIMEIRAS CONSULTAS'),
    consultas_presenciais:  num(MK, 'CONSULTAS PRESENCIAIS'),
    consultas_online:       num(MK, 'CONSULTAS ONLINE'),
    ticket_medio_consultas: num(MK, 'TICKET MÉDIO DAS CONSULTAS'),
  }
  const vendas: MetricasVendas = {
    numero_orcamentos:      num(VD, 'NÚMERO DE ORÇAMENTOS'),
    contratos_online:       num(VD, 'CONTRATOS FECHADOS ONLINE'),
    contratos_presencial:   num(VD, 'CONTRATOS FECHADOS PRESENCIAL'),
    total_contratos:        num(VD, 'TOTAL DE CONTRATOS FECHADOS'),
    ticket_medio_cirurgias: num(VD, 'TICKET MÉDIO DAS CIRURGIAS'),
    percentual_conversao:   num(VD, 'PERCENTUAL DE CONVERSÃO'),
    valor_total_fechado:    num(VD, 'VALOR TOTAL FECHADO'),
    cirurgias_orcadas:      '',
    cirurgias_fechadas:     '',
  }
  const financeiro: MetricasFinanceiro = {
    pagamento_avista:    num(FN, 'PAGAMENTO À VISTA'),
    pagamento_ate6x:     num(FN, 'PAGAMENTO À PRAZO (ATÉ 6X)'),
    pagamento_acima6x:   num(FN, 'PAGAMENTO À PRAZO (ACIMA DE 6X)'),
    reserva_tecnica:     num(FN, 'RESERVA TÉCNICA'),
    contratos_prevenda:  num(FN, 'CONTRATOS PRÉ-VENDA'),
    inadimplencia:       num(FN, 'INADIMPLÊNCIA'),
    adimplencia:         num(FN, 'ADIMPLÊNCIA'),
    margem_bruta:        num(FN, 'MARGEM BRUTA'),
    recebiveis_6meses:   num(FN, 'RECEBÍVEIS 6 MESES'),
    despesas_fixas:      num(FN, 'DESPESAS FIXAS MENSAIS'),
  }
  const operacional: MetricasOperacional = {
    jornada_paciente:  num(OP, 'JORNADA DO PACIENTE'),
    satisfacao_nps:    num(OP, 'SATISFAÇÃO PACIENTES (INTERNO)'),
    avaliacao_google:  num(OP, 'AVALIAÇÃO GOOGLE'),
  }

  const metas: Record<string, number> = {
    clicaram_no_anuncio:    meta(MK, 'CLICARAM NO ANÚNCIO'),
    conversas_iniciadas:    meta(MK, 'CONVERSAS INICIADAS'),
    primeiras_consultas:    meta(MK, 'PRIMEIRAS CONSULTAS'),
    consultas_presenciais:  meta(MK, 'CONSULTAS PRESENCIAIS'),
    consultas_online:       meta(MK, 'CONSULTAS ONLINE'),
    ticket_medio_consultas: meta(MK, 'TICKET MÉDIO DAS CONSULTAS'),
    numero_orcamentos:      meta(VD, 'NÚMERO DE ORÇAMENTOS'),
    total_contratos:        meta(VD, 'TOTAL DE CONTRATOS FECHADOS'),
    valor_total_fechado:    meta(VD, 'VALOR TOTAL FECHADO'),
    jornada_paciente:       meta(OP, 'JORNADA DO PACIENTE'),
    satisfacao_nps:         meta(OP, 'SATISFAÇÃO PACIENTES (INTERNO)'),
    avaliacao_google:       meta(OP, 'AVALIAÇÃO GOOGLE'),
  }

  return {
    generated_at: raw.atualizadoEm,
    aba,
    periodo_label,
    semanas_com_dados: nSem,
    marketing,
    vendas,
    financeiro,
    operacional,
    metas,
    semanas,
  }
}

// ──────────────────────────────────────────────────────────────
// Detecta se a resposta é o novo formato ou o antigo
// ──────────────────────────────────────────────────────────────
function isNovoFormato(json: unknown): json is RawApiResponse {
  return typeof json === 'object' && json !== null && 'mesAtual' in json
}

// ──────────────────────────────────────────────────────────────
// API pública
// ──────────────────────────────────────────────────────────────
export async function fetchSummary(mes?: string): Promise<SummaryResponse> {
  // Sempre passa o mês explicitamente — sem ele, o Apps Script pode retornar mês errado
  const mesParam = mes ?? abaDoMesAtual()
  const url = `${BASE_URL}?format=summary&mes=${mesParam}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Apps Script retornou status ${res.status}.`)
  const json: unknown = await res.json()

  if (isNovoFormato(json)) return transformar(json)

  // Formato antigo — retorna diretamente
  return json as SummaryResponse
}

function gerarMesesFallback(): MesesResponse {
  const agora = new Date()
  const anoAtual = agora.getFullYear()
  const mesAtual = agora.getMonth() // 0-indexed
  const meses = []
  for (let m = 0; m <= mesAtual; m++) {
    const nome = MESES_PT[m]
    const abrev = MES_ABREV[nome]
    meses.push({
      aba: `${abrev}${anoAtual}`,
      mes: String(m + 1).padStart(2, '0'),
      ano: String(anoAtual),
      mes_nome: nome,
      periodo_label: `${nome} ${anoAtual}`,
    })
  }
  return { meses, mes_atual: meses[meses.length - 1].aba }
}

export async function fetchMeses(): Promise<MesesResponse> {
  try {
    const res = await fetch(`${BASE_URL}?format=meses`, { cache: 'no-store' })
    if (!res.ok) return gerarMesesFallback()
    const json: unknown = await res.json()
    // Valida que tem a estrutura esperada
    if (
      typeof json === 'object' && json !== null &&
      'meses' in json && Array.isArray((json as MesesResponse).meses) &&
      'mes_atual' in json
    ) {
      return json as MesesResponse
    }
    return gerarMesesFallback()
  } catch {
    return gerarMesesFallback()
  }
}
