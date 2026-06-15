'use client'

import type { SummaryResponse, Semana } from '@/types'
import { formatValue } from '@/lib/format'
import { clsx } from 'clsx'

interface Props {
  summary: SummaryResponse
}

type FormatType = 'money' | 'percent' | 'number'

interface MetricaConfig {
  label: string
  key: string
  format: FormatType
  metaKey?: string
  special?: 'cirurgias_fechadas'
  negativa?: boolean // menor = melhor (ex: inadimplência, jornada)
  setor?: {
    nome: string
    responsavel: string
    borderColor: string
    // chaves de métricas relevantes para linha de "melhor semana"
    melhorSemanaKeys?: Array<{ key: string; label: string; format: FormatType }>
  }
}

const META_CONSULTAS = 150
const META_CONTRATOS = 50
const META_FATURAMENTO = 1_000_000

const METRICAS: MetricaConfig[] = [
  // MARKETING
  {
    setor: {
      nome: 'MARKETING', responsavel: 'Joice', borderColor: 'border-blue-500',
      melhorSemanaKeys: [{ key: 'primeiras_consultas', label: 'consultas', format: 'number' }],
    },
    label: 'Cliques no anúncio', key: 'clicaram_no_anuncio', format: 'number', metaKey: 'clicaram_no_anuncio',
  },
  { label: 'Conversas iniciadas', key: 'conversas_iniciadas', format: 'number', metaKey: 'conversas_iniciadas' },
  { label: 'Primeiras consultas', key: 'primeiras_consultas', format: 'number', metaKey: 'primeiras_consultas' },
  { label: 'Cons. presenciais', key: 'consultas_presenciais', format: 'number', metaKey: 'consultas_presenciais' },
  { label: 'Cons. online', key: 'consultas_online', format: 'number', metaKey: 'consultas_online' },
  { label: 'Ticket médio cons.', key: 'ticket_medio_consultas', format: 'money', metaKey: 'ticket_medio_consultas' },
  // VENDAS
  {
    setor: {
      nome: 'VENDAS', responsavel: 'Patricia', borderColor: 'border-emerald-500',
      melhorSemanaKeys: [
        { key: 'total_contratos', label: 'contratos', format: 'number' },
        { key: 'valor_total_fechado', label: 'faturamento', format: 'money' },
      ],
    },
    label: 'Orçamentos', key: 'numero_orcamentos', format: 'number', metaKey: 'numero_orcamentos',
  },
  { label: 'Contratos online', key: 'contratos_online', format: 'number', metaKey: 'contratos_online' },
  { label: 'Contratos presencial', key: 'contratos_presencial', format: 'number', metaKey: 'contratos_presencial' },
  { label: 'Total contratos', key: 'total_contratos', format: 'number', metaKey: 'total_contratos' },
  { label: 'Ticket médio cir.', key: 'ticket_medio_cirurgias', format: 'money', metaKey: 'ticket_medio_cirurgias' },
  { label: '% Conversão', key: 'percentual_conversao', format: 'percent', metaKey: 'percentual_conversao' },
  { label: 'Valor fechado', key: 'valor_total_fechado', format: 'money', metaKey: 'valor_total_fechado' },
  { label: 'Cirurgias fechadas', key: 'cirurgias_fechadas', format: 'number', special: 'cirurgias_fechadas' },
  // FINANCEIRO
  {
    setor: { nome: 'FINANCEIRO', responsavel: 'Paula', borderColor: 'border-amber-500' },
    label: 'Pgto. à vista', key: 'pagamento_avista', format: 'number',
  },
  { label: 'Pgto. até 6x', key: 'pagamento_ate6x', format: 'number' },
  { label: 'Pgto. acima 6x', key: 'pagamento_acima6x', format: 'number' },
  { label: 'Reserva técnica', key: 'reserva_tecnica', format: 'money' },
  { label: 'Contratos pré-venda', key: 'contratos_prevenda', format: 'number' },
  { label: 'Inadimplência', key: 'inadimplencia', format: 'number', negativa: true },
  { label: 'Adimplência', key: 'adimplencia', format: 'number' },
  { label: 'Margem bruta', key: 'margem_bruta', format: 'money' },
  { label: 'Recebíveis 6 meses', key: 'recebiveis_6meses', format: 'money' },
  { label: 'Despesas fixas', key: 'despesas_fixas', format: 'money', negativa: true },
  // OPERACIONAL
  {
    setor: { nome: 'OPERACIONAL', responsavel: 'Leticia', borderColor: 'border-purple-500' },
    label: 'Jornada paciente', key: 'jornada_paciente', format: 'number', metaKey: 'jornada_paciente', negativa: true,
  },
  { label: 'Satisfação (NPS)', key: 'satisfacao_nps', format: 'number', metaKey: 'satisfacao_nps' },
  { label: 'Avaliação Google', key: 'avaliacao_google', format: 'number', metaKey: 'avaliacao_google' },
]

