import { headers } from 'next/headers'
import { fetchSummary, fetchMeses } from '@/lib/api'
import Dashboard from '@/components/Dashboard'

export default async function Home() {
  // Força renderização dinâmica (request-time) para sempre buscar dados frescos
  await headers()
  if (!process.env.NEXT_PUBLIC_APPS_SCRIPT_URL) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <p className="text-gray-600 text-center">
          Configure a variável{' '}
          <code className="bg-gray-100 px-2 py-1 rounded">NEXT_PUBLIC_APPS_SCRIPT_URL</code>{' '}
          no arquivo{' '}
          <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code>
        </p>
      </div>
    )
  }

  let mesesData, summary
  try {
    ;[mesesData, summary] = await Promise.all([fetchMeses(), fetchSummary()])
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="text-center space-y-2">
          <div className="text-4xl">⚠️</div>
          <p className="font-semibold text-gray-800">Erro ao carregar dados</p>
          <p className="text-sm text-gray-500">{msg}</p>
        </div>
      </div>
    )
  }

  return (
    <Dashboard summary={summary} meses={mesesData.meses} mesAtual={mesesData.mes_atual} />
  )
}
