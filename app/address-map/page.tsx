"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type DraftPayload = {
  address?: string;
  imgMap?: string;
  [key: string]: unknown;
};

type MapResponse = {
  mapUrl?: string;
  displayName?: string;
  error?: string;
};

async function createAddressMap(address: string): Promise<MapResponse> {
  if (!address.trim()) {
    return { error: "住所を入力してください。" };
  }

  try {
    const res = await fetch("/api/address-map", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address }),
    });

    const data = (await res.json()) as MapResponse;
    if (!res.ok) {
      return { error: data.error || "MAP生成に失敗しました。住所を確認してください。" };
    }

    return { mapUrl: data.mapUrl, displayName: data.displayName };
  } catch {
    return { error: "サーバーエラーが発生しました。" };
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
  const [mapUrl, setMapUrl] = useState<string | undefined>(initialDraft?.imgMap);
  const [resolvedAddress, setResolvedAddress] = useState("");
  const [error, setError] = useState("");

  async function generateMap(targetAddress: string) {
    setIsGenerating(true);
    setError("");

    const result = await createAddressMap(targetAddress);
    if (result.mapUrl) {
      setMapUrl(result.mapUrl);
      setResolvedAddress(result.displayName || targetAddress);
    } else {
      setMapUrl(undefined);
      setResolvedAddress("");
      setError(result.error || "MAP生成に失敗しました。住所を確認してください。");
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
    if (!mapUrl || typeof window === "undefined") return;

    const payload = {
      ...(initialDraft ?? {}),
      address,
      imgMap: mapUrl,
    };

    localStorage.setItem("zumenData", JSON.stringify(payload));
    router.push("/create");
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
            onClick={() => router.push("/create")}
            className="rounded-md bg-zinc-500 px-4 py-2 text-sm font-semibold text-white"
          >
            戻る
          </button>
        </div>

        {error ? <p style={{ color: "#a52a2a", marginTop: 16 }}>{error}</p> : null}

        <div
          style={{
            marginTop: 20,
            border: "1px solid #d7d7d7",
            borderRadius: 10,
            minHeight: 520,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            background: "#fafafa",
          }}
        >
          {mapUrl ? (
            <div style={{ width: "100%", position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mapUrl} alt="map preview" style={{ width: "100%", display: "block", minHeight: 520, objectFit: "cover" }} />
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -100%)",
                  width: 44,
                  height: 44,
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/powerway-house-logo.svg" alt="home marker" style={{ width: "100%", height: "100%" }} />
              </div>
              <div style={{ padding: 12, fontSize: 14, color: "#444", borderTop: "1px solid #ececec" }}>{resolvedAddress}</div>
            </div>
          ) : (
            <span style={{ color: "#aaa", fontSize: 28 }}>ここにMAPプレビューが表示されます</span>
          )}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={useThisMap}
            disabled={!mapUrl}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            このMAPを使う
          </button>
        </div>
      </div>
    </main>
  );
}
