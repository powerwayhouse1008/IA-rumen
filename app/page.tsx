import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#d6e2ee] p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-[1500px] items-center gap-3 rounded-md bg-[#c8d7e3] p-3">
        <Link href="/" aria-label="トップページへ戻る">
          <Image
            src="/powerway-house-logo.svg"
            alt="Powerway House logo"
            width={56}
            height={56}
            className="h-14 w-14 rounded-xl"
            priority
          />
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/zumen?view=saved"
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
          >
            作成図面済
          </Link>
          <Link
            href="/create"
            className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white"
          >
            新規作成
          </Link>
          <a
            href="https://qr.powerway.house/admin"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            QR 管理
          </a>
        </div>
      </div>
    </main>
  );
}