// Índices onde começa cada setor (para saber onde inserir linha de melhor semana)
const SETOR_FIM_INDICES = (() => {
  const result: number[] = []
  let pendingSetor = false
  for (let i = 0; i < METRICAS.length; i++) {
    if (METRICAS[i].setor && i > 0) result.push(i - 1)
    if (METRICAS[i].setor) pendingSetor = true
  }
  if (pendingSetor) result.push(METRICAS.length - 1)
  return result
})()

// Retorna o índice (0-based) da última linha de cada bloco de setor
function buildSetorBlocos() {
  const blocos: Array<{ inicio: number; fim: number; config: MetricaConfig['setor'] }> = []
  let inicio = 0
  let config: MetricaConfig['setor'] | undefined

  METRICAS.forEach((m, i) => {
    if (m.setor) {
      if (config) blocos.push({ inicio, fim: i - 1, config })
      inicio = i
      config = m.setor
    }
  })
  if (config) blocos.push({ inicio, fim: METRICAS.length - 1, config })
  return blocos
}

const SETOR_BLOCOS = buildSetorBlocos()

function getFromSummary(summary: SummaryResponse, key: string): number | string {
  const all: Record<string, number | string> = {
    ...summary.marketing,
    ...summary.vendas,
    ...summary.financeiro,
    ...summary.operacional,
  }
  return all[key] ?? 0
}

function getFromSemana(semana: Semana, key: string): number | string {
  return (semana.metricas as unknown as Record<string, number | string>)[key] ?? 0
}

function toNum(v: number | string): number {
  const n = typeof v === 'string' ? parseFloat(v) : v
  return isNaN(n) ? 0 : n
}

function renderCell(value: number | string, format: FormatType, special?: string) {
  if (special === 'cirurgias_fechadas') {
    const str = typeof value === 'string' ? value : String(value)
    if (!str || str === '0') return <span className="text-gray-300">—</span>
    const truncated = str.length > 60 ? str.slice(0, 60) + '...' : str
    return (
      <span title={str} className="text-xs text-gray-600 cursor-help">
        {truncated}
      </span>
    )
  }
  const num = toNum(value)
  if (value === '' || value === null || value === undefined || isNaN(num) || num === 0) {
    return <span className="text-gray-300">—</span>
  }
  return <span>{formatValue(num, format)}</span>
}

function heatmapClasses(
  valor: number,
  maxVal: number,
  negativa: boolean,
): string {
  if (valor === 0 || maxVal === 0) return ''
  const pct = negativa ? 1 - valor / maxVal : valor / maxVal
  if (pct >= 0.85) return 'bg-emerald-100 text-emerald-900'
  if (pct >= 0.60) return 'bg-emerald-50 text-emerald-800'
  if (pct >= 0.35) return 'bg-gray-50 text-gray-700'
  return 'text-gray-400'
}

function TendenciaIndicador({ semanas, metricaKey }: { semanas: (Semana | null)[]; metricaKey: string }) {
  const vals = semanas.map((s) => (s ? toNum(getFromSemana(s, metricaKey)) : 0))
  const primeira = vals.find((v) => v > 0) ?? 0
  const ultima = [...vals].reverse().find((v) => v > 0) ?? 0
  if (primeira === 0 || ultima === primeira) return null
  if (ultima > primeira) return <span className="text-xs text-emerald-500 block">↑ crescendo</span>
  return <span className="text-xs text-red-400 block">↓ caindo</span>
}

