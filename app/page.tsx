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
};

const PROPERTY_TYPE_OPTIONS = ["中古マンション", "新築分譲マンション", "新築分譲住宅", "中古住宅", "土地"];

const SALES_TAGS = ["# 2沿線以上利用可", "# 駐車2台可", "# 環境重視の住宅地", "# 閑静な住宅街", "# 平坦地", "# 角地"];
const FEATURE_TAGS = ["# シャワートイレ", "# DEN", "# LDKカウンターテーブル", "# ダイニング収納", "# 納戸", "# シューズクローク"];

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

  const canGo = useMemo(() => data.price.trim() && data.name.trim() && data.address.trim(), [data]);

  function update<K extends keyof ZumenData>(key: K, value: ZumenData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTag(tag: string, setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function onPick(
    key: keyof Pick<ZumenData, "imgMain" | "imgPlan" | "imgSub1" | "imgSub2" | "imgSub3">,
    file?: File
  ) {
    if (!file) return;
    const url = await fileToDataUrl(file);
    update(key, url);
  }

  function removeImage(key: keyof Pick<ZumenData, "imgMain" | "imgPlan" | "imgSub1" | "imgSub2" | "imgSub3">) {
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

  const uploadItems: Array<{ key: keyof Pick<ZumenData, "imgMain" | "imgPlan" | "imgSub1" | "imgSub2" | "imgSub3">; label: string }> = [
    { key: "imgMain", label: "全体区画図 or 住宅写真" },
    { key: "imgPlan", label: "物件メイン画像" },
    { key: "imgSub1", label: "物件サブ画像（1）" },
    { key: "imgSub2", label: "物件サブ画像（2）" },
    { key: "imgSub3", label: "物件サブ画像（3）" },
  ];

  return (
         <main className="min-h-screen bg-[#e6f4ff] text-zinc-800">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[260px,1fr]">
        <aside className="border-r border-sky-200 bg-[#f2f9ff] p-4">
          <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
            <Image src="/powerway-house-logo.svg" alt="Powerway House logo" width={120} height={120} className="mx-auto h-auto w-28 rounded-xl" priority />
            <div className="mt-3 text-center text-2xl font-extrabold tracking-tight text-sky-700">Powerway House</div>
          </div>
          <nav className="mt-8 space-y-2 text-sm">
            <div className="rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-white">ホーム</div>
            <div className="rounded-lg bg-rose-500 px-4 py-2.5 font-semibold text-white">物件新規登録</div>
            <div className="rounded-lg px-4 py-2.5 hover:bg-zinc-100">転売図面履歴</div>
            <div className="rounded-lg px-4 py-2.5 hover:bg-zinc-100">物件検索</div>
            <div className="rounded-lg px-4 py-2.5 hover:bg-zinc-100">お気に入り</div>
            <div className="rounded-lg px-4 py-2.5 hover:bg-zinc-100">プラン管理</div>
            <div className="rounded-lg px-4 py-2.5 hover:bg-zinc-100">AI図取り</div>
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
                    <Select defaultValue="中古マンション">
                      <option>中古マンション</option>
                      <option>戸建</option>
                      <option>土地</option>
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
