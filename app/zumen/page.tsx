"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { InfoTable, SectionTitle } from "../../components/JpInfoTable";

type CategoryKey = "new-house" | "used-house" | "land" | "new-mansion" | "used-mansion";
type ThemeColorKey = "sunset-red" | "ocean-blue" | "forest-green" | "royal-purple" | "charcoal-gold";

const THEME_COLORS: Record<ThemeColorKey, { brand: string; section: string; label: string }> = {
  "sunset-red": { brand: "#b30000", section: "#f3c9b8", label: "#fde7dd" },
  "ocean-blue": { brand: "#1d4ed8", section: "#bfd7ff", label: "#e1ecff" },
  "forest-green": { brand: "#0f766e", section: "#bfe6dc", label: "#e2f5ef" },
  "royal-purple": { brand: "#6d28d9", section: "#d8c2ff", label: "#eee4ff" },
  "charcoal-gold": { brand: "#9a6b00", section: "#ecd9ad", label: "#f8edd2" },
};

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
  themeColor?: ThemeColorKey;
  contactInfo?: {
    companyName: string;
    companyPhone: string;
    companyAddress: string;
    companyFax: string;
    licenseNo: string;
    transactionType: string;
    staffName: string;
    fee: string;
    inspectionNote: string;
  };
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
      setSheetScale(Math.min(1, el.clientWidth / BASE_WIDTH));
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
        { label: "地目", value: data.houseDetails.lot || "-" },
        { label: "私道", value: data.houseDetails.privateRoad || "-" },
        { label: "接道舗装", value: data.houseDetails.roadSurface || "-" },
        { label: "専有面積", value: data.houseDetails.exclusiveArea ? `${data.houseDetails.exclusiveArea}㎡` : "-" },
        { label: "間取り", value: data.houseDetails.layout || "-" },
        { label: "構造・階数", value: data.houseDetails.structure || "-" },
        { label: "所在階", value: data.houseDetails.floor || "-" },
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
        { label: "構造・階数", value: data.mansionDetails.structure || "-" },
        { label: "所在階", value: data.mansionDetails.floor || "-" },
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
        { label: "管理会社", value: data.mansionDetails.managementCompany || "-" },
      ];
    }

    if (isHouse && data?.houseDetails) {
      return [
        { label: "都市計画", value: data.houseDetails.cityPlan || "-" },
        { label: "用途地域", value: data.houseDetails.zoning || "-" },
        { label: "建ぺい率", value: data.houseDetails.buildingCoverage || "-" },
        { label: "容積率", value: data.houseDetails.floorAreaRatio || "-" },
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
        { label: "汚水", value: data.houseDetails.sewage || "-" },
        { label: "雑排水", value: data.houseDetails.drain || "-" },
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

  const contact = {
    companyName: data?.contactInfo?.companyName || "株式会社パワーウェイ",
    companyPhone: data?.contactInfo?.companyPhone || "090-6695-1306",
    companyAddress: data?.contactInfo?.companyAddress || "〒101-0025 東京都千代田区神田須田町2-2 3-1芝崎ビル4F",
    companyFax: data?.contactInfo?.companyFax || "03-5207-2768",
    licenseNo: data?.contactInfo?.licenseNo || "東京都知事（2）第101930号",
    transactionType: data?.contactInfo?.transactionType || "一般",
    staffName: data?.contactInfo?.staffName || "野村",
    fee: data?.contactInfo?.fee || "分かれて",
    inspectionNote: data?.contactInfo?.inspectionNote || "☚内見、物件確認",
    const theme = THEME_COLORS[data?.themeColor ?? "sunset-red"];

  };

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
        <div ref={previewRef} className="overflow-x-auto overflow-y-visible">
            <div className="mx-auto" style={{ width: `${1123 * sheetScale}px` }}>
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

                   <div className="grid grid-cols-[300px_1fr_280px]">
                  <div className="border-r border-black p-2">
                    <ImgBox src={data.imgMain} label="外観画像（左上）" h={230} />
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <ImgBox src={data.imgSub1} label="共用（左中）" h={130} />
                      <ImgBox src={data.imgSub2} label="室内（左中）" h={130} />
                    </div>
                    <div className="mt-2">
                      <ImgBox src={data.imgSub3} label="ラウンジ等（左下）" h={135} />
                    </div>
                    <div className="mt-3 text-[10px] leading-5">
                      <div>・共用施設リスト（任意）</div>
                      <div>・ゲストルーム / ラウンジ / キッズルーム</div>
                    </div>
                  </div>

                  <div className="border-r border-black p-2">
                    <ImgBox src={data.imgPlan} label="間取り図（中央上）" h={400} fit="contain" />
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <ImgBox src={data.imgSub2} label="室内（中央下左）" h={185} />
                      <ImgBox src={data.imgSub3} label="共用（中央下右）" h={185} />
                    </div>
                  </div>

                  <div className="p-2">
                    <SectionTitle bgColor={theme.section}>物件概要</SectionTitle>
                    <InfoTable rows={summaryRows} labelBgColor={theme.label} />

                    {managementRows.length > 0 && (
                      <div className="mt-2">
                        <SectionTitle bgColor={theme.section}>{isMansion ? "管理費等" : "制限・施設"}</SectionTitle>
                        <InfoTable rows={managementRows} labelBgColor={theme.label} />
                      </div>
                    )}

                    <div className="mt-2">
                      <SectionTitle bgColor={theme.section}>設備・引渡</SectionTitle>
                      <InfoTable rows={facilityRows} labelBgColor={theme.label} />
                    </div>

                    <div className="mt-2">
                       <SectionTitle bgColor={theme.section}>備考</SectionTitle>
                      <div className="min-h-[120px] whitespace-pre-wrap border border-black border-t-0 p-2 text-[10px]">
                        {remarks || "※図面と相違する場合は現況を優先します。"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[210px_1fr] border-t border-black">
                  <div className="px-3 py-2 text-white" style={{ backgroundColor: theme.brand }}>
                    <div className="text-2xl font-extrabold leading-tight tracking-widest">POWERWAY HOUSE</div>
                    <div className="mt-0.5 text-[11px]">不動産　販売・賃貸・管理</div>
                  </div>
                     <div className="grid grid-cols-[1fr_88px_220px]">
                    <div className="px-2 py-1 text-[10px] leading-4">
                      <div className="grid grid-cols-[1fr_auto] gap-2">
                        <div className="font-semibold">{contact.licenseNo}</div>
                        <div className="font-semibold">TEL：{contact.companyPhone}　FAX：{contact.companyFax}</div>
                      </div>
                      <div className="text-[21px] font-extrabold leading-tight">{contact.companyName}</div>
                       <div className="font-semibold">担当者：{contact.staffName}</div>
                      <div className="truncate text-[10px]">{contact.companyAddress}</div>
                    </div>
                    <div className="flex items-center justify-center border-l border-black px-1 py-1">
                      {data.imgQr ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={data.imgQr} alt="QR" className="h-20 w-20 object-cover" />
                      ) : (
                        <div className="text-[10px] text-zinc-500">QR</div>
                      )}
                    </div>
                    <div className="border-l border-black text-[10px]">
                      <div className="grid grid-cols-[1fr_1fr] items-start border-b border-black px-2 py-1">
                        <div>
                          <div className="font-semibold">{contact.inspectionNote}</div>
                      
                        </div>
                        <div className="text-right">
                          <div>取引形態：{contact.transactionType}</div>
                          <div className="mt-0.5">担当者：{contact.staffName}</div>
                          <div className="mt-0.5">手数料：{contact.fee}</div>
                        </div>
                      </div>
                      <div className="px-2 py-1 text-right text-[9px]">図面と相違する場合は現況を優先します。</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
