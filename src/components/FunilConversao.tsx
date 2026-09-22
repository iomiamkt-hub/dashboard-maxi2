'use client'

import type { SummaryResponse } from '@/types'
import { formatValue } from '@/lib/format'
import {
  MousePointer,
  MessageCircle,
  Calendar,
  FileText,
  CheckCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Monitor,
} from 'lucide-react'
import { clsx } from 'clsx'

interface FunilConversaoProps {
  summary: SummaryResponse
}

const META_CONSULTAS = 150
const META_CONTRATOS = 50
const META_FATURAMENTO = 1_000_000

interface Etapa {
  numero: number
  nome: string
  valor: number
  isMonetario?: boolean
  accent: string       // text color
  accentBg: string     // subtle bg tint
  accentBorder: string // border color
  accentBar: string    // progress bar color
  headerBg: string     // header strip bg
  icone: React.ReactNode
  meta: number
}

interface ConexaoConfig {
  taxa: number
  benchmark: number
  label: string
}

function ProgressBar({
  valor,
  meta,
  metaFormatada,
  accentBar,
}: {
  valor: number
  meta: number
  metaFormatada: string
  accentBar: string
}) {
  if (!meta || meta === 0) return null
  const pct = Math.min((valor / meta) * 100, 100)
  const atingiu = valor >= meta

  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1">
        <span className={clsx('text-xs', atingiu ? 'text-emerald-400 font-medium' : 'text-gray-500')}>
          Meta: {metaFormatada}
        </span>
        <span className={clsx('text-xs font-bold', atingiu ? 'text-emerald-400' : 'text-gray-400')}>
          {Math.round(pct)}%
        </span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all', accentBar)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function EtapaCard({
  etapa,
  periodoLabel,
  meta,
}: {
  etapa: Etapa
  periodoLabel: string
  meta: number
}) {
  const valorFormatado = etapa.isMonetario
    ? formatValue(etapa.valor, 'money')
    : etapa.valor.toLocaleString('pt-BR')

  const metaFormatada = etapa.isMonetario
    ? formatValue(meta, 'money')
    : meta.toLocaleString('pt-BR')

  return (
    <div
      className={clsx(
        'rounded-xl border overflow-hidden flex-1 min-w-[140px]',
        etapa.accentBg,
        etapa.accentBorder
      )}
    >
      {/* Header strip */}
      <div className={clsx('px-3 py-2 flex items-center gap-2', etapa.headerBg)}>
        <span className={clsx('opacity-90', etapa.accent)}>{etapa.icone}</span>
        <span className="text-white text-xs font-bold uppercase tracking-widest">
          Etapa {etapa.numero}
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-3">
        <p className="text-xs text-gray-400 mb-1 font-medium">{etapa.nome}</p>
        <p className={clsx('text-2xl font-bold', etapa.accent)}>
          {etapa.valor === 0 ? '—' : valorFormatado}
        </p>
        <p className="text-xs text-gray-600 mt-0.5">{periodoLabel}</p>

        {meta > 0 && (
          <ProgressBar
            valor={etapa.valor}
            meta={meta}
            metaFormatada={metaFormatada}
            accentBar={etapa.accentBar}
          />
        )}
      </div>
    </div>
  )
}

