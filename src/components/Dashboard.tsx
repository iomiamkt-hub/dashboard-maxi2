'use client'

import { useState } from 'react'
import type { SummaryResponse, MesDisponivel } from '@/types'
import { fetchSummary } from '@/lib/api'
import { formatDate } from '@/lib/format'
import TabelaMetricas from './TabelaMetricas'
import TaxasConversao from './TaxasConversao'
import GraficoEvolucao from './GraficoEvolucao'

interface Props {
  summary: SummaryResponse
  meses: MesDisponivel[]
  mesAtual: string
}

export default function Dashboard({ summary, meses, mesAtual }: Props) {
  const [mesSelecionado, setMesSelecionado] = useState(mesAtual)
  const [summaryAtual, setSummaryAtual] = useState(summary)
  const [loading, setLoading] = useState(false)

  async function handleMesChange(aba: string) {
    if (aba === mesSelecionado) return
    setMesSelecionado(aba)
    setLoading(true)
    try {
      const data = await fetchSummary(aba)
      setSummaryAtual(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg leading-tight">Maxiplástica</h1>
              <p className="text-xs text-gray-500">Dashboard de Métricas</p>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            Atualizado em: {formatDate(summaryAtual.generated_at)}
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">
        {/* Seletor de mês */}
        <div className="flex flex-wrap gap-2">
          {meses.map((m) => (
            <button
              key={m.aba}
              onClick={() => handleMesChange(m.aba)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                m.aba === mesSelecionado
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {m.periodo_label}
            </button>
          ))}
        </div>

        {/* Spinner de carregamento */}
        {loading && (
          <div className="flex justify-center py-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Tabela de métricas */}
        <div className={`transition-opacity ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
          <TabelaMetricas summary={summaryAtual} />
        </div>

        {/* Taxas de conversão */}
        <TaxasConversao summary={summaryAtual} />

        {/* Gráfico de evolução */}
        <GraficoEvolucao meses={meses} />
      </div>
    </div>
  )
}
