/**
 * Google OAuthリフレッシュトークン取得スクリプト（初回のみ実行）
 * 実行: node scripts/get-google-token.mjs
 */
import { google } from 'googleapis'
import readline from 'readline'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\n❌ .env.local に GOOGLE_CLIENT_ID と GOOGLE_CLIENT_SECRET を先に設定してください\n')
  process.exit(1)
}

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'http://localhost'
)

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ],
})

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('  Google OAuth トークン取得ツール')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('\n① 以下のURLをブラウザで開いてください:\n')
console.log(authUrl)
console.log('\n② Googleアカウントでログインして「許可」をクリック')
console.log('\n③ リダイレクト先のURL（http://localhost/?code=...）から')
console.log('   code= の後ろの文字列をコピーして貼り付けてください\n')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
rl.question('コードを貼り付け → Enter: ', async (code) => {
  rl.close()
  try {
    const { tokens } = await oAuth2Client.getToken(decodeURIComponent(code.trim()))
    if (!tokens.refresh_token) {
      console.error('\n❌ リフレッシュトークンが取得できませんでした。')
      console.error('   もう一度スクリプトを実行してください（prompt=consent により再取得されます）\n')
      return
    }
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ 成功！以下を .env.local に追加してください:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`)
  } catch (err) {
    console.error('\n❌ エラー:', err.message)
    console.error('コードが正しくコピーされているか確認してください\n')
  }
})
