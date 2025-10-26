export function exportCSV<T extends Record<string, unknown>>(items: T[], columns?: string[]) {
  if (!items || items.length === 0) return ''
  const cols = columns || Object.keys(items[0])
  const header = cols.join(',')
  const rows = items
    .map(it =>
      cols
        .map(c => {
          const v = it[c]
          if (v === undefined || v === null) return ''
          return `"${String(v).replace(/"/g, '""')}"`
        })
        .join(','),
    )
    .join('\n')
  return header + '\n' + rows
}

export function downloadCSV(text: string, filename = 'export.csv') {
  const blob = new Blob([text], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function parseCSV(text: string): Array<Record<string,string>> {
  // very small CSV parser for simple imports (no quotes handling)
  const lines = text.trim().split(/\r?\n/)
  const header = lines.shift()!.split(',').map(s=>s.trim())
  return lines.map(line => {
    const cols = line.split(',')
    const obj: Record<string,string> = {}
    for (let i=0;i<header.length;i++) obj[header[i]] = cols[i]?.trim() ?? ''
    return obj
  })
}
