import type { SummaryResponse, MesesResponse } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL!

export async function fetchSummary(mes?: string): Promise<SummaryResponse> {
  const url = mes
    ? `${BASE_URL}?format=summary&mes=${mes}`
    : `${BASE_URL}?format=summary`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error('Erro ao buscar dados')
  return res.json()
}

export async function fetchMeses(): Promise<MesesResponse> {
  const res = await fetch(`${BASE_URL}?format=meses`, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error('Erro ao buscar meses')
  return res.json()
}
