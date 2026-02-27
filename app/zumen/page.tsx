"use client";

import { useEffect, useRef, useState } from "react";
import { InfoTable, SectionTitle } from "../../components/JpInfoTable";

type ZumenData = {
  price: string;
  name: string;
  access: string;
  walk: string;
  address: string;

  imgMain?: string; // 外観
  imgPlan?: string; // 間取り図
  imgSub1?: string; // 共用
  imgSub2?: string; // 室内
  imgSub3?: string; // ラウンジ等
};

function ImgBox({
  src,
  label,
  fit = "cover",
  h,
}: {
  src?: string;
  label: string;
  fit?: "cover" | "contain";
  h: number;
}) {
  return (
    <div className="border border-black bg-zinc-50 overflow-hidden flex items-center justify-center"
         style={{ height: `${h}px` }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={label} className="w-full h-full" style={{ objectFit: fit }} />
      ) : (
        <div className="text-xs text-zinc-500">{label}</div>
      )}
    </div>
  );
}

export default function ZumenPage() {
  const [data, setData] = useState<ZumenData | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("zumenData");
    if (saved) setData(JSON.parse(saved));
  }, []);

  if (!data) return null;

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-4 flex items-center justify-between">
          <a href="/" className="text-sm underline text-zinc-700">← 戻る</a>
          <span className="text-sm text-zinc-600">/zumen</span>
        </div>

        <div className="overflow-auto pb-10">
          {/* ===== A4 Sheet ===== */}
          <div
            ref={sheetRef}
            className="bg-white text-black border border-black"
            style={{ width: "794px", minHeight: "1123px" }}
          >
            {/* Header */}
            <div className="grid grid-cols-[140px_1fr_260px] border-b border-black">
              <div className="border-r border-black p-2 flex flex-col items-center justify-center">
                <div className="text-3xl font-extrabold leading-none">
                  {Number(data.price || 0).toLocaleString()}
                </div>
                <div className="text-xs font-bold mt-1">万円</div>
              </div>

              <div className="p-2">
                <div className="text-[12px] font-bold">物件名</div>
                <div className="mt-1 text-lg font-extrabold tracking-[0.2em]">
                  {data.name}
                </div>
              </div>

              <div className="border-l border-black p-2">
                <div className="grid grid-cols-[60px_1fr] items-center">
                  <div className="text-[12px] font-bold">交通</div>
                  <div className="text-[12px] font-bold text-right">
                    {data.access} 徒歩{data.walk}分
                  </div>
                </div>
              </div>
            </div>

            {/* Body 3 columns: 320 / flex / 260 */}
            <div className="grid grid-cols-[320px_1fr_260px]">
              {/* LEFT column */}
              <div className="border-r border-black p-2">
                <ImgBox src={data.imgMain} label="外観画像（左上）" h={260} />

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <ImgBox src={data.imgSub1} label="共用（左中）" h={150} />
                  <ImgBox src={data.imgSub2} label="室内（左中）" h={150} />
                </div>

                <div className="mt-2">
                  <ImgBox src={data.imgSub3} label="ラウンジ等（左下）" h={150} />
                </div>

                <div className="mt-3 text-[10px] leading-5">
                  <div>・共用施設リスト（任意）</div>
                  <div>・ゲストルーム / ラウンジ / キッズルーム</div>
                </div>
              </div>

              {/* CENTER column */}
              <div className="border-r border-black p-2">
                <ImgBox src={data.imgPlan} label="間取り図（中央上）" h={440} fit="contain" />

                <div className="mt-2 grid grid-cols-2 gap-2">
                  {/* ここは必要なら別画像にしてもOK。今は室内/共用を流用 */}
                  <ImgBox src={data.imgSub2} label="室内（中央下左）" h={220} />
                  <ImgBox src={data.imgSub3} label="共用（中央下右）" h={220} />
                </div>
              </div>

              {/* RIGHT column (info table) */}
              <div className="p-2">
                <SectionTitle>物件概要</SectionTitle>
                <InfoTable
                  rows={[
                    { label: "所在地", value: data.address },
                    { label: "権利", value: "所有権" },
                    { label: "専有面積", value: "83.20㎡" },
                    { label: "バルコニー", value: "19.47㎡" },
                    { label: "間取り", value: "洋6.7・5.5・5.5 LDK" },
                    { label: "築年月", value: "2025年09月" },
                  ]}
                />

                <div className="mt-2">
                  <SectionTitle>管理費等</SectionTitle>
                  <InfoTable
                    rows={[
                      { label: "管理費", value: "32,110円" },
                      { label: "修繕積立金", value: "16,220円" },
                      { label: "ネット使用料", value: "1,430円" },
                    ]}
                  />
                </div>

                <div className="mt-2">
                  <SectionTitle>設備・引渡</SectionTitle>
                  <InfoTable
                    rows={[
                      { label: "ガス", value: "都市ガス" },
                      { label: "EV", value: "有" },
                      { label: "現況", value: "空室" },
                      { label: "引渡", value: "即時" },
                    ]}
                  />
                </div>

                <div className="mt-2">
                  <SectionTitle>備考</SectionTitle>
                  <div className="border border-black border-t-0 p-2 text-[11px] whitespace-pre-wrap min-h-[150px]">
                    ※図面と相違する場合は現況を優先します。
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-black grid grid-cols-[1fr_260px]">
              <div className="bg-[#b30000] text-white px-3 py-2 font-extrabold tracking-widest">
                POWERWAY HOUSE
              </div>
              <div className="px-2 py-2 text-[10px] border-l border-black">
                担当者：野村　／　取引形態：一般
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}