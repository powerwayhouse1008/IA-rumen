"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ZumenData = {
  price: string;
  name: string;
  access: string;
  walk: string;
  address: string;

  // images as DataURL
  imgMain?: string; // 外観
  imgPlan?: string; // 間取り図
  imgSub1?: string; // 共用
  imgSub2?: string; // 室内
  imgSub3?: string; // ラウンジ等
};

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
    />
  );
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export default function Page() {
  const router = useRouter();
  const [data, setData] = useState<ZumenData>({
    price: "21500",
    name: "HARUMI FLAG SUN VILLAGE T棟",
    access: "都営大江戸線 勝どき",
    walk: "15",
    address: "東京都中央区晴海５丁目5-7",
  });

  const canGo = useMemo(() => data.price.trim() && data.name.trim(), [data]);

  function update<K extends keyof ZumenData>(key: K, value: ZumenData[K]) {
    setData((p) => ({ ...p, [key]: value }));
  }

  async function onPick(
    key: keyof Pick<ZumenData, "imgMain" | "imgPlan" | "imgSub1" | "imgSub2" | "imgSub3">,
    file?: File
  ) {
    if (!file) return;
    const url = await fileToDataUrl(file);
    setData((p) => ({ ...p, [key]: url }));
  }

  function onGenerate() {
    localStorage.setItem("zumenData", JSON.stringify(data));
    router.push("/zumen");
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-6xl min-h-screen grid lg:grid-cols-2">
        {/* Left: form like sign-in */}
        <div className="flex items-center justify-center p-6">
          <div className="w-full max-w-xl bg-white border rounded-2xl shadow-sm p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">図面 自動生成</h1>
              <p className="text-sm text-zinc-600 mt-1">
                入力 + 画像アップロード → 図面プレビュー
              </p>
            </div>

            <div className="grid gap-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-600">価格（万円）</label>
                  <Input value={data.price} onChange={(e) => update("price", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-zinc-600">徒歩（分）</label>
                  <Input value={data.walk} onChange={(e) => update("walk", e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-600">物件名</label>
                <Input value={data.name} onChange={(e) => update("name", e.target.value)} />
              </div>

              <div>
                <label className="text-xs text-zinc-600">交通</label>
                <Input value={data.access} onChange={(e) => update("access", e.target.value)} />
              </div>

              <div>
                <label className="text-xs text-zinc-600">所在地</label>
                <Input value={data.address} onChange={(e) => update("address", e.target.value)} />
              </div>

              <div className="pt-2">
                <h2 className="font-semibold">画像アップロード</h2>

                <div className="mt-2 grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-600">外観（左上）</label>
                    <Input type="file" accept="image/*" onChange={(e) => onPick("imgMain", e.target.files?.[0])} />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-600">間取り図（中央上）</label>
                    <Input type="file" accept="image/*" onChange={(e) => onPick("imgPlan", e.target.files?.[0])} />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-600">共用（左中）</label>
                    <Input type="file" accept="image/*" onChange={(e) => onPick("imgSub1", e.target.files?.[0])} />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-600">室内（左中）</label>
                    <Input type="file" accept="image/*" onChange={(e) => onPick("imgSub2", e.target.files?.[0])} />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-zinc-600">ラウンジ等（左下）</label>
                    <Input type="file" accept="image/*" onChange={(e) => onPick("imgSub3", e.target.files?.[0])} />
                  </div>
                </div>

                <p className="text-xs text-zinc-500 mt-2">
                  * 画像はブラウザに一時保存（localStorage）されます
                </p>
              </div>

              <button
                type="button"
                onClick={onGenerate}
                disabled={!canGo}
                className={
                  "mt-2 w-full rounded-xl py-3 text-sm font-semibold " +
                  (canGo
                    ? "bg-zinc-900 text-white hover:bg-zinc-800"
                    : "bg-zinc-200 text-zinc-500 cursor-not-allowed")
                }
              >
                図面を生成してプレビュー
              </button>
            </div>
          </div>
        </div>

        {/* Right hero */}
        <div className="hidden lg:flex items-center justify-center p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950" />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 max-w-md text-white">
            <h2 className="text-3xl font-bold leading-tight">販売図面テンプレ</h2>
            <p className="mt-4 text-white/80 text-sm leading-6">
              画像を所定の枠に自動配置（左：外観/共用/室内、中央：間取り、右：物件概要）
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}