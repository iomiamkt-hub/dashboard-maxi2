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
    rowAccent: string
    melhorSemanaKeys?: Array<{ key: string; label: string; format: FormatType }>
  }
}

const META_CONSULTAS = 150
const META_CONTRATOS = 50
const META_FATURAMENTO = 1_000_000

// Metallic week column colors — cohesive indigo→blue→sky→teal family
const SEM_COLORS = [
  { bg: '#4f46e5', light: '#eef2ff', border: '#c7d2fe' }, // indigo
  { bg: '#2563eb', light: '#eff6ff', border: '#bfdbfe' }, // blue
  { bg: '#0284c7', light: '#f0f9ff', border: '#bae6fd' }, // sky
  { bg: '#0891b2', light: '#ecfeff', border: '#a5f3fc' }, // cyan
]

const METRICAS: MetricaConfig[] = [
  {
    setor: {
      nome: 'MARKETING', responsavel: 'Joice',
      headerBg: '#1e3a8a', rowAccent: '#3b82f6',
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
      headerBg: '#14532d', rowAccent: '#22c55e',
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
    setor: { nome: 'FINANCEIRO', responsavel: 'Paula', headerBg: '#78350f', rowAccent: '#f59e0b' },
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
    setor: { nome: 'OPERACIONAL', responsavel: 'Leticia', headerBg: '#3b0764', rowAccent: '#a855f7' },
    label: 'Jornada paciente', key: 'jornada_paciente', format: 'number', metaKey: 'jornada_paciente', negativa: true,
  },
  { label: 'Satisfação (NPS)', key: 'satisfacao_nps', format: 'number', metaKey: 'satisfacao_nps' },
  { label: 'Avaliação Google', key: 'avaliacao_google', format: 'number', metaKey: 'avaliacao_google' },
]

function buildSetorBlocos() {
  const blocos: Array<{ inicio: number; fim: number; config: MetricaConfig['setor'] }> = []
  let inicio = 0; let config: MetricaConfig['setor'] | undefined
  METRICAS.forEach((m, i) => {
    if (m.setor) { if (config) blocos.push({ inicio, fim: i - 1, config }); inicio = i; config = m.setor }
  })
  if (config) blocos.push({ inicio, fim: METRICAS.length - 1, config })
  return blocos
}
const SETOR_BLOCOS = buildSetorBlocos()

function getFromSummary(summary: SummaryResponse, key: string): number | string {
  const all: Record<string, number | string> = { ...summary.marketing, ...summary.vendas, ...summary.financeiro, ...summary.operacional }
  return all[key] ?? 0
}
function getFromSemana(semana: Semana, key: string): number | string {
  return (semana.metricas as unknown as Record<string, number | string>)[key] ?? 0
}
function toNum(v: number | string): number {
  const n = typeof v === 'string' ? parseFloat(v) : v; return isNaN(n) ? 0 : n
}

function mesAbrev(summary: SummaryResponse): string {
  const meses: Record<string, string> = {
    janeiro:'jan',fevereiro:'fev',março:'mar',abril:'abr',maio:'mai',junho:'jun',
    julho:'jul',agosto:'ago',setembro:'set',outubro:'out',novembro:'nov',dezembro:'dez',
  }
  const lower = (summary.periodo_label ?? '').toLowerCase()
  for (const [nome, abrev] of Object.entries(meses)) { if (lower.startsWith(nome)) return abrev }
  return 'ant'
}

function Chip({ atual, anterior, label, positiveIsGood = true }: {
  atual: number; anterior: number; label: string; positiveIsGood?: boolean
}) {
  if (anterior === 0 || atual === 0) return null
  const diff = ((atual - anterior) / anterior) * 100
  if (Math.abs(diff) < 0.5) return null
  const up = diff > 0; const good = positiveIsGood ? up : !up
  return (
    <span className={clsx(
      'inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-px rounded border whitespace-nowrap flex-shrink-0',
      good ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-red-50 text-red-600 border-red-300'
    )}>
      {up ? '▲' : '▼'}{Math.abs(diff).toFixed(0)}%<span className="font-normal opacity-60">{label}</span>
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
  if (!meta) return null; const num = toNum(total); if (!num) return null
  if (num >= meta) return <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-300 px-1.5 py-px rounded-full font-bold whitespace-nowrap">✓ meta</span>
  return <span className="text-[10px] bg-red-50 text-red-600 border border-red-300 px-1.5 py-px rounded-full font-bold whitespace-nowrap">{Math.round((num/meta)*100)}%</span>
}

function MetaBlock({ label, valor, meta, formatType }: { label: string; valor: number; meta: number; formatType: FormatType }) {
  const pct = Math.min((valor / meta) * 100, 100); const atingiu = valor >= meta
  const valorFmt = formatType === 'money' ? formatValue(valor, 'money') : valor.toLocaleString('pt-BR')
  const metaFmt  = formatType === 'money' ? formatValue(meta, 'money')  : meta.toLocaleString('pt-BR')
  const falta = meta - valor
  const faltaFmt = formatType === 'money' ? `Falta ${formatValue(falta, 'money')}` : `Faltam ${falta.toLocaleString('pt-BR')}`
  const barCls = pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-500'
  const pctCls = pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500'
  return (
    <div className="px-5 py-4 flex-1">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-2xl font-bold text-gray-900">{valorFmt}</span>
        <span className="text-sm text-gray-400">/ {metaFmt}</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1.5">
        <div className={clsx('h-full rounded-full', barCls)} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between">
        <span className={clsx('text-xs font-bold', pctCls)}>{Math.round(pct)}%</span>
        {atingiu ? <span className="text-xs text-emerald-600 font-semibold">✓ Meta atingida!</span>
                 : <span className="text-xs text-gray-400">{faltaFmt}</span>}
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
  semanas: (Semana | null)[]; keys: NonNullable<MetricaConfig['setor']>['melhorSemanaKeys']; colCount: number
}) {
  if (!keys?.length) return null
  const partes = keys.map(({ key, label, format }) => {
    let maxVal = 0, maxIdx = -1
    semanas.forEach((s, i) => { if (!s) return; const v = toNum(getFromSemana(s, key)); if (v > maxVal) { maxVal = v; maxIdx = i } })
    if (maxIdx < 0) return null
    return `Melhor em ${label}: ${maxIdx + 1}ª Sem (${formatValue(maxVal, format)})`
  }).filter(Boolean)
  if (!partes.length) return null
  return (
    <tr>
      <td colSpan={colCount} className="px-4 py-1 text-xs text-gray-400 italic bg-gray-50 border-t border-dashed border-gray-200">
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
    for (let i = semanasExibidas.length - 1; i >= 0; i--) { if (semanasExibidas[i] !== null) return i }
    return -1
  })()

  const mesAnt = summaryMesAnterior ? mesAbrev(summaryMesAnterior) : 'ant'

  // Última semana disponível do mês anterior (para comparar com a 1ª semana do mês atual)
  const ultimaSemAnt = [...semanasAnterior].reverse().find(s => s != null) ?? null

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

    if (isFirstOfSetor && currentSetorConfig) {
      rows.push(
        <tr key={`setor-${idx}`}>
          <td
            colSpan={TOTAL_COLS}
            style={{ backgroundColor: currentSetorConfig.headerBg, borderLeft: `4px solid ${currentSetorConfig.rowAccent}` }}
            className="px-4 py-1.5"
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
      <tr key={`row-${idx}`}
        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
        style={{ borderLeft: `4px solid ${currentSetorConfig?.rowAccent ?? 'transparent'}` }}
      >
        <td className="px-3 py-2 text-gray-600 text-xs whitespace-nowrap">{metrica.label}</td>

        {semanasExibidas.map((semana, i) => {
          const semanaExiste = semana !== null
          const rawVal = semana ? getFromSemana(semana, metrica.key) : 0
          const numVal = toNum(rawVal)
          const isAtual = i === semanaAtualIdx
          const col = SEM_COLORS[i]

          // Semana anterior no mesmo mês (i-1) — só para Sem 2, 3, 4
          const semAnteriorMes = i > 0 ? semanasExibidas[i - 1] : null
          const valAnteriorMes = semAnteriorMes ? toNum(getFromSemana(semAnteriorMes, metrica.key)) : 0

          // Para Sem 1: compara com a ÚLTIMA semana do mês anterior
          const valUltimaSemAnt = ultimaSemAnt && i === 0
            ? toNum(getFromSemana(ultimaSemAnt, metrica.key))
            : 0

          // Mesma semana do mês anterior (todas as semanas)
          const semMesPassado = semanasAnterior[i] ?? null
          const valMesPassado = semMesPassado ? toNum(getFromSemana(semMesPassado, metrica.key)) : 0

          // Rótulos
          const nUltimaSem = semanasAnterior.filter(s => s != null).length
          const labelUltimaSem = `vs ${nUltimaSem}ª/${mesAnt}`
          const labelMesPassado = `vs ${i + 1}ª/${mesAnt}`
          const labelSemAnt = `vs Sem ${i}`

          // Leve heatmap no fundo
          const heatBg = (() => {
            if (!semanaExiste || metrica.special || numVal === 0 || maxSem === 0) return 'transparent'
            const pct = metrica.negativa ? 1 - numVal / maxSem : numVal / maxSem
            if (pct >= 0.85) return '#ecfdf5'
            return 'transparent'
          })()

          const cellBg = isAtual ? col.light : heatBg
          const cellBorder = isAtual ? `1px solid ${col.border}` : undefined

          return (
            <td key={i} style={{ backgroundColor: cellBg, borderLeft: cellBorder, borderRight: cellBorder }}
              className="px-2 py-2">
              <div className="flex items-center gap-1 flex-wrap">
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
                    {/* Sem 1: vs última semana do mês anterior */}
                    {i === 0 && ultimaSemAnt && (
                      <Chip atual={numVal} anterior={valUltimaSemAnt} label={labelUltimaSem} positiveIsGood={!metrica.negativa} />
                    )}
                    {/* Sem 2+: vs semana anterior do mesmo mês */}
                    {i > 0 && (
                      <Chip atual={numVal} anterior={valAnteriorMes} label={labelSemAnt} positiveIsGood={!metrica.negativa} />
                    )}
                    {/* Todas: vs mesma semana do mês anterior */}
                    {summaryMesAnterior && valMesPassado > 0 && (
                      <Chip atual={numVal} anterior={valMesPassado} label={labelMesPassado} positiveIsGood={!metrica.negativa} />
                    )}
                  </>
                )}
              </div>
            </td>
          )
        })}

        <td className="px-3 py-2 text-right bg-gray-50 border-l-2 border-gray-200 w-36">
          <div className="inline-flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {(() => {
                const num = toNum(total)
                if (metrica.special) {
                  const s = typeof total === 'string' ? total : String(total)
                  return s && s !== '0' ? <span className="text-xs text-gray-600">{s.length > 30 ? s.slice(0,30)+'…' : s}</span>
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
        <LinhaMelhorSemana key={`best-${idx}`} semanas={semanasExibidas} keys={bloco.config.melhorSemanaKeys} colCount={TOTAL_COLS} />
      )
    }
  })

  return (
    <div className="space-y-0">
      <BannerMeta summary={summary} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 780 }}>
            <colgroup>
              <col style={{ width: 190 }} />
              <col /><col /><col /><col />
              <col style={{ width: 144 }} />
            </colgroup>
            <thead>
              {/* Top bar */}
              <tr style={{ backgroundColor: '#0f172a' }}>
                <th colSpan={TOTAL_COLS} className="px-5 py-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm tracking-wide">
                      Métricas do Período — {summary.periodo_label}
                    </span>
                    <span className="text-xs text-gray-400">{summary.semanas_com_dados} semanas com dados</span>
                  </div>
                </th>
              </tr>
              {/* Column headers */}
              <tr>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                  Métrica
                </th>
                {semanasExibidas.map((_, i) => {
                  const col = SEM_COLORS[i]
                  const isAtual = i === semanaAtualIdx
                  return (
                    <th
                      key={i}
                      className="px-2 py-2 text-left text-xs font-bold uppercase tracking-wider border-b"
                      style={{
                        backgroundColor: col.bg,
                        color: '#ffffff',
                        borderBottom: `3px solid ${isAtual ? '#ffffff' : col.bg}`,
                        boxShadow: isAtual ? `inset 0 -3px 0 rgba(255,255,255,0.5)` : undefined,
                      }}
                    >
                      {i + 1}ª Semana
                      {isAtual && <span className="block text-[9px] font-medium opacity-75 normal-case tracking-normal mt-0.5">semana atual</span>}
                    </th>
                  )
                })}
                <th className="px-3 py-2 text-right text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200 border-l-2">
                  Total Mês
                </th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
