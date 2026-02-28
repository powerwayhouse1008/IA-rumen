"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ZumenData = {
  price: string;
  name: string;
  access: string;
  walk: string;
  address: string;
  imgMain?: string;
  imgPlan?: string;
  imgSub1?: string;
  imgSub2?: string;
  imgSub3?: string;
  imgQr?: string;
};
type CategoryKey = "new-house" | "used-house" | "land" | "new-mansion" | "used-mansion";

type CategoryPreset = {
  label: string;
  propertyType: string;
  catchCopy: string;
  districts: string;
  data: ZumenData;
};

const CATEGORY_PRESETS: Record<CategoryKey, CategoryPreset> = {
  "new-house": {
    label: "新築住宅仮入力",
    propertyType: "新築分譲住宅",
    catchCopy: "暮らしやすさ×癒しの家 未来志向のライフデザイン住宅",
    districts: "10区画",
    data: {
      price: "21500",
      name: "東京都港区南青山1期",
      access: "東京メトロ千代田線 表参道",
      walk: "5",
      address: "東京都中央区晴海５丁目5-7",
    },
  },
@@ -76,164 +77,220 @@ const CATEGORY_PRESETS: Record<CategoryKey, CategoryPreset> = {
      access: "東京メトロ銀座線 外苑前",
      walk: "4",
      address: "東京都港区南青山2-10-5",
    },
  },
  "used-mansion": {
    label: "中古マンション仮入力",
    propertyType: "中古マンション",
    catchCopy: "眺望良好の角住戸。リノベーション済みで上質な暮らし",
    districts: "120戸",
    data: {
      price: "9150",
      name: "シティテラス豊洲リバーコート",
      access: "東京メトロ有楽町線 豊洲",
      walk: "7",
      address: "東京都江東区豊洲4-1-20",
    },
  },
};

const PROPERTY_TYPE_OPTIONS = ["中古マンション", "新築分譲マンション", "新築分譲住宅", "中古住宅", "土地"];

const SALES_TAGS = ["# 2沿線以上利用可", "# 駐車2台可", "# 環境重視の住宅地", "# 閑静な住宅街", "# 平坦地", "# 角地"];
const FEATURE_TAGS = ["# シャワートイレ", "# DEN", "# LDKカウンターテーブル", "# ダイニング収納", "# 納戸", "# シューズクローク"];

const SIDEBAR_LINKS = ["ホーム", "物件新規登録", "転売図面履歴", "物件検索", "お気に入り", "プラン管理", "AI図取り"] as const;

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1 block text-sm font-semibold text-zinc-700">
      {children} {required && <span className="text-rose-500">※</span>}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
    />
  );
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(String(reader.result));
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

