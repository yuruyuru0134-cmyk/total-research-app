'use client'

import { useState } from 'react'
import { PATTERN_LIST, PatternId } from '@/lib/research-patterns'
import { EXPORT_FORMATS, ExportFormat } from '@/lib/export-utils'

interface Props {
  onSubmit: (keyword: string, patternId: PatternId, exportFormat: ExportFormat) => void
  isLoading: boolean
}

export default function ResearchForm({ onSubmit, isLoading }: Props) {
  const [keyword, setKeyword] = useState('')
  const [patternId, setPatternId] = useState<PatternId>('seo')
  const [exportFormat, setExportFormat] = useState<ExportFormat>('table')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyword.trim()) return
    onSubmit(keyword.trim(), patternId, exportFormat)
  }

  const selectedPattern = PATTERN_LIST.find((p) => p.id === patternId)

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
      {/* キーワード入力 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          リサーチキーワード
        </label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="例: ダイエット, AI活用, マーケティング自動化..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition"
          disabled={isLoading}
        />
      </div>

      {/* パターン選択 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          リサーチパターン
        </label>
        <select
          value={patternId}
          onChange={(e) => setPatternId(e.target.value as PatternId)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 transition"
          disabled={isLoading}
        >
          {PATTERN_LIST.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {selectedPattern && (
          <p className="mt-1.5 text-xs text-gray-500">{selectedPattern.description}</p>
        )}
      </div>

      {/* 出力形式選択 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          出力形式
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {EXPORT_FORMATS.map((fmt) => (
            <button
              key={fmt.id}
              type="button"
              onClick={() => setExportFormat(fmt.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                exportFormat === fmt.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
              disabled={isLoading}
            >
              {fmt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 実行ボタン */}
      <button
        type="submit"
        disabled={isLoading || !keyword.trim()}
        className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition shadow-sm"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            リサーチ中...
          </span>
        ) : (
          'リサーチ開始'
        )}
      </button>
    </form>
  )
}
