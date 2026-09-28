import type { SummaryResponse, MesesResponse } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL!

export async function fetchSummary(mes?: string): Promise<SummaryResponse> {
  const url = mes
    ? `${BASE_URL}?format=summary&mes=${mes}`
    : `${BASE_URL}?format=summary`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Apps Script retornou status ${res.status}.`)
  return res.json()
}

export async function fetchMeses(): Promise<MesesResponse> {
  const res = await fetch(`${BASE_URL}?format=meses`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Apps Script retornou status ${res.status}.`)
  return res.json()
}
