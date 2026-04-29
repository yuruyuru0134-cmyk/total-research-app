import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest } from 'next/server'
import { RESEARCH_PATTERNS, PatternId } from '@/lib/research-patterns'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY ?? '')

export async function POST(req: NextRequest) {
  if (!process.env.GOOGLE_AI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'GOOGLE_AI_API_KEY が設定されていません。.env.local またはVercel環境変数を確認してください。' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { keyword, patternId } = await req.json()

  if (!keyword || !patternId) {
    return new Response(JSON.stringify({ error: 'keyword と patternId は必須です' }), { status: 400 })
  }

  const pattern = RESEARCH_PATTERNS[patternId as PatternId]
  if (!pattern) {
    return new Response(JSON.stringify({ error: '無効なパターンIDです' }), { status: 400 })
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction:
      'あなたは優秀なリサーチャーです。必ず指定されたJSON形式のみを返してください。説明文やmarkdownのコードブロック（```json等）は絶対に含めないでください。',
  })

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await model.generateContentStream(pattern.buildPrompt(keyword))
        for await (const chunk of result.stream) {
          const text = chunk.text()
          if (text) controller.enqueue(encoder.encode(text))
        }
        controller.close()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        controller.enqueue(encoder.encode(JSON.stringify({ error: msg })))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}
