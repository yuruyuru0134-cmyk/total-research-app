import { google } from 'googleapis'

function getAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Google認証情報が未設定です。.env.local に GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN を設定してください。'
    )
  }
  if (clientId.includes('your-client') || refreshToken.includes('your-refresh')) {
    throw new Error(
      'Google認証情報がまだプレースホルダーのままです。セットアップ手順を完了してください。'
    )
  }

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost')
  oAuth2Client.setCredentials({ refresh_token: refreshToken })
  return oAuth2Client
}

export async function createAndWriteSheet(
  title: string,
  columns: string[],
  rows: Record<string, string>[],
  shareEmail?: string
): Promise<string> {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const drive = google.drive({ version: 'v3', auth })

  // 新しいスプレッドシートを作成
  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title },
      sheets: [{ properties: { title: 'リサーチ結果' } }],
    },
  })

  const spreadsheetId = spreadsheet.data.spreadsheetId!
  const sheetId = spreadsheet.data.sheets![0].properties!.sheetId!

  // データ書き込み
  const values = [
    columns,
    ...rows.map((row) => columns.map((col) => String(row[col] ?? ''))),
  ]

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'リサーチ結果!A1',
    valueInputOption: 'RAW',
    requestBody: { values },
  })

  // ヘッダー装飾・列幅自動調整・先頭行固定
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.27, green: 0.35, blue: 0.78 },
                textFormat: {
                  bold: true,
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                  fontSize: 10,
                },
                horizontalAlignment: 'CENTER',
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
          },
        },
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId,
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: columns.length,
            },
          },
        },
        {
          updateSheetProperties: {
            properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
            fields: 'gridProperties.frozenRowCount',
          },
        },
      ],
    },
  })

  // 共有設定（shareEmail が指定された場合）
  if (shareEmail) {
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: {
        type: 'user',
        role: 'writer',
        emailAddress: shareEmail,
      },
      sendNotificationEmail: false,
    })
  }

  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
}
