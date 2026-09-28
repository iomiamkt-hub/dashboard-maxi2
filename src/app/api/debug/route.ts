import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') ?? 'summary'
  const mes = searchParams.get('mes')

  const base = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL
  if (!base) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_APPS_SCRIPT_URL não configurada' }, { status: 500 })
  }

  const url = mes ? `${base}?format=${format}&mes=${mes}` : `${base}?format=${format}`

  try {
    const res = await fetch(url, { cache: 'no-store' })
    const text = await res.text()

    let json: unknown = null
    try { json = JSON.parse(text) } catch { /* not json */ }

    return NextResponse.json({
      status: res.status,
      ok: res.ok,
      url_chamada: url.replace(base, '[SCRIPT_URL]'),
      resposta: json ?? text.slice(0, 2000),
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
