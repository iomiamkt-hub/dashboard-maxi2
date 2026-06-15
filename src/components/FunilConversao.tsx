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
  cor: {
    bg: string
    header: string
    text: string
    bar: string
    border: string
  }
  icone: React.ReactNode
  meta: number
}

interface ConexaoConfig {
  taxa: number
  benchmark: number
  label: string
}

const CORES = {
  violet: {
    bg: 'bg-violet-50',
    header: 'bg-violet-500',
    text: 'text-violet-700',
    bar: 'bg-violet-500',
    border: 'border-violet-200',
  },
  blue: {
    bg: 'bg-blue-50',
    header: 'bg-blue-500',
    text: 'text-blue-700',
    bar: 'bg-blue-500',
    border: 'border-blue-200',
  },
  cyan: {
    bg: 'bg-cyan-50',
    header: 'bg-cyan-500',
    text: 'text-cyan-700',
    bar: 'bg-cyan-500',
    border: 'border-cyan-200',
  },
  amber: {
    bg: 'bg-amber-50',
    header: 'bg-amber-500',
    text: 'text-amber-700',
    bar: 'bg-amber-500',
    border: 'border-amber-200',
  },
  emerald: {
    bg: 'bg-emerald-50',
    header: 'bg-emerald-500',
    text: 'text-emerald-700',
    bar: 'bg-emerald-500',
    border: 'border-emerald-200',
  },
  green: {
    bg: 'bg-green-50',
    header: 'bg-green-600',
    text: 'text-green-700',
    bar: 'bg-green-600',
    border: 'border-green-200',
  },
}