export default function Page() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("new-house");
  const [propertyType, setPropertyType] = useState(CATEGORY_PRESETS["new-house"].propertyType);
 const [data, setData] = useState<ZumenData>(CATEGORY_PRESETS["new-house"].data);
   const [catchCopy, setCatchCopy] = useState(CATEGORY_PRESETS["new-house"].catchCopy);
  const [managerNo, setManagerNo] = useState("12345678");
  const [publishDate, setPublishDate] = useState("2025-06-01");
  const [expireDate, setExpireDate] = useState("2025-12-31");
  const [districts, setDistricts] = useState(CATEGORY_PRESETS["new-house"].districts);
  const [savedAt, setSavedAt] = useState<string>("");
  const [salesTags, setSalesTags] = useState<string[]>([]);
  const [featureTags, setFeatureTags] = useState<string[]>([]);
  const [mansionDetails, setMansionDetails] = useState({
    right: "所有権",
    landArea: "25246.57",
    zoning: "第二種住居地域",
    exclusiveArea: "104.35",
    balconyArea: "14.66",
    layout: "3LDK+WIC+SIC+TR",
    structure: "鉄筋コンクリート造 地上14階地下2階",
    floor: "6",
    builtAt: "2025年3月",
    developer: "三井不動産レジデンシャル(株)",
    constructor: "大成建設(株)",
    totalUnits: "1002",
    managementCompany: "三井不動産レジデンシャルサービス(株)",
    managementStyle: "全部委託 管理方式:日勤",
    managementFee: "85240",
    reserveFund: "23610",
    internetFee: "1430",
    monthlyTotal: "110280",
    gas: "都市ガス",
    elevator: "無し",
    currentStatus: "空室",
    handover: "即時",
    note: `●ペット飼育可(細則有り)
●敷地内駐車場 有空き要確認`,
  });

  const isMansionCategory = selectedCategory === "new-mansion" || selectedCategory === "used-mansion";

  const canGo = useMemo(() => data.price.trim() && data.name.trim() && data.address.trim(), [data]);

  function update<K extends keyof ZumenData>(key: K, value: ZumenData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function updateMansion(key: keyof typeof mansionDetails, value: string) {
    setMansionDetails((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTag(tag: string, setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function onPick(
  
    key: keyof Pick<ZumenData, "imgMain" | "imgPlan" | "imgSub1" | "imgSub2" | "imgSub3" | "imgQr">,
    file?: File
  ) {
    if (!file) return;
    const url = await fileToDataUrl(file);
    update(key, url);
  }

  function removeImage(key: keyof Pick<ZumenData, "imgMain" | "imgPlan" | "imgSub1" | "imgSub2" | "imgSub3" | "imgQr">) {
    update(key, undefined);
  }

  function onSaveDraft() {
    localStorage.setItem("zumenData", JSON.stringify(data));
    setSavedAt(new Date().toLocaleString("ja-JP"));
  }

  function onGenerate() {
    localStorage.setItem("zumenData", JSON.stringify(data));
    router.push("/zumen");
  }
  function onSelectCategory(category: CategoryKey) {
    const preset = CATEGORY_PRESETS[category];
    setSelectedCategory(category);
    setData(preset.data);
    setCatchCopy(preset.catchCopy);
    setDistricts(preset.districts);
    setPropertyType(preset.propertyType);
  }

  const uploadItems: Array<{ key: keyof Pick<ZumenData, "imgMain" | "imgPlan" | "imgSub1" | "imgSub2" | "imgSub3" | "imgQr">; label: string }> = [
    { key: "imgMain", label: "全体区画図 or 住宅写真" },
    { key: "imgPlan", label: "物件メイン画像" },
    { key: "imgSub1", label: "物件サブ画像（1）" },
    { key: "imgSub2", label: "物件サブ画像（2）" },
    { key: "imgSub3", label: "物件サブ画像（3）" },
    { key: "imgQr", label: "物件QRコード" },
  ];

  return (
    
    <main className="min-h-screen bg-[#e6f4ff] text-zinc-800">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[260px,1fr]">
        <aside className="border-r border-sky-200 bg-[#f2f9ff] p-4">
          <div className="rounded-2xl border border-sky-100 bg-white p-3.5 shadow-sm">
            <Image src="/powerway-house-logo.svg" alt="Powerway House logo" width={128} height={128} className="mx-auto h-28 w-28 rounded-2xl" priority />
            <div className="mt-3 text-center text-4xl font-extrabold leading-tight tracking-tight text-sky-700">
              Powerway
              <br />
              House
            </div>
          </div>
          <nav className="mt-8 space-y-2 text-sm">
            
            {SIDEBAR_LINKS.map((label, index) => {
              const activeClass =
                index === 0
                  ? "bg-emerald-500 font-semibold text-white"
                  : index === 1
                    ? "bg-rose-500 font-semibold text-white"
                    : "hover:bg-zinc-100";

              return (
                <div key={label} className={`rounded-lg px-4 py-2.5 ${activeClass}`}>
                  {label}
                </div>
              );
            })}
          </nav>
        </aside>

        <section className="p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-bold md:text-2xl">新規登録 STEP1 基本情報</h1>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white">変更を破棄</button>
              <button type="button" onClick={onSaveDraft} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">一時保存</button>
              <button type="button" onClick={onGenerate} disabled={!canGo} className="rounded-md bg-rose-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">次のステップ</button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex flex-wrap gap-2">
                {(Object.entries(CATEGORY_PRESETS) as Array<[CategoryKey, CategoryPreset]>).map(([key, preset]) => {
                const isSelected = selectedCategory === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSelectCategory(key)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${isSelected ? "bg-emerald-600 text-white shadow-sm" : "bg-orange-500 text-white hover:bg-orange-600"}`}
                  >
                    {preset.label}
@@ -324,50 +381,81 @@ export default function Page() {
                        <Input type="file" accept="image/*" onChange={(e) => onPick(key, e.target.files?.[0])} />
                        <div className="mt-2 h-24 overflow-hidden rounded border border-zinc-200 bg-zinc-50">
                          {data[key] ? (
                            <div className="relative h-full">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={data[key]} alt={label} className="h-full w-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeImage(key)}
                                className="absolute right-1 top-1 rounded bg-black/60 px-2 py-0.5 text-xs text-white"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-zinc-400">No image</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {isMansionCategory && (
              <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <div className="mb-3 text-sm font-semibold text-zinc-700">マンション詳細（新築マンション / 中古マンション）</div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div><FieldLabel>権利</FieldLabel><Input value={mansionDetails.right} onChange={(e) => updateMansion("right", e.target.value)} /></div>
                  <div><FieldLabel>敷地面積 (㎡)</FieldLabel><Input value={mansionDetails.landArea} onChange={(e) => updateMansion("landArea", e.target.value)} /></div>
                  <div><FieldLabel>用途地域</FieldLabel><Input value={mansionDetails.zoning} onChange={(e) => updateMansion("zoning", e.target.value)} /></div>
                  <div><FieldLabel>専有面積 (㎡)</FieldLabel><Input value={mansionDetails.exclusiveArea} onChange={(e) => updateMansion("exclusiveArea", e.target.value)} /></div>
                  <div><FieldLabel>バルコニー面積 (㎡)</FieldLabel><Input value={mansionDetails.balconyArea} onChange={(e) => updateMansion("balconyArea", e.target.value)} /></div>
                  <div><FieldLabel>間取り</FieldLabel><Input value={mansionDetails.layout} onChange={(e) => updateMansion("layout", e.target.value)} /></div>
                  <div className="md:col-span-2"><FieldLabel>構造・階数</FieldLabel><Input value={mansionDetails.structure} onChange={(e) => updateMansion("structure", e.target.value)} /></div>
                  <div><FieldLabel>所在階</FieldLabel><Input value={mansionDetails.floor} onChange={(e) => updateMansion("floor", e.target.value)} /></div>
                  <div><FieldLabel>築年月</FieldLabel><Input value={mansionDetails.builtAt} onChange={(e) => updateMansion("builtAt", e.target.value)} /></div>
                  <div><FieldLabel>分譲会社</FieldLabel><Input value={mansionDetails.developer} onChange={(e) => updateMansion("developer", e.target.value)} /></div>
                  <div><FieldLabel>施工会社</FieldLabel><Input value={mansionDetails.constructor} onChange={(e) => updateMansion("constructor", e.target.value)} /></div>
                  <div><FieldLabel>総戸数</FieldLabel><Input value={mansionDetails.totalUnits} onChange={(e) => updateMansion("totalUnits", e.target.value)} /></div>
                  <div><FieldLabel>管理会社</FieldLabel><Input value={mansionDetails.managementCompany} onChange={(e) => updateMansion("managementCompany", e.target.value)} /></div>
                  <div className="md:col-span-2"><FieldLabel>管理形態</FieldLabel><Input value={mansionDetails.managementStyle} onChange={(e) => updateMansion("managementStyle", e.target.value)} /></div>
                  <div><FieldLabel>管理費 (円)</FieldLabel><Input value={mansionDetails.managementFee} onChange={(e) => updateMansion("managementFee", e.target.value)} /></div>
                  <div><FieldLabel>修繕積立金 (円)</FieldLabel><Input value={mansionDetails.reserveFund} onChange={(e) => updateMansion("reserveFund", e.target.value)} /></div>
                  <div><FieldLabel>インターネット使用料 (円)</FieldLabel><Input value={mansionDetails.internetFee} onChange={(e) => updateMansion("internetFee", e.target.value)} /></div>
                  <div><FieldLabel>合計 (円)</FieldLabel><Input value={mansionDetails.monthlyTotal} onChange={(e) => updateMansion("monthlyTotal", e.target.value)} /></div>
                  <div><FieldLabel>ガス</FieldLabel><Input value={mansionDetails.gas} onChange={(e) => updateMansion("gas", e.target.value)} /></div>
                  <div><FieldLabel>エレベーター</FieldLabel><Input value={mansionDetails.elevator} onChange={(e) => updateMansion("elevator", e.target.value)} /></div>
                  <div><FieldLabel>現状</FieldLabel><Input value={mansionDetails.currentStatus} onChange={(e) => updateMansion("currentStatus", e.target.value)} /></div>
                  <div><FieldLabel>引渡</FieldLabel><Input value={mansionDetails.handover} onChange={(e) => updateMansion("handover", e.target.value)} /></div>
                  <div className="md:col-span-2"><FieldLabel>備考</FieldLabel><Textarea rows={3} value={mansionDetails.note} onChange={(e) => updateMansion("note", e.target.value)} /></div>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-5">
              <div>
                <div className="mb-2 text-sm font-semibold text-zinc-700">分譲地特長（6個まで選択可）</div>
                <div className="flex flex-wrap gap-2">
                  {SALES_TAGS.map((tag) => {
                    const active = salesTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag, setSalesTags)}
                        className={`rounded-full border px-3 py-1.5 text-sm ${active ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-300 bg-white text-zinc-600"}`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold text-zinc-700">特徴・仕様（10個まで選択可）</div>
                <div className="flex flex-wrap gap-2">
                  {FEATURE_TAGS.map((tag) => {
                    const active = featureTags.includes(tag);
