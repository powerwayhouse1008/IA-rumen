"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { InfoTable, SectionTitle } from "../../components/JpInfoTable";

type CategoryKey = "new-house" | "used-house" | "land" | "new-mansion" | "used-mansion";

type HouseDetails = {
  right: string;
  landArea: string;
  lot: string;
  privateRoad: string;
  roadSurface: string;
  exclusiveArea: string;
  layout: string;
  structure: string;
  floor: string;
  builtAt: string;
  cityPlan: string;
  zoning: string;
  buildingCoverage: string;
  floorAreaRatio: string;
  parking: string;
  water: string;
  gas: string;
  sewage: string;
  drain: string;
  status: string;
  handover: string;
  note: string;
};

type MansionDetails = {
  right: string;
  landArea: string;
  zoning: string;
  exclusiveArea: string;
  balconyArea: string;
  layout: string;
  structure: string;
  floor: string;
  builtAt: string;
  developer: string;
  constructor: string;
  totalUnits: string;
  managementCompany: string;
  managementStyle: string;
  managementFee: string;
  reserveFund: string;
  internetFee: string;
  monthlyTotal: string;
  gas: string;
  elevator: string;
  currentStatus: string;
  handover: string;
  note: string;
};

type ZumenData = {
  price: string;
  name: string;
  access: string;
  walk: string;
  address: string;
  category?: CategoryKey;
  propertyType?: string;
  houseDetails?: HouseDetails;
  mansionDetails?: MansionDetails;
  imgMain?: string;
  imgPlan?: string;
  imgSub1?: string;
  imgSub2?: string;
  imgSub3?: string;
  imgQr?: string;
};

function ImgBox({ src, label, fit = "cover", h }: { src?: string; label: string; fit?: "cover" | "contain"; h: number }) {
  return (
    <div className="flex items-center justify-center overflow-hidden border border-black bg-zinc-50" style={{ height: `${h}px` }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={label} className="h-full w-full" style={{ objectFit: fit }} />
      ) : (
        <div className="text-xs text-zinc-500">{label}</div>
      )}
    </div>
  );
}

