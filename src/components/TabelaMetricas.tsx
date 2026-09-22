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
    headerBg: string
    borderColor: string
    rowBorder: string
    melhorSemanaKeys?: Array<{ key: string; label: string; format: FormatType }>
  }
}

const META_CONSULTAS = 150
const META_CONTRATOS = 50
const META_FATURAMENTO = 1_000_000

const METRICAS: MetricaConfig[] = [
  {
    setor: {
      nome: 'MARKETING', responsavel: 'Joice',
      headerBg: 'bg-blue-700', borderColor: 'border-blue-500', rowBorder: 'border-l-blue-500',
      melhorSemanaKeys: [{ key: 'primeiras_consultas', label: 'consultas', format: 'number' }],
    },
    label: 'Cliques no anúncio', key: 'clicaram_no_anuncio', format: 'number', metaKey: 'clicaram_no_anuncio',
  },
  { label: 'Conversas iniciadas', key: 'conversas_iniciadas', format: 'number', metaKey: 'conversas_iniciadas' },
  { label: 'Primeiras consultas', key: 'primeiras_consultas', format: 'number', metaKey: 'primeiras_consultas' },
  { label: 'Cons. presenciais', key: 'consultas_presenciais', format: 'number', metaKey: 'consultas_presenciais' },
  { label: 'Cons. online', key: 'consultas_online', format: 'number', metaKey: 'consultas_online' },
  { label: 'Ticket médio cons.', key: 'ticket_medio_consultas', format: 'money', metaKey: 'ticket_medio_consultas' },
  {
    setor: {
      nome: 'VENDAS', responsavel: 'Patricia',
      headerBg: 'bg-emerald-700', borderColor: 'border-emerald-500', rowBorder: 'border-l-emerald-500',
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
  {
    setor: {
      nome: 'FINANCEIRO', responsavel: 'Paula',
      headerBg: 'bg-amber-600', borderColor: 'border-amber-400', rowBorder: 'border-l-amber-400',
    },
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
  {
    setor: {
      nome: 'OPERACIONAL', responsavel: 'Leticia',
      headerBg: 'bg-purple-700', borderColor: 'border-purple-500', rowBorder: 'border-l-purple-500',
    },
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
      inicio = i; config = m.setor
    }
  })
  if (config) blocos.push({ inicio, fim: METRICAS.length - 1, config })
  return blocos
}
const SETOR_BLOCOS = buildSetorBlocos()

function getFromSummary(summary: SummaryResponse, key: string): number | string {
  const all: Record<string, number | string> = {
    ...summary.marketing, ...summary.vendas, ...summary.financeiro, ...summary.operacional,
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

// Extrai abreviação de mês do label (ex: "1ª Semana" do summary anterior → "ago")
function mesAbrev(summary: SummaryResponse): string {
  const p = summary.periodo_label ?? ''
  // "Setembro 2026" → "set", "Agosto 2026" → "ago"
  const m: Record<string, string> = {
    janeiro:'jan',fevereiro:'fev',março:'mar',abril:'abr',maio:'mai',junho:'jun',
    julho:'jul',agosto:'ago',setembro:'set',outubro:'out',novembro:'nov',dezembro:'dez',
  }
  const lower = p.toLowerCase()
  for (const [nome, abrev] of Object.entries(m)) {
    if (lower.startsWith(nome)) return abrev
  }
  return 'ant'
}

function Chip({
  atual, anterior, labelSem, positiveIsGood = true,
}: {
  atual: number; anterior: number; labelSem: string; positiveIsGood?: boolean
}) {
  if (anterior === 0 || atual === 0) return null
  const diff = ((atual - anterior) / anterior) * 100
  if (Math.abs(diff) < 0.5) return null
  const up = diff > 0
  const good = positiveIsGood ? up : !up
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap',
        good
          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
          : 'bg-red-50 text-red-600 border-red-300'
      )}
    >
      {up ? '▲' : '▼'}{Math.abs(diff).toFixed(0)}%
      <span className="font-normal opacity-60">{labelSem}</span>
    </span>
  )
}

