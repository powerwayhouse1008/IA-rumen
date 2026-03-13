"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type DraftPayload = {
  address?: string;
  imgMap?: string;
  [key: string]: unknown;
};



async function createAddressMap(address: string): Promise<string | undefined> {
  if (!address.trim()) return undefined;

  try {
    const res = await fetch("/api/address-map", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address }),
    });

    if (!res.ok) return undefined;

    const data = (await res.json()) as { mapDataUrl?: string; mapUrl?: string };
    return data.mapDataUrl ?? data.mapUrl;
  } catch {
    return undefined;
  }
}

function loadDraftPayload(): DraftPayload | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem("zumenData");
  if (!saved) return null;

  try {
    return JSON.parse(saved) as DraftPayload;
  } catch {
    return null;
  }
}

export default function AddressMapPage() {
  const router = useRouter();
  const initialDraft = useMemo(() => loadDraftPayload(), []);

  const [address, setAddress] = useState(initialDraft?.address ?? "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMap, setPreviewMap] = useState<string | undefined>(initialDraft?.imgMap);
  const [message, setMessage] = useState("");

  async function generateMap(targetAddress: string) {
    setIsGenerating(true);
    setMessage("");

    const generatedMap = await createAddressMap(targetAddress);
    if (generatedMap) {
      setPreviewMap(generatedMap);
      setMessage("MAPを生成しました。");
    } else {
      setMessage("MAP生成に失敗しました。住所を確認してください。");
    }

    setIsGenerating(false);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const queryAddress = new URLSearchParams(window.location.search).get("address");
    if (queryAddress?.trim()) {
      setAddress(queryAddress);
      void generateMap(queryAddress);
      return;
    }

    if (!address.trim()) return;
    void generateMap(address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function useThisMap() {
    if (!previewMap || typeof window === "undefined") return;

    const payload = {
      ...(initialDraft ?? {}),
      address,
      imgMap: previewMap,
    };

    localStorage.setItem("zumenData", JSON.stringify(payload));
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-[#e6f4ff] p-4 text-zinc-800 md:p-6">
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
        <h1 className="text-lg font-bold">住所から現地MAP自動生成</h1>
        <p className="mt-1 text-sm text-zinc-600">住所を入力してMAP画像を生成し、図面作成フォームへ反映します。</p>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="住所を入力"
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
          />
          <button
            type="button"
            onClick={() => void generateMap(address)}
            disabled={isGenerating || !address.trim()}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {isGenerating ? "生成中..." : "MAP生成"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-md bg-zinc-500 px-4 py-2 text-sm font-semibold text-white"
          >
            戻る
          </button>
        </div>

        {message && <div className="mt-3 text-sm text-zinc-700">{message}</div>}

        <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
          {previewMap ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewMap} alt="生成された現地MAP" className="h-auto w-full object-cover" />
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-zinc-400">ここにMAPプレビューが表示されます</div>
          )}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={useThisMap}
            disabled={!previewMap}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            このMAPを使う
          </button>
        </div>
      </div>
    </main>
  );
}
