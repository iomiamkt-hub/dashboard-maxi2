import { fetchSummary, fetchMeses } from '@/lib/api'
import Dashboard from '@/components/Dashboard'

export default async function Home() {
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

  const [mesesData, summary] = await Promise.all([fetchMeses(), fetchSummary()])

  return (
    <Dashboard summary={summary} meses={mesesData.meses} mesAtual={mesesData.mes_atual} />
  )
}
