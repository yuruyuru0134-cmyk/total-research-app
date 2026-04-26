import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'
import { RESEARCH_PATTERNS, PatternId } from '@/lib/research-patterns'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { keyword, patternId } = await req.json()

  if (!keyword || !patternId) {
    return new Response(JSON.stringify({ error: 'keyword と patternId は必須です' }), { status: 400 })
  }

  const pattern = RESEARCH_PATTERNS[patternId as PatternId]
  if (!pattern) {
    return new Response(JSON.stringify({ error: '無効なパターンIDです' }), { status: 400 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 8000,
          stream: true,
          messages: [
            {
              role: 'user',
              content: pattern.buildPrompt(keyword),
            },
          ],
          system: 'あなたは優秀なリサーチャーです。必ず指定されたJSON形式のみを返してください。説明文やmarkdownのコードブロック（```json等）は絶対に含めないでください。',
        })

        for await (const event of response) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
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
