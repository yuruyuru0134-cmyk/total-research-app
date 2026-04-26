import { google } from 'googleapis'

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!email || !key) {
    throw new Error('Google認証情報が未設定です。.env.local に GOOGLE_SERVICE_ACCOUNT_EMAIL と GOOGLE_PRIVATE_KEY を設定してください。')
  }
  if (email.includes('your-service-account') || key.includes('...\n---')) {
    throw new Error('Google認証情報がまだプレースホルダーのままです。Google Cloud ConsoleでサービスアカウントのJSONキーを取得して .env.local に設定してください。')
  }

  return new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key: key },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  })
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