function TendenciaIndicador({ semanas, metricaKey }: { semanas: (Semana | null)[]; metricaKey: string }) {
  const vals = semanas.map((s) => (s ? toNum(getFromSemana(s, metricaKey)) : 0))
  const primeira = vals.find((v) => v > 0) ?? 0
  const ultima = [...vals].reverse().find((v) => v > 0) ?? 0
  if (primeira === 0 || ultima === primeira) return null
  if (ultima > primeira) return <span className="text-[10px] text-emerald-600 font-semibold">↑ crescendo</span>
  return <span className="text-[10px] text-red-500 font-semibold">↓ caindo</span>
}

function MetaBadge({ total, meta }: { total: number | string; meta: number }) {
  if (!meta) return null
  const num = toNum(total)
  if (!num) return null
  if (num >= meta) return (
    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-300 px-1.5 py-px rounded-full font-bold whitespace-nowrap">✓ meta</span>
  )
  return (
    <span className="text-[10px] bg-red-50 text-red-600 border border-red-300 px-1.5 py-px rounded-full font-bold whitespace-nowrap">
      {Math.round((num / meta) * 100)}%
    </span>
  )
}

function barColor(pct: number) {
  if (pct >= 100) return 'bg-emerald-500'
  if (pct >= 50) return 'bg-amber-400'
  return 'bg-red-500'
}

