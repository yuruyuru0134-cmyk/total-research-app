import ResearchApp from '@/components/ResearchApp'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            トータルリサーチ
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            キーワードを入力してリサーチパターンを選択し、AIが構造化データを生成します
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
            {['SEOキーワード', '競合リサーチ', 'コンテンツ企画', '市場・業界', 'SNS・バズ', 'ペルソナ分析'].map((label) => (
              <span key={label} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full font-medium">
                {label}
              </span>
            ))}
          </div>
        </div>
        <ResearchApp />
      </div>
    </main>
  )
}
