'use client'

import type { SummaryResponse, Semana } from '@/types'
import { formatValue } from '@/lib/format'
import { clsx } from 'clsx'

interface Props {
  summary: SummaryResponse
  summaryMesAnterior?: SummaryResponse | null
}

type FormatType = 'money' | 'percent' | 'number'

interface MetricaConfig {
  label: string
  key: string
  format: FormatType
  metaKey?: string
  special?: 'cirurgias_fechadas'
  negativa?: boolean
  setor?: {
    nome: string
    responsavel: string
    borderColor: string
    accentClass: string // Tailwind bg class for the sector header row
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
      nome: 'MARKETING', responsavel: 'Joice',
      borderColor: 'border-blue-500', accentClass: 'bg-blue-950',
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
      nome: 'VENDAS', responsavel: 'Patricia',
      borderColor: 'border-emerald-500', accentClass: 'bg-emerald-950',
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
    setor: { nome: 'FINANCEIRO', responsavel: 'Paula', borderColor: 'border-amber-500', accentClass: 'bg-amber-950' },
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
    setor: { nome: 'OPERACIONAL', responsavel: 'Leticia', borderColor: 'border-purple-500', accentClass: 'bg-purple-950' },
    label: 'Jornada paciente', key: 'jornada_paciente', format: 'number', metaKey: 'jornada_paciente', negativa: true,
  },
  { label: 'Satisfação (NPS)', key: 'satisfacao_nps', format: 'number', metaKey: 'satisfacao_nps' },
  { label: 'Avaliação Google', key: 'avaliacao_google', format: 'number', metaKey: 'avaliacao_google' },
]

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

// semanaExiste=true: week has data, value=0 → show "0"
// semanaExiste=false: week slot is empty → show "—"
function renderCell(value: number | string, format: FormatType, semanaExiste: boolean, special?: string) {
  if (special === 'cirurgias_fechadas') {
    const str = typeof value === 'string' ? value : String(value)
    if (!str || str === '0') return <span className="text-gray-500">—</span>
    const truncated = str.length > 60 ? str.slice(0, 60) + '...' : str
    return <span title={str} className="text-xs text-gray-400 cursor-help">{truncated}</span>
  }
  if (!semanaExiste) return <span className="text-gray-600">—</span>
  const num = toNum(value)
  if (isNaN(num) || num === 0) return <span className="text-gray-500 font-medium">0</span>
  return <span>{formatValue(num, format)}</span>
}

function renderTotal(value: number | string, format: FormatType, special?: string) {
  if (special === 'cirurgias_fechadas') {
    const str = typeof value === 'string' ? value : String(value)
    if (!str || str === '0') return <span className="text-gray-500">—</span>
    const truncated = str.length > 60 ? str.slice(0, 60) + '...' : str
    return <span title={str} className="text-xs text-gray-400 cursor-help">{truncated}</span>
  }
  const num = toNum(value)
  if (isNaN(num) || num === 0) return <span className="text-gray-600">—</span>
  return <span>{formatValue(num, format)}</span>
}

function heatmapClasses(valor: number, maxVal: number, negativa: boolean): string {
  if (valor === 0 || maxVal === 0) return ''
  const pct = negativa ? 1 - valor / maxVal : valor / maxVal
  if (pct >= 0.85) return 'bg-emerald-900/40 text-emerald-300'
  if (pct >= 0.60) return 'bg-emerald-900/20 text-emerald-400'
  if (pct >= 0.35) return 'text-gray-300'
  return 'text-gray-500'
}

function TendenciaIndicador({ semanas, metricaKey }: { semanas: (Semana | null)[]; metricaKey: string }) {
  const vals = semanas.map((s) => (s ? toNum(getFromSemana(s, metricaKey)) : 0))
  const primeira = vals.find((v) => v > 0) ?? 0
  const ultima = [...vals].reverse().find((v) => v > 0) ?? 0
  if (primeira === 0 || ultima === primeira) return null
  if (ultima > primeira) return <span className="text-xs text-emerald-400 block">↑ crescendo</span>
  return <span className="text-xs text-red-400 block">↓ caindo</span>
}

function ChipComparativo({ atual, anterior, label }: { atual: number; anterior: number; label: string }) {
  if (anterior === 0 || atual === 0) return null
  const diff = ((atual - anterior) / anterior) * 100
  if (Math.abs(diff) < 0.5) return null
  const positivo = diff > 0
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-0.5 text-[9px] font-semibold px-1 py-0.5 rounded',
        positivo
          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          : 'bg-red-500/20 text-red-300 border border-red-500/30'
      )}
      title={label}
    >
      {positivo ? '↑' : '↓'}{Math.abs(diff).toFixed(0)}%
      <span className="font-normal opacity-70">{label}</span>
    </span>
  )
}