function ConexaoBadge({ conexao }: { conexao: ConexaoConfig }) {
  if (conexao.label === 'fixo') {
    return (
      <div className="flex flex-col items-center justify-center px-1 flex-shrink-0">
        <div className="hidden lg:flex flex-col items-center gap-1">
          <span className="text-xs text-emerald-400 font-medium whitespace-nowrap">Quase todos</span>
          <span className="text-xs text-emerald-400 font-medium whitespace-nowrap">evoluem →</span>
        </div>
        <div className="lg:hidden flex flex-col items-center gap-1">
          <span className="text-gray-600 text-lg">↓</span>
          <span className="text-xs text-emerald-400 font-medium">Quase todos evoluem</span>
        </div>
      </div>
    )
  }

  if (conexao.taxa < 0) {
    return (
      <div className="flex flex-col items-center justify-center px-1 lg:py-0 py-1 flex-shrink-0">
        <div className="hidden lg:flex flex-col items-center gap-1">
          <span className="text-gray-600 text-lg">→</span>
          <span className="text-xs text-gray-600">—</span>
        </div>
        <div className="lg:hidden flex flex-col items-center gap-1">
          <span className="text-gray-600 text-lg">↓</span>
          <span className="text-xs text-gray-600">—</span>
        </div>
      </div>
    )
  }

  const ok = conexao.taxa >= conexao.benchmark
  return (
    <div className="flex flex-col items-center justify-center px-1 flex-shrink-0">
      {/* Desktop */}
      <div className="hidden lg:flex flex-col items-center gap-1">
        <div
          className={clsx(
            'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border',
            ok
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
          )}
        >
          {ok ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {conexao.label === 'ticket' ? (
            <span>{conexao.taxa.toFixed(0)}x</span>
          ) : (
            <span>{conexao.taxa.toFixed(1)}%</span>
          )}
        </div>
        <span className="text-gray-600 text-lg">→</span>
      </div>

      {/* Mobile */}
      <div className="lg:hidden flex flex-col items-center gap-1">
        <span className="text-gray-600 text-lg">↓</span>
        <div
          className={clsx(
            'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border',
            ok
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
          )}
        >
          {ok ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {conexao.label === 'ticket' ? (
            <span>{conexao.taxa.toFixed(0)}x</span>
          ) : (
            <span>{conexao.taxa.toFixed(1)}%</span>
          )}
        </div>
      </div>
    </div>
  )
}

function ModalidadeCard({
  titulo,
  consultas,
  contratos,
  taxa,
  accent,
  accentBg,
  accentBorder,
  icone,
}: {
  titulo: string
  consultas: number
  contratos: number
  taxa: number
  accent: string
  accentBg: string
  accentBorder: string
  icone: React.ReactNode
}) {
  return (
    <div className={clsx('rounded-xl border p-4 flex-1', accentBg, accentBorder)}>
      <div className="flex items-center gap-2 mb-3">
        <span className={accent}>{icone}</span>
        <span className="font-semibold text-gray-200 text-sm">{titulo}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-gray-500">Consultas</p>
          <p className="text-lg font-bold text-white">{consultas.toLocaleString('pt-BR')}</p>
        </div>
        <div className="text-center px-3">
          <p className="text-xs text-gray-500 mb-0.5">Taxa</p>
          <p className={clsx('text-2xl font-bold', accent)}>
            {consultas > 0 ? `${taxa.toFixed(1)}%` : '—'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Contratos</p>
          <p className="text-lg font-bold text-white">{contratos.toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </div>
  )
}

export default function FunilConversao({ summary }: FunilConversaoProps) {
  const m = summary.marketing
  const v = summary.vendas
  const metas = summary.metas

  const etapas: Etapa[] = [
    {
      numero: 1,
      nome: 'Cliques no Anúncio',
      valor: m.clicaram_no_anuncio,
      accent: 'text-violet-300',
      accentBg: 'bg-violet-950/40',
      accentBorder: 'border-violet-700/50',
      accentBar: 'bg-violet-500',
      headerBg: 'bg-violet-900/70',
      icone: <MousePointer className="w-4 h-4" />,
      meta: metas['clicaram_no_anuncio'] ?? 0,
    },
    {
      numero: 2,
      nome: 'Conversas Iniciadas',
      valor: m.conversas_iniciadas,
      accent: 'text-blue-300',
      accentBg: 'bg-blue-950/40',
      accentBorder: 'border-blue-700/50',
      accentBar: 'bg-blue-500',
      headerBg: 'bg-blue-900/70',
      icone: <MessageCircle className="w-4 h-4" />,
      meta: metas['conversas_iniciadas'] ?? 0,
    },
    {
      numero: 3,
      nome: 'Primeiras Consultas',
      valor: m.primeiras_consultas,
      accent: 'text-cyan-300',
      accentBg: 'bg-cyan-950/40',
      accentBorder: 'border-cyan-700/50',
      accentBar: 'bg-cyan-500',
      headerBg: 'bg-cyan-900/70',
      icone: <Calendar className="w-4 h-4" />,
      meta: META_CONSULTAS,
    },
    {
      numero: 4,
      nome: 'Orçamentos',
      valor: v.numero_orcamentos,
      accent: 'text-amber-300',
      accentBg: 'bg-amber-950/40',
      accentBorder: 'border-amber-700/50',
      accentBar: 'bg-amber-500',
      headerBg: 'bg-amber-900/70',
      icone: <FileText className="w-4 h-4" />,
      meta: META_CONSULTAS,
    },
    {
      numero: 5,
      nome: 'Contratos Fechados',
      valor: v.total_contratos,
      accent: 'text-emerald-300',
      accentBg: 'bg-emerald-950/40',
      accentBorder: 'border-emerald-700/50',
      accentBar: 'bg-emerald-500',
      headerBg: 'bg-emerald-900/70',
      icone: <CheckCircle className="w-4 h-4" />,
      meta: META_CONTRATOS,
    },
    {
      numero: 6,
      nome: 'Valor Fechado',
      valor: v.valor_total_fechado,
      isMonetario: true,
      accent: 'text-green-300',
      accentBg: 'bg-green-950/40',
      accentBorder: 'border-green-700/50',
      accentBar: 'bg-green-500',
      headerBg: 'bg-green-900/70',
      icone: <DollarSign className="w-4 h-4" />,
      meta: META_FATURAMENTO,
    },
  ]

  const conexoes: ConexaoConfig[] = [
    {
      taxa: m.clicaram_no_anuncio > 0 ? (m.conversas_iniciadas / m.clicaram_no_anuncio) * 100 : -1,
      benchmark: 15,
      label: 'taxa',
    },
    {
      taxa: m.conversas_iniciadas > 0 ? (m.primeiras_consultas / m.conversas_iniciadas) * 100 : -1,
      benchmark: 8,
      label: 'taxa',
    },
    { taxa: 0, benchmark: 0, label: 'fixo' },
    {
      taxa: v.numero_orcamentos > 0 ? (v.total_contratos / v.numero_orcamentos) * 100 : -1,
      benchmark: 25,
      label: 'taxa',
    },
    {
      taxa: v.total_contratos > 0 ? v.valor_total_fechado / v.total_contratos / 1000 : -1,
      benchmark: 0,
      label: 'ticket',
    },
  ]

  const taxaGeral =
    m.primeiras_consultas > 0 ? (v.total_contratos / m.primeiras_consultas) * 100 : 0

  const taxaPresencial =
    m.consultas_presenciais > 0 ? (v.contratos_presencial / m.consultas_presenciais) * 100 : 0

  const taxaOnline =
    m.consultas_online > 0 ? (v.contratos_online / m.consultas_online) * 100 : 0

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 space-y-6">
      <h2 className="font-bold text-white text-sm tracking-wide uppercase">
        Funil de Conversão — {summary.periodo_label}
      </h2>

      {/* Funil principal */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-start gap-0">
        {etapas.map((etapa, idx) => (
          <div key={etapa.numero} className="flex flex-col lg:flex-row items-center flex-1 min-w-0">
            <EtapaCard etapa={etapa} periodoLabel={summary.periodo_label} meta={etapa.meta} />
            {idx < etapas.length - 1 && <ConexaoBadge conexao={conexoes[idx]} />}
          </div>
        ))}
      </div>

      {/* Cards de modalidade */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
          Conversão por Modalidade
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <ModalidadeCard
            titulo="Consultas Presenciais"
            consultas={m.consultas_presenciais}
            contratos={v.contratos_presencial}
            taxa={taxaPresencial}
            accent="text-indigo-300"
            accentBg="bg-indigo-950/40"
            accentBorder="border-indigo-700/50"
            icone={<UserCheck className="w-5 h-5" />}
          />
          <ModalidadeCard
            titulo="Consultas Online"
            consultas={m.consultas_online}
            contratos={v.contratos_online}
            taxa={taxaOnline}
            accent="text-sky-300"
            accentBg="bg-sky-950/40"
            accentBorder="border-sky-700/50"
            icone={<Monitor className="w-5 h-5" />}
          />
          <div className="rounded-xl border bg-purple-950/40 border-purple-700/50 p-4 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-purple-300" />
              <span className="font-semibold text-gray-200 text-sm">Taxa Geral</span>
            </div>
            <p className="text-xs text-gray-500 mb-1">Consulta → Contrato</p>
            <p className="text-3xl font-bold text-purple-300">
              {m.primeiras_consultas > 0 ? `${taxaGeral.toFixed(1)}%` : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {v.total_contratos.toLocaleString('pt-BR')} contratos /{' '}
              {m.primeiras_consultas.toLocaleString('pt-BR')} primeiras consultas
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