function MetaBadge({ total, meta }: { total: number | string; meta: number }) {
  if (!meta || meta === 0) return null
  const num = toNum(total)
  if (isNaN(num) || num === 0) return null
  if (num >= meta) {
    return (
      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
        ✓ meta
      </span>
    )
  }
  const pct = Math.round((num / meta) * 100)
  return (
    <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
      {pct}% da meta
    </span>
  )
}

function barColor(pct: number) {
  if (pct >= 100) return 'bg-emerald-600'
  if (pct >= 80) return 'bg-emerald-500'
  if (pct >= 50) return 'bg-amber-400'
  return 'bg-red-400'
}

function pctColor(pct: number) {
  if (pct >= 80) return 'text-emerald-600'
  if (pct >= 50) return 'text-amber-600'
  return 'text-red-500'
}

interface MetaBlockProps {
  label: string
  valor: number
  meta: number
  formatType: FormatType
}

function MetaBlock({ label, valor, meta, formatType }: MetaBlockProps) {
  const pct = Math.min((valor / meta) * 100, 100)
  const atingiu = valor >= meta
  const falta = meta - valor

  const valorFormatado = formatType === 'money' ? formatValue(valor, 'money') : valor.toLocaleString('pt-BR')
  const metaFormatada = formatType === 'money' ? formatValue(meta, 'money') : meta.toLocaleString('pt-BR')
  const faltaFormatado = formatType === 'money' ? `Falta ${formatValue(falta, 'money')}` : `Faltam ${falta.toLocaleString('pt-BR')}`

  return (
    <div className="px-6 py-4 flex-1">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-2xl font-bold text-gray-900">{valorFormatado}</span>
        <span className="text-lg text-gray-400">/ {metaFormatada}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
        <div className={clsx('h-full rounded-full transition-all', barColor(pct))} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between">
        <span className={clsx('text-xs font-semibold', pctColor(pct))}>{Math.round(pct)}%</span>
        {atingiu ? (
          <span className="text-xs text-emerald-600 font-medium">✓ Meta atingida!</span>
        ) : (
          <span className="text-xs text-gray-500">{faltaFormatado}</span>
        )}
      </div>
    </div>
  )
}

function BannerMeta({ summary }: { summary: SummaryResponse }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-700">
          🎯 150 consultas → 50 contratos → R$ 1 milhão
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Meta estratégica do mês — {summary.periodo_label}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        <MetaBlock label="Consultas" valor={summary.marketing.primeiras_consultas} meta={META_CONSULTAS} formatType="number" />
        <MetaBlock label="Contratos" valor={summary.vendas.total_contratos} meta={META_CONTRATOS} formatType="number" />
        <MetaBlock label="Faturamento" valor={summary.vendas.valor_total_fechado} meta={META_FATURAMENTO} formatType="money" />
      </div>
    </div>
  )
}

function LinhaMelhorSemana({
  semanas,
  keys,
  colCount,
}: {
  semanas: (Semana | null)[]
  keys: NonNullable<MetricaConfig['setor']>['melhorSemanaKeys']
  colCount: number
}) {
  if (!keys?.length) return null

  const partes = keys.map(({ key, label, format }) => {
    let maxVal = 0
    let maxIdx = -1
    semanas.forEach((s, i) => {
      if (!s) return
      const v = toNum(getFromSemana(s, key))
      if (v > maxVal) { maxVal = v; maxIdx = i }
    })
    if (maxIdx < 0) return null
    return `Melhor semana em ${label}: ${maxIdx + 1}ª Sem (${formatValue(maxVal, format)})`
  }).filter(Boolean)

  if (!partes.length) return null

  return (
    <tr>
      <td
        colSpan={colCount}
        className="px-4 py-1 text-xs text-gray-400 italic bg-gray-50 border-t border-dashed border-gray-200"
      >
        {partes.join(' · ')}
      </td>
    </tr>
  )
}