function MetaBadge({ total, meta }: { total: number | string; meta: number }) {
  if (!meta || meta === 0) return null
  const num = toNum(total)
  if (isNaN(num) || num === 0) return null
  if (num >= meta) {
    return (
      <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
        ✓ meta
      </span>
    )
  }
  const pct = Math.round((num / meta) * 100)
  return (
    <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
      {pct}%
    </span>
  )
}

function barColor(pct: number) {
  if (pct >= 100) return 'bg-emerald-500'
  if (pct >= 80) return 'bg-emerald-600'
  if (pct >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

function pctColor(pct: number) {
  if (pct >= 80) return 'text-emerald-400'
  if (pct >= 50) return 'text-amber-400'
  return 'text-red-400'
}

function MetaBlock({ label, valor, meta, formatType }: { label: string; valor: number; meta: number; formatType: FormatType }) {
  const pct = Math.min((valor / meta) * 100, 100)
  const atingiu = valor >= meta
  const falta = meta - valor
  const valorFormatado = formatType === 'money' ? formatValue(valor, 'money') : valor.toLocaleString('pt-BR')
  const metaFormatada = formatType === 'money' ? formatValue(meta, 'money') : meta.toLocaleString('pt-BR')
  const faltaFormatado = formatType === 'money' ? `Falta ${formatValue(falta, 'money')}` : `Faltam ${falta.toLocaleString('pt-BR')}`

  return (
    <div className="px-5 py-4 flex-1">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-2xl font-bold text-white">{valorFormatado}</span>
        <span className="text-sm text-gray-500">/ {metaFormatada}</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-1.5">
        <div className={clsx('h-full rounded-full transition-all', barColor(pct))} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between">
        <span className={clsx('text-xs font-bold', pctColor(pct))}>{Math.round(pct)}%</span>
        {atingiu ? (
          <span className="text-xs text-emerald-400 font-medium">✓ Meta atingida!</span>
        ) : (
          <span className="text-xs text-gray-500">{faltaFormatado}</span>
        )}
      </div>
    </div>
  )
}

function BannerMeta({ summary }: { summary: SummaryResponse }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden mb-4">
      <div className="px-5 py-3 border-b border-gray-700 flex items-center gap-3">
        <span className="text-base">🎯</span>
        <div>
          <p className="text-sm font-bold text-white tracking-wide">
            150 consultas → 50 contratos → R$ 1 milhão
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Meta estratégica — {summary.periodo_label}
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-700">
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
        className="px-4 py-1 text-xs text-gray-500 italic bg-gray-800/50 border-t border-dashed border-gray-700"
      >
        {partes.join(' · ')}
      </td>
    </tr>
  )
}

export default function TabelaMetricas({ summary, summaryMesAnterior }: Props) {
  const semanas = summary.semanas ?? []
  const semanasAnterior = summaryMesAnterior?.semanas ?? []
  const semanasExibidas = Array.from({ length: 4 }, (_, i) => semanas[i] ?? null)
  const TOTAL_COLS = 7

  // Índice da semana mais recente com dados (para highlight azul)
  const semanaAtualIdx = (() => {
    for (let i = semanasExibidas.length - 1; i >= 0; i--) {
      if (semanasExibidas[i] !== null) return i
    }
    return -1
  })()

  function getMaxValorSemanas(key: string): number {
    return Math.max(0, ...semanasExibidas.map((s) => (s ? toNum(getFromSemana(s, key)) : 0)))
  }

  let currentSetorConfig: MetricaConfig['setor'] | null = null
  const rows: React.ReactNode[] = []

  METRICAS.forEach((metrica, idx) => {
    const isFirstOfSetor = !!metrica.setor
    if (isFirstOfSetor) currentSetorConfig = metrica.setor!

    const total = getFromSummary(summary, metrica.key)
    const meta = metrica.metaKey ? (summary.metas[metrica.metaKey] ?? 0) : 0
    const maxSem = metrica.special ? 0 : getMaxValorSemanas(metrica.key)

    // Sector header row
    if (isFirstOfSetor && currentSetorConfig) {
      rows.push(
        <tr key={`setor-${idx}`}>
          <td
            colSpan={TOTAL_COLS}
            className={clsx(
              'px-4 py-2 border-l-4',
              currentSetorConfig.accentClass,
              currentSetorConfig.borderColor
            )}
          >
            <span className="text-xs font-bold text-white tracking-widest uppercase">
              {currentSetorConfig.nome}
            </span>
            <span className="text-xs text-gray-400 ml-2">({currentSetorConfig.responsavel})</span>
          </td>
        </tr>
      )
    }

    rows.push(
      <tr key={`row-${idx}`} className="hover:bg-gray-800/40 transition-colors">
        {/* Setor accent border */}
        <td className={clsx('w-1 border-l-4', currentSetorConfig?.borderColor ?? 'border-transparent')} />

        {/* Métrica label */}
        <td className="px-3 py-1.5 text-gray-300 text-xs whitespace-nowrap">{metrica.label}</td>

        {/* Semanas */}
        {semanasExibidas.map((semana, i) => {
          const semanaExiste = semana !== null
          const rawVal = semana ? getFromSemana(semana, metrica.key) : 0
          const numVal = toNum(rawVal)
          const heat = semanaExiste && !metrica.special && numVal > 0
            ? heatmapClasses(numVal, maxSem, !!metrica.negativa)
            : ''
          const isAtual = i === semanaAtualIdx

          // Semana anterior no mesmo mês (i-1)
          const semanaAnteriorMes = i > 0 ? semanasExibidas[i - 1] : null
          const valAnteriorMes = semanaAnteriorMes ? toNum(getFromSemana(semanaAnteriorMes, metrica.key)) : 0

          // Mesma semana do mês anterior
          const semanaAnteriorMesPassado = semanasAnterior[i] ?? null
          const valMesPassado = semanaAnteriorMesPassado ? toNum(getFromSemana(semanaAnteriorMesPassado, metrica.key)) : 0
          const labelMesPassado = summaryMesAnterior
            ? summaryMesAnterior.semanas[i]?.label ?? 'mês ant.'
            : 'mês ant.'

          return (
            <td
              key={i}
              className={clsx(
                'px-2 py-1.5 text-center w-24 align-top transition-colors',
                isAtual
                  ? 'bg-blue-950/60 border-x border-blue-800/40'
                  : heat || ''
              )}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className={clsx('text-sm font-semibold', isAtual && numVal > 0 && !heat ? 'text-blue-200' : '')}>
                  {renderCell(rawVal, metrica.format, semanaExiste, metrica.special)}
                </span>
                {semanaExiste && !metrica.special && numVal > 0 && (
                  <div className="flex flex-col items-center gap-0.5">
                    {i > 0 && (
                      <ChipComparativo atual={numVal} anterior={valAnteriorMes} label="vs ant." />
                    )}
                    {summaryMesAnterior && valMesPassado > 0 && (
                      <ChipComparativo
                        atual={numVal}
                        anterior={valMesPassado}
                        label={`vs ${labelMesPassado.replace('ª Semana', 'ª').toLowerCase()} ago`}
                      />
                    )}
                  </div>
                )}
              </div>
            </td>
          )
        })}

        {/* Total */}
        <td className="px-3 py-1.5 text-right bg-gray-800/60 font-semibold text-white border-l border-gray-700 w-32 align-top">
          <div className="inline-flex flex-col items-end gap-0.5">
            <div className="inline-flex items-center gap-1 flex-wrap justify-end">
              {renderTotal(total, metrica.format, metrica.special)}
              {metrica.metaKey && <MetaBadge total={total} meta={meta} />}
            </div>
            {!metrica.special && (
              <TendenciaIndicador semanas={semanasExibidas} metricaKey={metrica.key} />
            )}
          </div>
        </td>
      </tr>
    )

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

      <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-700 flex items-center justify-between">
          <h2 className="font-bold text-white text-sm tracking-wide">
            Métricas do Período — {summary.periodo_label}
          </h2>
          <span className="text-xs text-gray-500">{summary.semanas_com_dados} semanas com dados</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="w-1" />
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Métrica
                </th>
                {semanasExibidas.map((_, i) => {
                  const isAtual = i === semanaAtualIdx
                  return (
                    <th
                      key={i}
                      className={clsx(
                        'text-center px-3 py-2 text-xs font-semibold uppercase tracking-wider w-24',
                        isAtual
                          ? 'text-blue-300 bg-blue-950/60 border-x border-blue-800/40'
                          : 'text-gray-500'
                      )}
                    >
                      {i + 1}ª Sem
                      {isAtual && <span className="block text-[9px] font-normal text-blue-400 normal-case">atual</span>}
                    </th>
                  )
                })}
                <th className="text-right px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider w-32 bg-gray-800/60 border-l border-gray-700">
                  Total Mês
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">{rows}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