function ProgressBar({
  valor,
  meta,
  metaFormatada,
  corBar,
}: {
  valor: number
  meta: number
  metaFormatada: string
  corBar: string
}) {
  if (!meta || meta === 0) return null
  const pct = Math.min((valor / meta) * 100, 100)
  const atingiu = valor >= meta

  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1">
        <span className={clsx('text-xs', atingiu ? 'text-emerald-600 font-medium' : 'text-gray-400')}>
          Meta: {metaFormatada}
        </span>
        <span className={clsx('text-xs font-semibold', atingiu ? 'text-emerald-600' : 'text-gray-500')}>
          {Math.round(pct)}%
        </span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all', corBar)}
          style={{ width: `${pct}%` }}
        />
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
        etapa.cor.bg,
        etapa.cor.border
      )}
    >
      {/* Header colorido */}
      <div className={clsx('px-3 py-2 flex items-center gap-2', etapa.cor.header)}>
        <span className="text-white opacity-90">{etapa.icone}</span>
        <span className="text-white text-xs font-semibold uppercase tracking-wide">
          Etapa {etapa.numero}
        </span>
      </div>

      {/* Corpo */}
      <div className="px-3 py-3">
        <p className="text-xs text-gray-500 mb-1 font-medium">{etapa.nome}</p>
        <p className={clsx('text-2xl font-bold', etapa.cor.text)}>
          {etapa.valor === 0 ? '—' : valorFormatado}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{periodoLabel}</p>

        {meta > 0 && (
          <ProgressBar
            valor={etapa.valor}
            meta={meta}
            metaFormatada={metaFormatada}
            corBar={etapa.cor.bar}
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
          <span className="text-xs text-emerald-600 font-medium whitespace-nowrap">Quase todos</span>
          <span className="text-xs text-emerald-600 font-medium whitespace-nowrap">evoluem →</span>
        </div>
        <div className="lg:hidden flex flex-col items-center gap-1">
          <span className="text-gray-300 text-lg">↓</span>
          <span className="text-xs text-emerald-600 font-medium">Quase todos evoluem</span>
        </div>
      </div>
    )
  }

  if (conexao.taxa < 0) {
    return (
      <div className="flex flex-col items-center justify-center px-1 lg:py-0 py-1 flex-shrink-0">
        <div className="hidden lg:flex flex-col items-center gap-1">
          <span className="text-gray-300 text-lg">→</span>
          <span className="text-xs text-gray-300">—</span>
        </div>
        <div className="lg:hidden flex flex-col items-center gap-1">
          <span className="text-gray-300 text-lg">↓</span>
          <span className="text-xs text-gray-300">—</span>
        </div>
      </div>
    )
  }

  const ok = conexao.taxa >= conexao.benchmark
  return (
    <div className="flex flex-col items-center justify-center px-1 flex-shrink-0">
      {/* Desktop: seta horizontal */}
      <div className="hidden lg:flex flex-col items-center gap-1">
        <div
          className={clsx(
            'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold',
            ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          )}
        >
          {ok ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {conexao.label === 'ticket' ? (
            <span>{conexao.taxa.toFixed(0)}x</span>
          ) : (
            <span>{conexao.taxa.toFixed(1)}%</span>
          )}
        </div>
        <span className="text-gray-300 text-lg">→</span>
      </div>

      {/* Mobile: seta vertical */}
      <div className="lg:hidden flex flex-col items-center gap-1">
        <span className="text-gray-300 text-lg">↓</span>
        <div
          className={clsx(
            'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold',
            ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
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
  cor,
  icone,
}: {
  titulo: string
  consultas: number
  contratos: number
  taxa: number
  cor: { bg: string; text: string; border: string; header: string }
  icone: React.ReactNode
}) {
  return (
    <div className={clsx('rounded-xl border p-4 flex-1', cor.bg, cor.border)}>
      <div className="flex items-center gap-2 mb-3">
        <span className={cor.text}>{icone}</span>
        <span className="font-semibold text-gray-700 text-sm">{titulo}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-gray-400">Consultas</p>
          <p className="text-lg font-bold text-gray-800">{consultas.toLocaleString('pt-BR')}</p>
        </div>
        <div className="text-center px-3">
          <p className="text-xs text-gray-400 mb-0.5">Taxa</p>
          <p className={clsx('text-2xl font-bold', cor.text)}>
            {consultas > 0 ? `${taxa.toFixed(1)}%` : '—'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Contratos</p>
          <p className="text-lg font-bold text-gray-800">{contratos.toLocaleString('pt-BR')}</p>
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
      cor: CORES.violet,
      icone: <MousePointer className="w-4 h-4" />,
      meta: metas['clicaram_no_anuncio'] ?? 0,
    },
    {
      numero: 2,
      nome: 'Conversas Iniciadas',
      valor: m.conversas_iniciadas,
      cor: CORES.blue,
      icone: <MessageCircle className="w-4 h-4" />,
      meta: metas['conversas_iniciadas'] ?? 0,
    },
    {
      numero: 3,
      nome: 'Primeiras Consultas',
      valor: m.primeiras_consultas,
      cor: CORES.cyan,
      icone: <Calendar className="w-4 h-4" />,
      meta: META_CONSULTAS,
    },
    {
      numero: 4,
      nome: 'Orçamentos',
      valor: v.numero_orcamentos,
      cor: CORES.amber,
      icone: <FileText className="w-4 h-4" />,
      meta: 0,
    },
    {
      numero: 5,
      nome: 'Contratos Fechados',
      valor: v.total_contratos,
      cor: CORES.emerald,
      icone: <CheckCircle className="w-4 h-4" />,
      meta: META_CONTRATOS,
    },
    {
      numero: 6,
      nome: 'Valor Fechado',
      valor: v.valor_total_fechado,
      isMonetario: true,
      cor: CORES.green,
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
    {
      taxa: 0,
      benchmark: 0,
      label: 'fixo',
    },
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
    m.clicaram_no_anuncio > 0
      ? (v.total_contratos / m.clicaram_no_anuncio) * 100
      : 0

  const taxaPresencial =
    m.consultas_presenciais > 0
      ? (v.contratos_presencial / m.consultas_presenciais) * 100
      : 0

  const taxaOnline =
    m.consultas_online > 0
      ? (v.contratos_online / m.consultas_online) * 100
      : 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      <h2 className="font-semibold text-gray-800">Funil de Conversão — {summary.periodo_label}</h2>

      {/* Funil principal */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-start gap-0">
        {etapas.map((etapa, idx) => (
          <div key={etapa.numero} className="flex flex-col lg:flex-row items-center flex-1 min-w-0">
            <EtapaCard
              etapa={etapa}
              periodoLabel={summary.periodo_label}
              meta={etapa.meta}
            />
            {idx < etapas.length - 1 && (
              <ConexaoBadge conexao={conexoes[idx]} />
            )}
          </div>
        ))}
      </div>

      {/* Cards de modalidade */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Conversão por Modalidade</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <ModalidadeCard
            titulo="Consultas Presenciais"
            consultas={m.consultas_presenciais}
            contratos={v.contratos_presencial}
            taxa={taxaPresencial}
            cor={{
              bg: 'bg-indigo-50',
              text: 'text-indigo-600',
              border: 'border-indigo-200',
              header: 'bg-indigo-500',
            }}
            icone={<UserCheck className="w-5 h-5" />}
          />
          <ModalidadeCard
            titulo="Consultas Online"
            consultas={m.consultas_online}
            contratos={v.contratos_online}
            taxa={taxaOnline}
            cor={{
              bg: 'bg-sky-50',
              text: 'text-sky-600',
              border: 'border-sky-200',
              header: 'bg-sky-500',
            }}
            icone={<Monitor className="w-5 h-5" />}
          />
          <div className="rounded-xl border bg-purple-50 border-purple-200 p-4 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-gray-700 text-sm">Taxa Geral</span>
            </div>
            <p className="text-xs text-gray-400 mb-1">Clique → Contrato</p>
            <p className="text-3xl font-bold text-purple-700">
              {m.clicaram_no_anuncio > 0 ? `${taxaGeral.toFixed(2)}%` : '—'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {v.total_contratos.toLocaleString('pt-BR')} contratos /{' '}
              {m.clicaram_no_anuncio.toLocaleString('pt-BR')} cliques
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
