import { NextRequest, NextResponse } from 'next/server'
import { createAndWriteSheet } from '@/lib/google-sheets'
import { RESEARCH_PATTERNS, PatternId } from '@/lib/research-patterns'

export async function POST(req: NextRequest) {
  const { keyword, patternId, rows } = await req.json()

  if (!patternId || !rows || !keyword) {
    return NextResponse.json({ error: 'keyword, patternId, rows は必須です' }, { status: 400 })
  }

  const pattern = RESEARCH_PATTERNS[patternId as PatternId]
  if (!pattern) {
    return NextResponse.json({ error: '無効なパターンIDです' }, { status: 400 })
  }

  const date = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).replace(/\//g, '-')

  const title = `【リサーチ】${keyword}｜${pattern.name}｜${date}`

  try {
    const url = await createAndWriteSheet(title, pattern.columns, rows)
    return NextResponse.json({ success: true, url, title })
  } catch (err) {
    const message = err instanceof Error ? err.message : '不明なエラー'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
