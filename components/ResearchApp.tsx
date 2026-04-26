'use client'

import { useState, useEffect } from 'react'
import ResearchForm from './ResearchForm'
import ResultsTable from './ResultsTable'
import { PatternId, RESEARCH_PATTERNS } from '@/lib/research-patterns'
import { ExportFormat, exportToCSV, exportToExcel, exportToJSON } from '@/lib/export-utils'

const SHARE_EMAIL_KEY = 'research_app_share_email'

interface ResearchState {
  keyword: string
  patternId: PatternId
  rows: Record<string, string>[]
  isLoading: boolean
  isStreaming: boolean
  streamText: string
  error: string | null
}

interface SheetsState {
  loading: boolean
  result: { url: string; title: string } | null
  error: string | null
}

export default function ResearchApp() {
  const [state, setState] = useState<ResearchState>({
    keyword: '',
    patternId: 'seo',
    rows: [],
    isLoading: false,
    isStreaming: false,
    streamText: '',
    error: null,
  })
  const [sheets, setSheets] = useState<SheetsState>({ loading: false, result: null, error: null })
  const [shareEmail, setShareEmail] = useState('')
  const [emailSaved, setEmailSaved] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(SHARE_EMAIL_KEY)
    if (saved) setShareEmail(saved)
  }, [])

  const handleSaveEmail = () => {
    localStorage.setItem(SHARE_EMAIL_KEY, shareEmail)
    setEmailSaved(true)
    setTimeout(() => setEmailSaved(false), 2000)
  }

  const handleSubmit = async (keyword: string, patternId: PatternId, exportFormat: ExportFormat) => {
    setState((s) => ({ ...s, keyword, patternId, rows: [], isLoading: true, isStreaming: true, streamText: '', error: null }))
    setSheets({ loading: false, result: null, error: null })

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, patternId }),
      })

      if (!res.ok || !res.body) throw new Error('APIエラーが発生しました')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk
        setState((s) => ({ ...s, streamText: accumulated }))

        const partial = tryParsePartialJSON(accumulated)
        if (partial.length > 0) setState((s) => ({ ...s, rows: partial }))
      }

      const finalRows = parseJSON(accumulated)
      setState((s) => ({ ...s, rows: finalRows, isLoading: false, isStreaming: false }))

      const pattern = RESEARCH_PATTERNS[patternId]
      const filename = `${keyword}_${pattern.name}_${new Date().toISOString().slice(0, 10)}`
      if (exportFormat === 'csv') exportToCSV(finalRows, filename)
      else if (exportFormat === 'excel') exportToExcel(finalRows, filename)
      else if (exportFormat === 'json') exportToJSON(finalRows, filename)
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        isStreaming: false,
        error: err instanceof Error ? err.message : '予期しないエラーが発生しました',
      }))
    }
  }

  const handleLocalExport = (format: ExportFormat) => {
    if (state.rows.length === 0) return
    const pattern = RESEARCH_PATTERNS[state.patternId]
    const filename = `${state.keyword}_${pattern.name}_${new Date().toISOString().slice(0, 10)}`
    if (format === 'csv') exportToCSV(state.rows, filename)
    else if (format === 'excel') exportToExcel(state.rows, filename)
    else if (format === 'json') exportToJSON(state.rows, filename)
  }

  const handleSheetsExport = async () => {
    if (state.rows.length === 0) return
    setSheets({ loading: true, result: null, error: null })
    try {
      const res = await fetch('/api/export/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: state.keyword,
          patternId: state.patternId,
          rows: state.rows,
          shareEmail: shareEmail.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? '書き込みに失敗しました')
      setSheets({ loading: false, result: { url: data.url, title: data.title }, error: null })
      window.open(data.url, '_blank')
    } catch (err) {
      setSheets({ loading: false, result: null, error: err instanceof Error ? err.message : '不明なエラー' })
    }
  }

  const pattern = RESEARCH_PATTERNS[state.patternId]
  const hasResults = state.rows.length > 0 && !state.isLoading

  return (
    <div className="space-y-6">
      <ResearchForm onSubmit={handleSubmit} isLoading={state.isLoading} />

      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          {state.error}
        </div>
      )}

      {hasResults && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-2 items-center">
          <span className="text-sm font-semibold text-gray-600 mr-1">エクスポート:</span>

          {/* ローカルダウンロード */}
          {(['csv', 'excel', 'json'] as ExportFormat[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => handleLocalExport(fmt)}
              className="px-4 py-1.5 text-sm bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg font-medium transition"
            >
              {fmt === 'csv' ? 'CSV' : fmt === 'excel' ? 'Excel (.xlsx)' : 'JSON'}
            </button>
          ))}

          {/* Googleスプレッドシート出力エリア */}
          <div className="w-full border-t border-gray-100 pt-3 mt-1 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Googleスプレッドシート:</span>

            {/* メール入力 */}
            <div className="flex items-center gap-1.5 flex-1 min-w-48">
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => { setShareEmail(e.target.value); setEmailSaved(false) }}
                placeholder="共有するGmailアドレス（任意）"
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 placeholder-gray-400"
              />
              <button
                onClick={handleSaveEmail}
                disabled={!shareEmail.trim()}
                className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded-lg font-medium transition whitespace-nowrap"
              >
                {emailSaved ? '✓ 保存済' : '記憶する'}
              </button>
            </div>

            {/* 出力ボタン */}
            <button
              onClick={handleSheetsExport}
              disabled={sheets.loading}
              className="px-4 py-1.5 text-sm bg-green-50 hover:bg-green-100 disabled:opacity-60 text-green-700 rounded-lg font-medium transition flex items-center gap-1.5 whitespace-nowrap"
            >
              {sheets.loading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  シート作成中...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                  シートに出力
                </>
              )}
            </button>

            {sheets.result && (
              <a
                href={sheets.result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 text-sm bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-1 whitespace-nowrap"
              >
                ✓ シートを開く →
              </a>
            )}

            {sheets.error && (
              <p className="w-full text-xs text-red-500">{sheets.error}</p>
            )}
          </div>
        </div>
      )}

      <ResultsTable
        columns={pattern.columns}
        rows={state.rows}
        isStreaming={state.isStreaming}
        streamText={state.streamText}
      />
    </div>
  )
}

function parseJSON(text: string): Record<string, string>[] {
  const cleaned = text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '')
  try {
    const parsed = JSON.parse(cleaned)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function tryParsePartialJSON(text: string): Record<string, string>[] {
  const cleaned = text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '')
  if (!cleaned.startsWith('[')) return []

  const results: Record<string, string>[] = []
  let depth = 0
  let start = -1

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i]
    if (ch === '{') {
      if (depth === 0) start = i
      depth++
    } else if (ch === '}') {
      depth--
      if (depth === 0 && start !== -1) {
        try {
          results.push(JSON.parse(cleaned.slice(start, i + 1)))
        } catch { /* skip */ }
        start = -1
      }
    }
  }
  return results
}
