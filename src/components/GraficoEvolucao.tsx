'use client'

import { useEffect, useState } from 'react'
import type { MesDisponivel, SummaryResponse } from '@/types'
import { fetchSummary } from '@/lib/api'
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface Props {
  meses: MesDisponivel[]
}

interface DadoMes {
  mes: string
  contratos: number
  faturamento: number
}

function formatarEixoFaturamento(v: number): string {
  if (v >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `R$${(v / 1_000).toFixed(0)}k`
  return `R$${v}`
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ color: string; name: string; value: number; dataKey: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-800 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="text-xs">
          {p.dataKey === 'faturamento'
            ? `${p.name}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(p.value)}`
            : `${p.name}: ${p.value?.toLocaleString('pt-BR')}`
          }
        </p>
      ))}
    </div>
  )
}

export default function GraficoEvolucao({ meses }: Props) {
  const [dados, setDados] = useState<DadoMes[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const results = await Promise.allSettled(meses.map((m) => fetchSummary(m.aba)))
        const mapped: DadoMes[] = results.map((r, i) => {
          if (r.status === 'rejected') {
            return { mes: meses[i].mes_nome, contratos: 0, faturamento: 0 }
          }
          const s: SummaryResponse = r.value
          return {
            mes: meses[i].mes_nome,
            contratos: s.vendas.total_contratos,
            faturamento: s.vendas.valor_total_fechado,
          }
        })
        setDados(mapped)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [meses])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-800 mb-4">Evolução Mensal</h2>
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12 }}
              allowDecimals={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11 }}
              tickFormatter={formatarEixoFaturamento}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="contratos"
              name="Contratos"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="faturamento"
              name="Faturamento"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
