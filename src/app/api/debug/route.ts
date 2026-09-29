import { NextResponse } from 'next/server'
import { fetchSummary } from '@/lib/api'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') ?? 'summary'
  const mes = searchParams.get('mes') ?? undefined

  const base = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL
  if (!base) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_APPS_SCRIPT_URL não configurada' }, { status: 500 })
  }

  // Modo 'transformed': mostra o SummaryResponse após o adaptador
  if (format === 'transformed') {
    try {
      const summary = await fetchSummary(mes)
      return NextResponse.json({
        modo: 'transformed',
        mes_param: mes ?? '(padrão)',
        marketing: summary.marketing,
        vendas: summary.vendas,
        operacional: summary.operacional,
        metas: summary.metas,
        periodo_label: summary.periodo_label,
        generated_at: summary.generated_at,
        semanas_com_dados: summary.semanas_com_dados,
        semanas_resumo: summary.semanas.map((s) => ({
          semana: s.semana,
          label: s.label,
          clicaram: s.metricas.clicaram_no_anuncio,
          contratos: s.metricas.total_contratos,
          valor_fechado: s.metricas.valor_total_fechado,
        })),
      })
    } catch (err: unknown) {
      return NextResponse.json({ error: String(err) }, { status: 500 })
    }
  }

  // Modo 'raw': mostra a resposta bruta do Apps Script para diagnóstico do setor MARKETING
  if (format === 'raw') {
    const mesParam = mes ?? 'SET2026'
    const url = `${base}?mes=${mesParam}`
    try {
      const res = await fetch(url, { cache: 'no-store' })
      const json = await res.json() as Record<string, unknown>
      // Extrai só o setor MARKETING para não poluir a resposta
      const mesAtual = json.mesAtual as Record<string, unknown> | undefined
      const setores = mesAtual?.setores as Record<string, unknown> | undefined
      const mk = setores?.['MARKETING (JOICE)'] as Record<string, unknown> | undefined
      return NextResponse.json({
        mes_param: mesParam,
        tem_mesAtual: !!mesAtual,
        chaves_setores: setores ? Object.keys(setores) : [],
        marketing_raw: mk ?? null,
        clicaram_raw: (mk?.['CLICARAM NO ANÚNCIO'] as unknown) ?? null,
      })
    } catch (err: unknown) {
      return NextResponse.json({ error: String(err) }, { status: 500 })
    }
  }

  // Modo padrão: retorna a resposta bruta do Apps Script
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
