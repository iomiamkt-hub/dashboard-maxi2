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
  setor?: {
    nome: string
    responsavel: string
    borderColor: string
  }
}

const META_CONSULTAS = 150
const META_CONTRATOS = 50
const META_FATURAMENTO = 1_000_000

const METRICAS: MetricaConfig[] = [
  // MARKETING
  {
    setor: { nome: 'MARKETING', responsavel: 'Joice', borderColor: 'border-blue-500' },
    label: 'Cliques no anúncio',
    key: 'clicaram_no_anuncio',
    format: 'number',
    metaKey: 'clicaram_no_anuncio',
  },
  { label: 'Conversas iniciadas', key: 'conversas_iniciadas', format: 'number', metaKey: 'conversas_iniciadas' },
  { label: 'Primeiras consultas', key: 'primeiras_consultas', format: 'number', metaKey: 'primeiras_consultas' },
  { label: 'Cons. presenciais', key: 'consultas_presenciais', format: 'number', metaKey: 'consultas_presenciais' },
  { label: 'Cons. online', key: 'consultas_online', format: 'number', metaKey: 'consultas_online' },
  { label: 'Ticket médio cons.', key: 'ticket_medio_consultas', format: 'money', metaKey: 'ticket_medio_consultas' },
  // VENDAS
  {
    setor: { nome: 'VENDAS', responsavel: 'Patricia', borderColor: 'border-emerald-500' },
    label: 'Orçamentos',
    key: 'numero_orcamentos',
    format: 'number',
    metaKey: 'numero_orcamentos',
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
    label: 'Pgto. à vista',
    key: 'pagamento_avista',
    format: 'number',
  },
  { label: 'Pgto. até 6x', key: 'pagamento_ate6x', format: 'number' },
  { label: 'Pgto. acima 6x', key: 'pagamento_acima6x', format: 'number' },
  { label: 'Reserva técnica', key: 'reserva_tecnica', format: 'money' },
  { label: 'Contratos pré-venda', key: 'contratos_prevenda', format: 'number' },
  { label: 'Inadimplência', key: 'inadimplencia', format: 'number' },
  { label: 'Adimplência', key: 'adimplencia', format: 'number' },
  { label: 'Margem bruta', key: 'margem_bruta', format: 'money' },
  { label: 'Recebíveis 6 meses', key: 'recebiveis_6meses', format: 'money' },
  { label: 'Despesas fixas', key: 'despesas_fixas', format: 'money' },
  // OPERACIONAL
  {
    setor: { nome: 'OPERACIONAL', responsavel: 'Leticia', borderColor: 'border-purple-500' },
    label: 'Jornada paciente',
    key: 'jornada_paciente',
    format: 'number',
    metaKey: 'jornada_paciente',
  },
  { label: 'Satisfação (NPS)', key: 'satisfacao_nps', format: 'number', metaKey: 'satisfacao_nps' },
  { label: 'Avaliação Google', key: 'avaliacao_google', format: 'number', metaKey: 'avaliacao_google' },
]

// Fundo alternado por índice de semana (0-based)
const SEM_BG = ['', 'bg-slate-50', '', 'bg-slate-50'] as const
const SEM_BG_HEADER = ['bg-gray-50', 'bg-slate-100', 'bg-gray-50', 'bg-slate-100'] as const

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
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (value === '' || value === null || value === undefined || isNaN(num) || num === 0) {
    return <span className="text-gray-300">—</span>
  }
  return <span>{formatValue(num, format)}</span>
}

function MetaBadge({ total, meta }: { total: number | string; meta: number }) {
  if (!meta || meta === 0) return null
  const num = typeof total === 'string' ? parseFloat(total) : total
  if (isNaN(num) || num === 0) return null
  if (num >= meta) {
    return (
      <span className="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
        ✓ meta
      </span>
    )
  }
  const pct = Math.round((num / meta) * 100)
  return (
    <span className="ml-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
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
        <div
          className={clsx('h-full rounded-full transition-all', barColor(pct))}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className={clsx('text-xs font-semibold', pctColor(pct))}>
          {Math.round(pct)}%
        </span>
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
        <span className="text-sm font-semibold text-gray-700">
          🎯 Meta do mês — {summary.periodo_label}
        </span>
      </div>
      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        <MetaBlock
          label="Consultas"
          valor={summary.marketing.primeiras_consultas}
          meta={META_CONSULTAS}
          formatType="number"
        />
        <MetaBlock
          label="Contratos"
          valor={summary.vendas.total_contratos}
          meta={META_CONTRATOS}
          formatType="number"
        />
        <MetaBlock
          label="Faturamento"
          valor={summary.vendas.valor_total_fechado}
          meta={META_FATURAMENTO}
          formatType="money"
        />
      </div>
    </div>
  )
}

export default function TabelaMetricas({ summary }: Props) {
  const semanas = summary.semanas ?? []
  const semanasExibidas = Array.from({ length: 4 }, (_, i) => semanas[i] ?? null)

  let currentSetorConfig: MetricaConfig['setor'] | null = null

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
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-36 bg-gray-50">
                  Setor
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  Métrica
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-24 bg-gray-50">
                  Meta
                </th>
                {semanasExibidas.map((_, i) => (
                  <th
                    key={i}
                    className={clsx(
                      'text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24',
                      SEM_BG_HEADER[i]
                    )}
                  >
                    {i + 1}ª Sem
                  </th>
                ))}
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider w-36 bg-gray-100 border-l-2 border-gray-200">
                  Total Mês
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {METRICAS.map((metrica, idx) => {
                const isFirstOfSetor = !!metrica.setor
                if (isFirstOfSetor) currentSetorConfig = metrica.setor!

                const total = getFromSummary(summary, metrica.key)
                const meta = metrica.metaKey ? (summary.metas[metrica.metaKey] ?? 0) : 0

                return (
                  <tr key={idx} className="hover:brightness-[0.97] transition-all">
                    {/* Setor cell */}
                    <td
                      className={clsx(
                        'px-4 py-3 align-top border-l-4 bg-gray-50',
                        isFirstOfSetor && currentSetorConfig
                          ? currentSetorConfig.borderColor
                          : 'border-transparent'
                      )}
                    >
                      {isFirstOfSetor && currentSetorConfig && (
                        <div>
                          <div className="font-semibold text-gray-800 text-xs">
                            {currentSetorConfig.nome}
                          </div>
                          <div className="text-gray-400 text-xs">
                            ({currentSetorConfig.responsavel})
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Métrica label */}
                    <td className="px-4 py-3 text-gray-700">{metrica.label}</td>

                    {/* Meta */}
                    <td className="px-4 py-3 text-right">
                      {meta && meta > 0 ? (
                        <span className="text-gray-400">{formatValue(meta, metrica.format)}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* Semanas com alternância de fundo */}
                    {semanasExibidas.map((semana, i) => (
                      <td
                        key={i}
                        className={clsx('px-4 py-3 text-right text-gray-600', SEM_BG[i])}
                      >
                        {semana ? (
                          renderCell(
                            getFromSemana(semana, metrica.key),
                            metrica.format,
                            metrica.special
                          )
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    ))}

                    {/* Total */}
                    <td className="px-4 py-3 text-right bg-gray-50 font-semibold text-gray-800 border-l-2 border-gray-200">
                      <span className="inline-flex items-center gap-1 flex-wrap justify-end">
                        {renderCell(total, metrica.format, metrica.special)}
                        {metrica.metaKey && <MetaBadge total={total} meta={meta} />}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