export default function TabelaMetricas({ summary }: Props) {
  const semanas = summary.semanas ?? []
  const semanasExibidas = Array.from({ length: 4 }, (_, i) => semanas[i] ?? null)
  // Total de colunas: setor + métrica + 4 semanas + total = 7
  const TOTAL_COLS = 7

  // Pre-compute max values per metric across semanas (for heatmap)
  function getMaxValorSemanas(key: string): number {
    return Math.max(
      0,
      ...semanasExibidas.map((s) => (s ? toNum(getFromSemana(s, key)) : 0))
    )
  }

  let currentSetorConfig: MetricaConfig['setor'] | null = null

  const rows: React.ReactNode[] = []

  METRICAS.forEach((metrica, idx) => {
    const isFirstOfSetor = !!metrica.setor
    if (isFirstOfSetor) currentSetorConfig = metrica.setor!

    const total = getFromSummary(summary, metrica.key)
    const meta = metrica.metaKey ? (summary.metas[metrica.metaKey] ?? 0) : 0
    const maxSem = metrica.special ? 0 : getMaxValorSemanas(metrica.key)

    rows.push(
      <tr key={`row-${idx}`} className="hover:brightness-[0.97] transition-all">
        {/* Setor */}
        <td
          className={clsx(
            'px-3 py-3 align-top border-l-4 bg-gray-50 w-24',
            isFirstOfSetor && currentSetorConfig
              ? currentSetorConfig.borderColor
              : 'border-transparent'
          )}
        >
          {isFirstOfSetor && currentSetorConfig && (
            <div>
              <div className="font-semibold text-gray-800 text-xs">{currentSetorConfig.nome}</div>
              <div className="text-gray-400 text-xs">({currentSetorConfig.responsavel})</div>
            </div>
          )}
        </td>

        {/* Métrica label */}
        <td className="px-3 py-3 text-gray-700">{metrica.label}</td>

        {/* Semanas com heatmap */}
        {semanasExibidas.map((semana, i) => {
          const rawVal = semana ? getFromSemana(semana, metrica.key) : 0
          const numVal = toNum(rawVal)
          const heat = !metrica.special && numVal > 0
            ? heatmapClasses(numVal, maxSem, !!metrica.negativa)
            : ''

          return (
            <td
              key={i}
              className={clsx('px-3 py-3 text-center w-24 transition-colors', heat)}
            >
              {semana
                ? renderCell(rawVal, metrica.format, metrica.special)
                : <span className="text-gray-300">—</span>
              }
            </td>
          )
        })}

        {/* Total */}
        <td className="px-3 py-3 text-right bg-gray-50 font-semibold text-gray-800 border-l-2 border-gray-200 w-32">
          <div className="inline-flex flex-col items-end gap-0.5">
            <div className="inline-flex items-center gap-1 flex-wrap justify-end">
              {renderCell(total, metrica.format, metrica.special)}
              {metrica.metaKey && <MetaBadge total={total} meta={meta} />}
            </div>
            {!metrica.special && (
              <TendenciaIndicador semanas={semanasExibidas} metricaKey={metrica.key} />
            )}
          </div>
        </td>
      </tr>
    )

    // Após a última linha de cada bloco de setor, inserir linha de melhor semana
    const bloco = SETOR_BLOCOS.find((b) => b.fim === idx)
    if (bloco?.config?.melhorSemanaKeys) {
      rows.push(
        <LinhaMelhorSemana
          key={`best-${idx}`}
          semanas={semanasExibidas}
          keys={bloco.config.melhorSemanaKeys}
          colCount={TOTAL_COLS}
        />
      )
    }
  })

  return (
    <div className="space-y-0">
      <BannerMeta summary={summary} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">
            Métricas do Período — {summary.periodo_label}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24 bg-gray-50">
                  Setor
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  Métrica
                </th>
                {semanasExibidas.map((_, i) => (
                  <th
                    key={i}
                    className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24 bg-gray-50"
                  >
                    {i + 1}ª Sem
                  </th>
                ))}
                <th className="text-right px-3 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider w-32 bg-gray-100 border-l-2 border-gray-200">
                  Total Mês
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">{rows}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
