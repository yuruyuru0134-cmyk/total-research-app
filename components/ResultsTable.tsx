'use client'

import Tooltip from './Tooltip'

interface Props {
  columns: string[]
  columnDescriptions: Record<string, string>
  rows: Record<string, string>[]
  isStreaming: boolean
  streamText: string
}

export default function ResultsTable({ columns, columnDescriptions, rows, isStreaming, streamText }: Props) {
  if (isStreaming && rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
          </div>
          <span className="text-sm text-gray-500">AIがリサーチを実行中...</span>
        </div>
        <pre className="text-xs text-gray-400 bg-gray-50 rounded-xl p-4 max-h-48 overflow-auto font-mono whitespace-pre-wrap">
          {streamText.slice(-800) || '応答を待っています...'}
        </pre>
      </div>
    )
  }

  if (rows.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <span className="font-semibold text-gray-700">{rows.length} 件の結果</span>
        {isStreaming && (
          <span className="text-xs text-indigo-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            読み込み中
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>{col}</span>
                    {columnDescriptions[col] && (
                      <Tooltip content={columnDescriptions[col]} position="bottom">
                        <span className="w-3.5 h-3.5 rounded-full bg-gray-300 text-gray-500 text-[9px] flex items-center justify-center cursor-default select-none hover:bg-indigo-200 hover:text-indigo-700 transition flex-shrink-0">
                          ?
                        </span>
                      </Tooltip>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                {columns.map((col) => (
                  <td key={col} className="px-4 py-3 text-gray-700 align-top max-w-xs">
                    <div className="whitespace-pre-wrap break-words">{row[col] ?? '—'}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
