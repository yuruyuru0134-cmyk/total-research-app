export type PatternId =
  | 'seo'
  | 'competitor'
  | 'content'
  | 'market'
  | 'sns'
  | 'persona'

export interface ResearchPattern {
  id: PatternId
  name: string
  description: string
  columns: string[]
  buildPrompt: (keyword: string) => string
}

export const RESEARCH_PATTERNS: Record<PatternId, ResearchPattern> = {
  seo: {
    id: 'seo',
    name: 'SEOキーワードリサーチ',
    description: 'キーワードの関連語・検索意図・コンテンツ案を分析',
    columns: ['メインキーワード', '関連キーワード', '検索意図', '月間検索ボリューム(推定)', '競合難易度(1-10)', 'コンテンツ案'],
    buildPrompt: (keyword) => `
あなたはSEO専門家です。「${keyword}」というキーワードについてSEOリサーチを行い、以下のJSON配列を返してください。
必ず20行以上のデータを生成してください。

返却形式（JSONのみ、説明文不要）:
[
  {
    "メインキーワード": "string",
    "関連キーワード": "string",
    "検索意図": "情報収集|比較検討|購買|ナビゲーション のいずれか",
    "月間検索ボリューム(推定)": "string (例: 1,000〜10,000)",
    "競合難易度(1-10)": "number",
    "コンテンツ案": "string"
  }
]`,
  },
  competitor: {
    id: 'competitor',
    name: '競合リサーチ',
    description: '競合他社の強み・弱み・差別化ポイントを分析',
    columns: ['競合名', 'カテゴリ', '強み', '弱み', '差別化ポイント', '対抗戦略'],
    buildPrompt: (keyword) => `
あなたは市場調査の専門家です。「${keyword}」に関連する競合リサーチを行い、以下のJSON配列を返してください。
実在する可能性のある企業・サービスを想定して15行以上のデータを生成してください。

返却形式（JSONのみ、説明文不要）:
[
  {
    "競合名": "string",
    "カテゴリ": "string (例: 大手・中堅・ニッチ等)",
    "強み": "string",
    "弱み": "string",
    "差別化ポイント": "string",
    "対抗戦略": "string"
  }
]`,
  },
  content: {
    id: 'content',
    name: 'コンテンツ企画',
    description: '記事構成・見出し・キーワードマッピングを展開',
    columns: ['タイトル案', 'H2見出し', 'H3見出し', 'ターゲットキーワード', '想定読者', '推定文字数'],
    buildPrompt: (keyword) => `
あなたはコンテンツマーケティングの専門家です。「${keyword}」をテーマにしたコンテンツ企画を行い、以下のJSON配列を返してください。
15記事以上の企画案を生成してください。

返却形式（JSONのみ、説明文不要）:
[
  {
    "タイトル案": "string",
    "H2見出し": "string (複数の場合は「/」で区切る)",
    "H3見出し": "string (複数の場合は「/」で区切る)",
    "ターゲットキーワード": "string",
    "想定読者": "string",
    "推定文字数": "string (例: 3,000〜5,000字)"
  }
]`,
  },
  market: {
    id: 'market',
    name: '市場・業界リサーチ',
    description: '市場規模・トレンド・主要プレイヤー・機会とリスクを分析',
    columns: ['分析軸', '詳細', '数値・規模', 'トレンド方向', 'ビジネス機会', 'リスク'],
    buildPrompt: (keyword) => `
あなたは業界アナリストです。「${keyword}」の市場・業界について包括的なリサーチを行い、以下のJSON配列を返してください。
20行以上のデータを生成してください。

返却形式（JSONのみ、説明文不要）:
[
  {
    "分析軸": "string (例: 市場規模, 成長率, 主要プレイヤー, 規制環境 等)",
    "詳細": "string",
    "数値・規模": "string",
    "トレンド方向": "成長|横ばい|縮小|変革期 のいずれか",
    "ビジネス機会": "string",
    "リスク": "string"
  }
]`,
  },
  sns: {
    id: 'sns',
    name: 'SNS・バズリサーチ',
    description: 'ハッシュタグ・投稿アイデア・プラットフォーム別戦略を分析',
    columns: ['プラットフォーム', 'ハッシュタグ', 'バズコンテンツ傾向', '投稿アイデア', '最適投稿時間帯', '期待エンゲージメント'],
    buildPrompt: (keyword) => `
あなたはSNSマーケティングの専門家です。「${keyword}」に関するSNS・バズリサーチを行い、以下のJSON配列を返してください。
X(Twitter)/Instagram/TikTok/YouTube/Facebookなど各プラットフォームを網羅して20行以上のデータを生成してください。

返却形式（JSONのみ、説明文不要）:
[
  {
    "プラットフォーム": "string",
    "ハッシュタグ": "string (複数の場合は「 」で区切る)",
    "バズコンテンツ傾向": "string",
    "投稿アイデア": "string",
    "最適投稿時間帯": "string",
    "期待エンゲージメント": "高|中|低 のいずれか"
  }
]`,
  },
  persona: {
    id: 'persona',
    name: 'ペルソナ分析',
    description: 'ターゲット顧客・ニーズ・購買心理・情報収集行動を分析',
    columns: ['ペルソナ名', '年齢層・性別', '職業・役職', '課題・悩み', 'ニーズ・欲求', '購買動機', '情報収集チャネル'],
    buildPrompt: (keyword) => `
あなたはマーケティング戦略家です。「${keyword}」に興味を持つターゲット顧客のペルソナ分析を行い、以下のJSON配列を返してください。
多様なペルソナを15人以上生成してください。

返却形式（JSONのみ、説明文不要）:
[
  {
    "ペルソナ名": "string (仮名)",
    "年齢層・性別": "string",
    "職業・役職": "string",
    "課題・悩み": "string",
    "ニーズ・欲求": "string",
    "購買動機": "string",
    "情報収集チャネル": "string"
  }
]`,
  },
}

export const PATTERN_LIST = Object.values(RESEARCH_PATTERNS)
