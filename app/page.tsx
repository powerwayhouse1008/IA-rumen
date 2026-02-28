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
    propertyNo: string;
  };
};
type CategoryKey = "new-house" | "used-house" | "land" | "new-mansion" | "used-mansion";

type CategoryPreset = {
  label: string;
  propertyType: string;
  catchCopy: string;
  districts: string;
  data: ZumenData;
};

const CATEGORY_PRESETS = {
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
  "used-house": {
    label: "中古住宅仮入力",
    propertyType: "中古住宅",
    catchCopy: "内装リフォーム済みで即入居可。南向きで陽当たり良好",
    districts: "1戸",
    data: {
      price: "7980",
      name: "世田谷区桜丘 中古戸建",
      access: "小田急線 千歳船橋",
      walk: "8",
      address: "東京都世田谷区桜丘2-21-10",
    },
  },
  land: {
    label: "土地仮入力",
    propertyType: "土地",
    catchCopy: "徒歩圏内に学校や公園！毎日が便利で快適な住環境の分譲地",
    districts: "10区画",
    data: {
      price: "4980",
      name: "練馬区石神井町 売地",
      access: "西武池袋線 石神井公園",
      walk: "6",
      address: "東京都練馬区石神井町1-2-8",
    },
  },
  "new-mansion": {
    label: "新築マンション仮入力",
    propertyType: "新築分譲マンション",
    catchCopy: "駅徒歩4分×ホテルライク共用部。都心生活を格上げする1邸",
    districts: "42戸",
    data: {
      price: "13200",
      name: "パワーウェイレジデンス南青山",
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
} satisfies Record<CategoryKey, CategoryPreset>;

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
  const [contactInfo, setContactInfo] = useState({
    companyName: "株式会社パワーウェイ",
    companyPhone: "090-6695-1306",
    companyAddress: "〒101-0025 東京都千代田区神田須田町2-2 3-1芝崎ビル4F",
    companyFax: "03-5207-2768",
    licenseNo: "東京都知事（2）第101930号",
    transactionType: "一般",
    staffName: "野村",
    fee: "分かれて",
    inspectionNote: "☚内見、物件確認",
    propertyNo: "1368",
  });
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
  const [houseDetails, setHouseDetails] = useState({
    right: "所有権",
    landArea: "2718.30",
    lot: "",
    privateRoad: "",
    roadSurface: "",
    exclusiveArea: "",
    layout: "3LDK",
    structure: "RC造 5階建3階部分",
    floor: "",
    builtAt: "",
    cityPlan: "",
    zoning: "",
    buildingCoverage: "",
    floorAreaRatio: "",
    parking: "",
    water: "",
    gas: "",
    sewage: "",
    drain: "",
    status: "居住中",
    handover: "即時",
    note: `●ペット飼育不可
●駐車場 / 有（継承不可、月額10,000円）
※空き状況は管理会社へ要確認`,
  });

  const isMansionCategory = selectedCategory === "new-mansion" || selectedCategory === "used-mansion";
  const isHouseCategory = selectedCategory === "new-house" || selectedCategory === "used-house";

  const canGo = useMemo(() => data.price.trim() && data.name.trim() && data.address.trim(), [data]);

  function update<K extends keyof ZumenData>(key: K, value: ZumenData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function updateMansion(key: keyof typeof mansionDetails, value: string) {
    setMansionDetails((prev) => ({ ...prev, [key]: value }));
  }

  function updateHouse(key: keyof typeof houseDetails, value: string) {
    setHouseDetails((prev) => ({ ...prev, [key]: value }));
  }

  function updateContact(key: keyof typeof contactInfo, value: string) {
    setContactInfo((prev) => ({ ...prev, [key]: value }));
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
    const payload = { ...data, category: selectedCategory, propertyType, houseDetails, mansionDetails, contactInfo };
    localStorage.setItem("zumenData", JSON.stringify(payload));
    setSavedAt(new Date().toLocaleString("ja-JP"));
  }

  function onGenerate() {
    const payload = { ...data, category: selectedCategory, propertyType, houseDetails, mansionDetails, contactInfo };
    localStorage.setItem("zumenData", JSON.stringify(payload));
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
                  </button>
                );
              })}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <FieldLabel required>物件名</FieldLabel>
                  <Input value={data.name} onChange={(e) => update("name", e.target.value)} />
                </div>
                <div>
                  <FieldLabel required>公開先</FieldLabel>
                  <div className="flex gap-4 text-sm">
                    <label className="inline-flex items-center gap-2"><input type="checkbox" /> 一般向け公開</label>
                    <label className="inline-flex items-center gap-2"><input type="checkbox" /> 業者向け公開</label>
                  </div>
                </div>
                <div>
                  <FieldLabel required>物件管理番号</FieldLabel>
                  <Input value={managerNo} onChange={(e) => setManagerNo(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel required>物件種別</FieldLabel>
                    <Select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                      {PROPERTY_TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <FieldLabel required>取引形態</FieldLabel>
                    <Select defaultValue="売主">
                      <option>売主</option>
                      <option>媒介</option>
                    </Select>
                  </div>
                </div>
                <div>
                  <FieldLabel required>所在地</FieldLabel>
                  <Input value={data.address} onChange={(e) => update("address", e.target.value)} />
                </div>
                <div>
                  <FieldLabel required>路線 / 駅 / 駅徒歩（メイン掲載）</FieldLabel>
                  <Input value={data.access} onChange={(e) => update("access", e.target.value)} />
                  <div className="mt-2 grid grid-cols-[1fr_80px_40px] gap-2">
                    <Input placeholder="徒歩" value={data.walk} onChange={(e) => update("walk", e.target.value)} />
                    <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-center text-sm">分</div>
                    <div />
                  </div>
                </div>
                <div>
                  <FieldLabel required>価格（万円）</FieldLabel>
                  <Input value={data.price} onChange={(e) => update("price", e.target.value)} />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <FieldLabel required>キャッチコピー</FieldLabel>
                  <Input value={catchCopy} onChange={(e) => setCatchCopy(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel required>情報公開日</FieldLabel>
                    <Input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />
                  </div>
                  <div>
                    <FieldLabel required>取引条件有効期限</FieldLabel>
                    <Input type="date" value={expireDate} onChange={(e) => setExpireDate(e.target.value)} />
                  </div>
                </div>
                <div>
                  <FieldLabel required>総戸数 / 総区画数</FieldLabel>
                  <Input value={districts} onChange={(e) => setDistricts(e.target.value)} />
                </div>

                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <div className="mb-2 text-sm font-semibold">画像アップロード</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {uploadItems.map(({ key, label }) => (
                      <div key={key} className="rounded-md border border-zinc-200 bg-white p-2">
                        <div className="mb-2 text-xs text-zinc-600">{label}</div>
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

            {isHouseCategory && (
              <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <div className="mb-3 text-sm font-semibold text-zinc-700">戸建詳細（新築住宅 / 中古住宅）</div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="md:col-span-2"><FieldLabel>権利</FieldLabel><Input value={houseDetails.right} onChange={(e) => updateHouse("right", e.target.value)} /></div>
                  <div><FieldLabel>敷地面積 (㎡)</FieldLabel><Input value={houseDetails.landArea} onChange={(e) => updateHouse("landArea", e.target.value)} /></div>
                  <div><FieldLabel>地目</FieldLabel><Input value={houseDetails.lot} onChange={(e) => updateHouse("lot", e.target.value)} /></div>
                  <div><FieldLabel>私道</FieldLabel><Input value={houseDetails.privateRoad} onChange={(e) => updateHouse("privateRoad", e.target.value)} /></div>
                  <div><FieldLabel>接道舗装</FieldLabel><Input value={houseDetails.roadSurface} onChange={(e) => updateHouse("roadSurface", e.target.value)} /></div>
                  <div><FieldLabel>専有面積 (㎡)</FieldLabel><Input value={houseDetails.exclusiveArea} onChange={(e) => updateHouse("exclusiveArea", e.target.value)} /></div>
                  <div><FieldLabel>間取り</FieldLabel><Input value={houseDetails.layout} onChange={(e) => updateHouse("layout", e.target.value)} /></div>
                  <div><FieldLabel>構造・階数</FieldLabel><Input value={houseDetails.structure} onChange={(e) => updateHouse("structure", e.target.value)} /></div>
                  <div><FieldLabel>所在階</FieldLabel><Input value={houseDetails.floor} onChange={(e) => updateHouse("floor", e.target.value)} /></div>
                  <div><FieldLabel>築年月</FieldLabel><Input value={houseDetails.builtAt} onChange={(e) => updateHouse("builtAt", e.target.value)} /></div>
                  <div><FieldLabel>都市計画</FieldLabel><Input value={houseDetails.cityPlan} onChange={(e) => updateHouse("cityPlan", e.target.value)} /></div>
                  <div><FieldLabel>用途地域</FieldLabel><Input value={houseDetails.zoning} onChange={(e) => updateHouse("zoning", e.target.value)} /></div>
                  <div><FieldLabel>建ぺい率</FieldLabel><Input value={houseDetails.buildingCoverage} onChange={(e) => updateHouse("buildingCoverage", e.target.value)} /></div>
                  <div><FieldLabel>容積率</FieldLabel><Input value={houseDetails.floorAreaRatio} onChange={(e) => updateHouse("floorAreaRatio", e.target.value)} /></div>
                  <div><FieldLabel>駐車場</FieldLabel><Input value={houseDetails.parking} onChange={(e) => updateHouse("parking", e.target.value)} /></div>
                  <div><FieldLabel>飲用水</FieldLabel><Input value={houseDetails.water} onChange={(e) => updateHouse("water", e.target.value)} /></div>
                  <div><FieldLabel>ガス</FieldLabel><Input value={houseDetails.gas} onChange={(e) => updateHouse("gas", e.target.value)} /></div>
                  <div><FieldLabel>汚水</FieldLabel><Input value={houseDetails.sewage} onChange={(e) => updateHouse("sewage", e.target.value)} /></div>
                  <div><FieldLabel>雑排水</FieldLabel><Input value={houseDetails.drain} onChange={(e) => updateHouse("drain", e.target.value)} /></div>
                  <div><FieldLabel>現状</FieldLabel><Input value={houseDetails.status} onChange={(e) => updateHouse("status", e.target.value)} /></div>
                  <div><FieldLabel>引渡</FieldLabel><Input value={houseDetails.handover} onChange={(e) => updateHouse("handover", e.target.value)} /></div>
                  <div className="md:col-span-2"><FieldLabel>備考</FieldLabel><Textarea rows={4} value={houseDetails.note} onChange={(e) => updateHouse("note", e.target.value)} /></div>
                </div>
              </div>
            )}

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

            <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div className="mb-3 text-sm font-semibold text-zinc-700">会社・連絡先情報（図面フッター表示）</div>
              <div className="grid gap-3 md:grid-cols-2">
                <div><FieldLabel>会社名</FieldLabel><Input value={contactInfo.companyName} onChange={(e) => updateContact("companyName", e.target.value)} /></div>
                <div><FieldLabel>担当者</FieldLabel><Input value={contactInfo.staffName} onChange={(e) => updateContact("staffName", e.target.value)} /></div>
                <div><FieldLabel>電話番号</FieldLabel><Input value={contactInfo.companyPhone} onChange={(e) => updateContact("companyPhone", e.target.value)} /></div>
                <div><FieldLabel>FAX</FieldLabel><Input value={contactInfo.companyFax} onChange={(e) => updateContact("companyFax", e.target.value)} /></div>
                <div className="md:col-span-2"><FieldLabel>住所</FieldLabel><Input value={contactInfo.companyAddress} onChange={(e) => updateContact("companyAddress", e.target.value)} /></div>
                <div><FieldLabel>免許番号</FieldLabel><Input value={contactInfo.licenseNo} onChange={(e) => updateContact("licenseNo", e.target.value)} /></div>
                <div><FieldLabel>取引形態</FieldLabel><Input value={contactInfo.transactionType} onChange={(e) => updateContact("transactionType", e.target.value)} /></div>
                <div><FieldLabel>手数料</FieldLabel><Input value={contactInfo.fee} onChange={(e) => updateContact("fee", e.target.value)} /></div>
                <div><FieldLabel>物件号</FieldLabel><Input value={contactInfo.propertyNo} onChange={(e) => updateContact("propertyNo", e.target.value)} /></div>
                <div className="md:col-span-2"><FieldLabel>内見・物件確認文言</FieldLabel><Input value={contactInfo.inspectionNote} onChange={(e) => updateContact("inspectionNote", e.target.value)} /></div>
              </div>
            </div>

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
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag, setFeatureTags)}
                        className={`rounded-full border px-3 py-1.5 text-sm ${active ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-300 bg-white text-zinc-600"}`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-zinc-500">{savedAt ? `最終保存: ${savedAt}` : "未保存"}</div>
              <div className="flex gap-2">
                <button type="button" onClick={onSaveDraft} className="rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white">一時保存</button>
                <button type="button" onClick={onGenerate} disabled={!canGo} className="rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40">図面を生成してプレビュー</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
