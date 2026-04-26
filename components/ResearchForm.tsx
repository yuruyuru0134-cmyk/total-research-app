'use client'

import { useState } from 'react'
import { PATTERN_LIST, PatternId } from '@/lib/research-patterns'
import { EXPORT_FORMATS, ExportFormat } from '@/lib/export-utils'
import Tooltip from './Tooltip'

const FORMAT_DESCRIPTIONS: Record<ExportFormat, string> = {
  table: 'ブラウザ上でそのまま確認。結果表示後にCSV・Excel・JSONへの追加エクスポートも可能',
  csv: 'ExcelやGoogleスプレッドシートで開けるCSV形式。文字化け防止のBOM付き',
  excel: 'Microsoft Excel形式（.xlsx）。列幅自動調整・ヘッダー装飾済みで書き出し',
  json: 'プログラムやシステム連携に適したJSON形式でダウンロード',
}

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
        <div className="flex items-center gap-1.5 mb-1.5">
          <label className="text-sm font-semibold text-gray-700">リサーチパターン</label>
          {selectedPattern && (
            <Tooltip content={selectedPattern.description}>
              <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] flex items-center justify-center cursor-default select-none hover:bg-indigo-100 hover:text-indigo-600 transition">
                ?
              </span>
            </Tooltip>
          )}
        </div>
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
      </div>

      {/* 出力形式選択 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">出力形式</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {EXPORT_FORMATS.map((fmt) => (
            <Tooltip key={fmt.id} content={FORMAT_DESCRIPTIONS[fmt.id]}>
              <button
                type="button"
                onClick={() => setExportFormat(fmt.id)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium border transition ${
                  exportFormat === fmt.id
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
                disabled={isLoading}
              >
                {fmt.label}
              </button>
            </Tooltip>
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
