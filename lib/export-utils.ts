import * as XLSX from 'xlsx'

export type ExportFormat = 'table' | 'csv' | 'excel' | 'json'

export const EXPORT_FORMATS: { id: ExportFormat; label: string }[] = [
  { id: 'table', label: 'テーブル表示' },
  { id: 'csv', label: 'CSVダウンロード' },
  { id: 'excel', label: 'Excelダウンロード (.xlsx)' },
  { id: 'json', label: 'JSONダウンロード' },
]

export function exportToCSV(data: Record<string, string>[], filename: string) {
  if (data.length === 0) return
  const headers = Object.keys(data[0])
  const rows = data.map((row) => headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`))
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const bom = '﻿'
  downloadBlob(bom + csv, `${filename}.csv`, 'text/csv;charset=utf-8')
}

export function exportToExcel(data: Record<string, string>[], filename: string) {
  if (data.length === 0) return
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'リサーチ結果')
  const colWidths = Object.keys(data[0]).map((key) => ({
    wch: Math.max(key.length * 2, ...data.map((r) => String(r[key] ?? '').length)) + 2,
  }))
  ws['!cols'] = colWidths
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function exportToJSON(data: Record<string, string>[], filename: string) {
  if (data.length === 0) return
  const json = JSON.stringify(data, null, 2)
  downloadBlob(json, `${filename}.json`, 'application/json')
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
