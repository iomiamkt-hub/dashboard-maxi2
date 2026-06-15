'use client'

import type { SummaryResponse } from '@/types'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import { clsx } from 'clsx'

interface Props {
  summary: SummaryResponse
}

interface Taxa {
  label: string
  de: string
  para: string
  valor: number
  benchmark: number
}

function calcTaxas(summary: SummaryResponse): Taxa[] {
  const m = summary.marketing
  const v = summary.vendas

  return [
    {
      label: 'Cliques → Conversas',
      de: 'Cliques no anúncio',
      para: 'Conversas iniciadas',
      valor: m.clicaram_no_anuncio ? (m.conversas_iniciadas / m.clicaram_no_anuncio) * 100 : 0,
      benchmark: 15,
    },
    {
      label: 'Conversas → Consultas',
      de: 'Conversas iniciadas',
      para: 'Primeiras consultas',
      valor: m.conversas_iniciadas ? (m.primeiras_consultas / m.conversas_iniciadas) * 100 : 0,
      benchmark: 8,
    },
    {
      label: 'Consultas → Orçamentos',
      de: 'Primeiras consultas',
      para: 'Orçamentos',
      valor: m.primeiras_consultas ? (v.numero_orcamentos / m.primeiras_consultas) * 100 : 0,
      benchmark: 70,
    },
    {
      label: 'Orçamentos → Contratos',
      de: 'Orçamentos',
      para: 'Total contratos',
      valor: v.numero_orcamentos ? (v.total_contratos / v.numero_orcamentos) * 100 : 0,
      benchmark: 25,
    },
    {
      label: 'Consultas → Contratos',
      de: 'Primeiras consultas',
      para: 'Total contratos',
      valor: m.primeiras_consultas ? (v.total_contratos / m.primeiras_consultas) * 100 : 0,
      benchmark: 33,
    },
  ]
}

export default function TaxasConversao({ summary }: Props) {
  const taxas = calcTaxas(summary)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-800 mb-4">Taxas de Conversão por Etapa</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {taxas.map((taxa) => {
          const ok = taxa.valor >= taxa.benchmark
          return (
            <div
              key={taxa.label}
              className={clsx(
                'rounded-xl p-4 border',
                ok ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
              )}
            >
              <p className="text-xs text-gray-500 mb-2 leading-tight">
                {taxa.de} → {taxa.para}
              </p>
              <div className="flex items-center gap-2">
                {ok ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                )}
                <span
                  className={clsx(
                    'text-2xl font-bold',
                    ok ? 'text-green-700' : 'text-amber-700'
                  )}
                >
                  {taxa.valor.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Benchmark: ≥ {taxa.benchmark}%</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