function MetaBlock({ label, valor, meta, formatType }: { label: string; valor: number; meta: number; formatType: FormatType }) {
  const pct = Math.min((valor / meta) * 100, 100)
  const atingiu = valor >= meta
  const valorFmt = formatType === 'money' ? formatValue(valor, 'money') : valor.toLocaleString('pt-BR')
  const metaFmt  = formatType === 'money' ? formatValue(meta, 'money') : meta.toLocaleString('pt-BR')
  const falta = meta - valor
  const faltaFmt = formatType === 'money' ? `Falta ${formatValue(falta, 'money')}` : `Faltam ${falta.toLocaleString('pt-BR')}`
  return (
    <div className="px-5 py-4 flex-1">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-2xl font-bold text-gray-900">{valorFmt}</span>
        <span className="text-sm text-gray-400">/ {metaFmt}</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1.5">
        <div className={clsx('h-full rounded-full', barColor(pct))} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between">
        <span className={clsx('text-xs font-bold', pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500')}>
          {Math.round(pct)}%
        </span>
        {atingiu
          ? <span className="text-xs text-emerald-600 font-semibold">✓ Meta atingida!</span>
          : <span className="text-xs text-gray-400">{faltaFmt}</span>
        }
      </div>
    </div>
  )
}

function BannerMeta({ summary }: { summary: SummaryResponse }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
      <div className="px-5 py-3 bg-gray-900 flex items-center gap-3">
        <span className="text-base">🎯</span>
        <div>
          <p className="text-sm font-bold text-white">150 consultas → 50 contratos → R$ 1 milhão</p>
          <p className="text-xs text-gray-400 mt-0.5">Meta estratégica — {summary.periodo_label}</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        <MetaBlock label="Consultas" valor={summary.marketing.primeiras_consultas} meta={META_CONSULTAS} formatType="number" />
        <MetaBlock label="Contratos" valor={summary.vendas.total_contratos} meta={META_CONTRATOS} formatType="number" />
        <MetaBlock label="Faturamento" valor={summary.vendas.valor_total_fechado} meta={META_FATURAMENTO} formatType="money" />
      </div>
    </div>
  )
}

function LinhaMelhorSemana({ semanas, keys, colCount }: {
  semanas: (Semana | null)[]
  keys: NonNullable<MetricaConfig['setor']>['melhorSemanaKeys']
  colCount: number
}) {
  if (!keys?.length) return null
  const partes = keys.map(({ key, label, format }) => {
    let maxVal = 0, maxIdx = -1
    semanas.forEach((s, i) => {
      if (!s) return
      const v = toNum(getFromSemana(s, key))
      if (v > maxVal) { maxVal = v; maxIdx = i }
    })
    if (maxIdx < 0) return null
    return `Melhor em ${label}: ${maxIdx + 1}ª Sem (${formatValue(maxVal, format)})`
  }).filter(Boolean)
  if (!partes.length) return null
  return (
    <tr>
      <td colSpan={colCount} className="px-4 py-1 text-xs text-gray-400 italic bg-gray-900/5 border-t border-dashed border-gray-200">
        {partes.join(' · ')}
      </td>
    </tr>
  )
}

export default function TabelaMetricas({ summary, summaryMesAnterior }: Props) {
  const semanas = summary.semanas ?? []
  const semanasAnterior = summaryMesAnterior?.semanas ?? []
  const semanasExibidas = Array.from({ length: 4 }, (_, i) => semanas[i] ?? null)
  const TOTAL_COLS = 6

  const semanaAtualIdx = (() => {
    for (let i = semanasExibidas.length - 1; i >= 0; i--) {
      if (semanasExibidas[i] !== null) return i
    }
    return -1
  })()

  const mesAnt = summaryMesAnterior ? mesAbrev(summaryMesAnterior) : 'ant'

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
            className={clsx('px-4 py-1.5 border-l-4', currentSetorConfig.headerBg, currentSetorConfig.borderColor)}
          >
            <span className="text-xs font-black text-white tracking-widest uppercase">
              {currentSetorConfig.nome}
            </span>
            <span className="text-xs text-white/50 ml-2 font-normal tracking-normal normal-case">
              ({currentSetorConfig.responsavel})
            </span>
          </td>
        </tr>
      )
    }

    rows.push(
      <tr key={`row-${idx}`} className={clsx(
        'border-b border-gray-100 hover:bg-gray-50 transition-colors border-l-4',
        currentSetorConfig?.rowBorder ?? 'border-l-transparent'
      )}>
        {/* Label */}
        <td className="px-3 py-2 text-gray-600 text-xs whitespace-nowrap">
          {metrica.label}
        </td>

        {/* Semanas */}
        {semanasExibidas.map((semana, i) => {
          const semanaExiste = semana !== null
          const rawVal = semana ? getFromSemana(semana, metrica.key) : 0
          const numVal = toNum(rawVal)
          const isAtual = i === semanaAtualIdx
          const cellAtualBg = ['bg-violet-50 border-x border-violet-200','bg-blue-50 border-x border-blue-200','bg-cyan-50 border-x border-cyan-200','bg-emerald-50 border-x border-emerald-200'][i]

          // vs semana anterior no mesmo mês (i-1)
          const semAnteriorMes = i > 0 ? semanasExibidas[i - 1] : null
          const valAnteriorMes = semAnteriorMes ? toNum(getFromSemana(semAnteriorMes, metrica.key)) : 0

          // vs mesma semana mês anterior (sempre, incluindo semana 1)
          const semAntMesSemana = semanasAnterior[i] ?? null
          const valMesPassado = semAntMesSemana ? toNum(getFromSemana(semAntMesSemana, metrica.key)) : 0

          // Label do chip: "vs 2ª/set" etc — semana no mês anterior
          const semLabel = `vs ${i + 1}ª/${mesAnt}`
          const semAntLabel = `vs Sem ${i}` // "vs Sem 1", "vs Sem 2", etc.

          // Heatmap leve para semanas com dados
          const heatBg = (() => {
            if (!semanaExiste || metrica.special || numVal === 0 || maxSem === 0) return ''
            const pct = metrica.negativa ? 1 - numVal / maxSem : numVal / maxSem
            if (pct >= 0.85) return 'bg-emerald-50'
            return ''
          })()

          return (
            <td
              key={i}
              className={clsx(
                'px-2 py-2',
                isAtual ? cellAtualBg : heatBg
              )}
            >
              {/* Tudo em uma linha: número + chips */}
              <div className="flex items-center gap-1.5 flex-nowrap">
                {!semanaExiste ? (
                  <span className="text-gray-300 text-sm">—</span>
                ) : numVal === 0 ? (
                  <span className="text-gray-400 font-semibold text-sm">0</span>
                ) : (
                  <span className="font-bold text-sm tabular-nums whitespace-nowrap text-gray-900">
                    {metrica.special
                      ? (() => { const s = String(rawVal); return s.length > 20 ? s.slice(0,20)+'…' : s })()
                      : formatValue(numVal, metrica.format)
                    }
                  </span>
                )}
                {semanaExiste && !metrica.special && numVal > 0 && (
                  <>
                    {/* vs semana anterior mesmo mês (só Sem 2, 3, 4) */}
                    {i > 0 && (
                      <Chip
                        atual={numVal}
                        anterior={valAnteriorMes}
                        labelSem={semAntLabel}
                        positiveIsGood={!metrica.negativa}
                      />
                    )}
                    {/* vs mesma semana mês anterior (TODAS as semanas, incluindo Sem 1) */}
                    {summaryMesAnterior && valMesPassado > 0 && (
                      <Chip
                        atual={numVal}
                        anterior={valMesPassado}
                        labelSem={semLabel}
                        positiveIsGood={!metrica.negativa}
                      />
                    )}
                  </>
                )}
              </div>
            </td>
          )
        })}

        {/* Total */}
        <td className="px-3 py-2 text-right bg-gray-50 border-l-2 border-gray-200 w-36">
          <div className="inline-flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {(() => {
                const num = toNum(total)
                if (metrica.special) {
                  const s = typeof total === 'string' ? total : String(total)
                  return s && s !== '0'
                    ? <span className="text-xs text-gray-600">{s.length > 30 ? s.slice(0,30)+'…' : s}</span>
                    : <span className="text-gray-300">—</span>
                }
                if (!num) return <span className="text-gray-300">—</span>
                return <span className="font-bold text-gray-900 text-sm tabular-nums">{formatValue(num, metrica.format)}</span>
              })()}
              {metrica.metaKey && <MetaBadge total={total} meta={meta} />}
            </div>
            {!metrica.special && <TendenciaIndicador semanas={semanasExibidas} metricaKey={metrica.key} />}
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table header */}
        <div className="bg-gray-900">
          {/* Top bar */}
          <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-bold text-white text-sm tracking-wide">
              Métricas do Período — {summary.periodo_label}
            </h2>
            <span className="text-xs text-gray-400">{summary.semanas_com_dados} semanas com dados</span>
          </div>
          {/* Column headers */}
          <div className="grid text-xs font-bold uppercase tracking-wider"
               style={{ gridTemplateColumns: '200px repeat(4, 1fr) 144px' }}>
            <div className="px-3 py-2 text-gray-400">Métrica</div>
            {semanasExibidas.map((_, i) => {
              const isAtual = i === semanaAtualIdx
              // Cores que espelham as etapas do funil
              const colColors = [
                'bg-violet-700 text-violet-100',
                'bg-blue-700 text-blue-100',
                'bg-cyan-700 text-cyan-100',
                'bg-emerald-700 text-emerald-100',
              ]
              return (
                <div
                  key={i}
                  className={clsx(
                    'px-2 py-2',
                    colColors[i],
                    isAtual && 'ring-2 ring-inset ring-white/30'
                  )}
                >
                  {i + 1}ª Semana
                  {isAtual && <span className="block text-[9px] font-medium opacity-75 normal-case tracking-normal mt-0.5">semana atual</span>}
                </div>
              )
            })}
            <div className="px-3 py-2 text-right text-gray-300">Total Mês</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 760 }}>
            <colgroup>
              <col style={{ width: 200 }} />
              <col /><col /><col /><col />
              <col style={{ width: 144 }} />
            </colgroup>
            <tbody>{rows}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