export default function ZumenPage() {
  const [data] = useState<ZumenData | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("zumenData");
    return saved ? JSON.parse(saved) : null;
  });

  const previewRef = useRef<HTMLDivElement | null>(null);
  const [sheetScale, setSheetScale] = useState(1);

  useEffect(() => {
    const BASE_WIDTH = 1123;
    const updateScale = () => {
      const el = previewRef.current;
      if (!el) return;
      setSheetScale(Math.min(1.18, el.clientWidth / BASE_WIDTH));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const category = data?.category;
  const isHouse = category === "new-house" || category === "used-house";
  const isMansion = category === "new-mansion" || category === "used-mansion";
  const isLand = category === "land";

  const summaryRows = useMemo(() => {
    if (!data) return [];

    if (isHouse && data.houseDetails) {
      return [
        { label: "所在地", value: data.address },
        { label: "権利", value: data.houseDetails.right || "-" },
        { label: "敷地面積", value: data.houseDetails.landArea ? `${data.houseDetails.landArea}㎡` : "-" },
        { label: "間取り", value: data.houseDetails.layout || "-" },
        { label: "構造・階数", value: data.houseDetails.structure || "-" },
        { label: "築年月", value: data.houseDetails.builtAt || "-" },
      ];
    }

    if (isMansion && data.mansionDetails) {
      return [
        { label: "所在地", value: data.address },
        { label: "権利", value: data.mansionDetails.right || "-" },
        { label: "専有面積", value: data.mansionDetails.exclusiveArea ? `${data.mansionDetails.exclusiveArea}㎡` : "-" },
        { label: "バルコニー", value: data.mansionDetails.balconyArea ? `${data.mansionDetails.balconyArea}㎡` : "-" },
        { label: "間取り", value: data.mansionDetails.layout || "-" },
        { label: "築年月", value: data.mansionDetails.builtAt || "-" },
      ];
    }

    if (isLand) {
      return [
        { label: "所在地", value: data.address },
        { label: "物件種別", value: data.propertyType || "土地" },
        { label: "交通", value: `${data.access} 徒歩${data.walk}分` },
        { label: "価格", value: `${Number(data.price || 0).toLocaleString()}万円` },
      ];
    }

    return [{ label: "所在地", value: data.address }];
  }, [data, isHouse, isLand, isMansion]);

  const managementRows = useMemo(() => {
    if (isMansion && data?.mansionDetails) {
      return [
        { label: "管理費", value: data.mansionDetails.managementFee ? `${data.mansionDetails.managementFee}円` : "-" },
        { label: "修繕積立金", value: data.mansionDetails.reserveFund ? `${data.mansionDetails.reserveFund}円` : "-" },
        { label: "ネット使用料", value: data.mansionDetails.internetFee ? `${data.mansionDetails.internetFee}円` : "-" },
      ];
    }

    if (isHouse && data?.houseDetails) {
      return [
        { label: "都市計画", value: data.houseDetails.cityPlan || "-" },
        { label: "用途地域", value: data.houseDetails.zoning || "-" },
        { label: "駐車場", value: data.houseDetails.parking || "-" },
      ];
    }

    return [];
  }, [data, isHouse, isMansion]);

  const facilityRows = useMemo(() => {
    if (isMansion && data?.mansionDetails) {
      return [
        { label: "ガス", value: data.mansionDetails.gas || "-" },
        { label: "EV", value: data.mansionDetails.elevator || "-" },
        { label: "現況", value: data.mansionDetails.currentStatus || "-" },
        { label: "引渡", value: data.mansionDetails.handover || "-" },
      ];
    }

    if (isHouse && data?.houseDetails) {
      return [
        { label: "ガス", value: data.houseDetails.gas || "-" },
        { label: "飲用水", value: data.houseDetails.water || "-" },
        { label: "現況", value: data.houseDetails.status || "-" },
        { label: "引渡", value: data.houseDetails.handover || "-" },
      ];
    }

    return [
      { label: "ガス", value: "-" },
      { label: "現況", value: "-" },
      { label: "引渡", value: "-" },
    ];
  }, [data, isHouse, isMansion]);

  const remarks = isMansion ? data?.mansionDetails?.note : isHouse ? data?.houseDetails?.note : "※図面と相違する場合は現況を優先します。";

  if (!data) return null;

  return (
    <main className="min-h-screen bg-[#f3f4f6] p-2 md:p-4">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="mb-3 flex items-center justify-between">
          <Link href="/" className="rounded-md bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">← 戻る</Link>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white">一時保存</button>
            <button type="button" className="rounded-md bg-rose-500 px-4 py-2 text-sm font-semibold text-white">次のステップ</button>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm md:p-4">
          <div ref={previewRef} className="overflow-auto">
            <div className="mx-auto" style={{ width: `${1123 * sheetScale}px`, height: `${794 * sheetScale}px` }}>
              <div className="border border-black bg-white text-black" style={{ width: "1123px", minHeight: "794px", transform: `scale(${sheetScale})`, transformOrigin: "top left" }}>
                <div className="grid grid-cols-[140px_1fr_260px] border-b border-black">
                  <div className="flex flex-col items-center justify-center border-r border-black p-2">
                    <div className="text-3xl font-extrabold leading-none">{Number(data.price || 0).toLocaleString()}</div>
                    <div className="mt-1 text-xs font-bold">万円</div>
                  </div>

                  <div className="p-2">
                    <div className="text-[12px] font-bold">物件名</div>
                    <div className="mt-1 text-lg font-extrabold tracking-[0.2em]">{data.name}</div>
                  </div>

                  <div className="border-l border-black p-2">
                    <div className="grid grid-cols-[60px_1fr] items-center">
                      <div className="text-[12px] font-bold">交通</div>
                      <div className="text-right text-[12px] font-bold">{data.access} 徒歩{data.walk}分</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[320px_1fr_260px]">
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

                  <div className="border-r border-black p-2">
                    <ImgBox src={data.imgPlan} label="間取り図（中央上）" h={440} fit="contain" />
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <ImgBox src={data.imgSub2} label="室内（中央下左）" h={220} />
                      <ImgBox src={data.imgSub3} label="共用（中央下右）" h={220} />
                    </div>
                  </div>

                  <div className="p-2">
                    <SectionTitle>物件概要</SectionTitle>
                    <InfoTable rows={summaryRows} />

                    {managementRows.length > 0 && (
                      <div className="mt-2">
                        <SectionTitle>{isMansion ? "管理費等" : "制限・施設"}</SectionTitle>
                        <InfoTable rows={managementRows} />
                      </div>
                    )}

                    <div className="mt-2">
                      <SectionTitle>設備・引渡</SectionTitle>
                      <InfoTable rows={facilityRows} />
                    </div>

                    <div className="mt-2">
                      <SectionTitle>備考</SectionTitle>
                      <div className="min-h-[150px] whitespace-pre-wrap border border-black border-t-0 p-2 text-[11px]">
                        {remarks || "※図面と相違する場合は現況を優先します。"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_260px] border-t border-black">
                  <div className="bg-[#b30000] px-3 py-2 font-extrabold tracking-widest text-white">POWERWAY HOUSE</div>
                  <div className="border-l border-black px-2 py-2 text-[10px]">担当者：野村　／　取引形態：一般</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
