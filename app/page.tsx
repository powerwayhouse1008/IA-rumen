import Image from "next/image";
import Link from "next/link";
const controls = [
  {
    href: "/zumen?view=saved",
    label: "作成図面済",
    badge: "Saved Plans",
    className:
      "bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 hover:brightness-110",
    description:
      "過去に保存した図面・案件データを一覧で確認するための入口です。商談前の再確認や再編集に使います。",
    usage: [
      "クリックすると保存済み図面ページへ移動します。",
      "案件名で検索して対象物件を絞り込みできます。",
      "必要な図面を選択して、そのまま印刷または再編集します。",
    ],
  },
  {
    href: "/create?new=1",
    label: "新規作成",
    badge: "New Listing",
    className:
      "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:brightness-110",
    description:
      "新しい物件資料を0から作成するための主要ボタンです。新規売買・賃貸募集の初期登録で使用します。",
    usage: [
      "クリック後、物件情報入力画面が開きます。",
      "住所・価格・面積などの必須項目を順番に入力します。",
      "登録完了後に図面とQR情報をまとめて作成します。",
    ],
  },
  {
    href: "https://qr.powerway.house/admin",
    label: "QR 管理",
    badge: "QR Dashboard",
    className:
      "bg-gradient-to-r from-violet-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/30 hover:brightness-110",
    description:
      "物件チラシ連携用のQRコードを管理する管理画面です。掲載URLの更新や配布管理を行えます。",
    usage: [
      "クリックするとQR管理システムへ遷移します。",
      "対象物件のQRコードを選択し、リンク先情報を確認します。",
      "必要に応じて再発行・無効化・更新を行います。",
    ],
  },
] as const;

export default function HomePage() {
  return (
     <main className="min-h-screen bg-gradient-to-br from-slate-100 via-[#e5edf4] to-[#ccdbea] px-4 py-6 md:px-8 md:py-10">
      <section className="mx-auto grid w-full max-w-[1500px] gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-400/20">
          <div className="relative isolate overflow-hidden px-6 py-8 md:px-10 md:py-12">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(14,116,144,0.13),transparent_42%),radial-gradient(circle_at_80%_35%,rgba(79,70,229,0.16),transparent_40%),linear-gradient(145deg,#f8fbff_0%,#e2edf8_100%)]" />

            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
              <div className="flex items-center gap-4">
                <Link href="/" aria-label="トップページへ戻る" className="shrink-0">
                  <Image
                    src="/powerway-house-logo.svg"
                    alt="Powerway House logo"
                    width={84}
                    height={84}
                    className="h-16 w-16 rounded-2xl border border-white/70 bg-white p-2 shadow-md md:h-20 md:w-20"
                    priority
                  />
                </Link>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                    Real Estate Suite
                  </p>
                  <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-4xl">
                    物件運用ダッシュボード
                  </h1>
                </div>
              </div>
              <span className="rounded-full border border-slate-300 bg-white/90 px-4 py-1 text-xs font-medium text-slate-700">
                Powered by Powerway House
              </span>
            </header>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {controls.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group relative rounded-2xl px-5 py-4 text-left transition-all duration-200 ${item.className}`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/85">
                    {item.badge}
                  </p>
                  <p className="mt-2 text-xl font-bold">{item.label}</p>
                  <p className="mt-4 text-xs text-white/90">詳細へ進む →</p>
                </Link>
              ))}
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {controls.map((item) => (
                <article
                  key={`${item.label}-card`}
                  className="rounded-2xl border border-slate-200 bg-white/90 p-4"
                >
                  <h2 className="text-sm font-bold text-slate-900">{item.label}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      
        <aside className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-2xl shadow-slate-400/20 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            操作ガイド（日本語）
          </p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">各ボタンの詳細な使い方</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            本ページは不動産業務に合わせて、案件確認・新規登録・QR運用の3つを最短で操作できる構成です。以下の手順に沿って利用してください。
          </p>

          <div className="mt-6 space-y-5">
            {controls.map((item, index) => (
              <section
                key={`${item.label}-manual`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <h3 className="text-base font-bold text-slate-900">
                  {index + 1}. 「{item.label}」ボタン
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{item.description}</p>
                <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-slate-700">
                  {item.usage.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
