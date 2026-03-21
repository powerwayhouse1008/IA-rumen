"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ZumenData = {
  price: string;
  name: string;
  access: string;
  walk: string;
  address: string;
  lifeInformation?: string;
  catchCopy?: string;
  districts?: string;
  salesTags?: string[];
  featureTags?: string[];
  imgMain?: string;
  imgPlan?: string;
  imgSub1?: string;
  imgSub2?: string;
  imgSub3?: string;
  imgQr?: string;
  imgMap?: string;
  draftTitle?: string;
  themeColor?: ThemeColorKey;
  contactInfo?: {
    companyName: string;
    companyPhone: string;
    companyAddress: string;
    companyFax: string;
    companyEmail: string;
    licenseNo: string;
    transactionType: string;
    staffName: string;
    fee: string;
    inspectionNote: string;
     infoPageUrl: string;
  };
};
type DraftPayload = ZumenData & {
  draftId?: string;
  catchCopy?: string;
  districts?: string;
  salesTags?: string[];
  featureTags?: string[];
  category?: CategoryKey;
  propertyType?: string;
  houseDetails?: typeof INITIAL_HOUSE_DETAILS;
  mansionDetails?: typeof INITIAL_MANSION_DETAILS;
  rentalDetails?: typeof INITIAL_RENTAL_DETAILS;
  managerNo?: string;
  publishDate?: string;
  expireDate?: string;
  draftSavedAt?: string;
  adminQr?: AdminQrForm;
};
type StoredDraft = {
  id: string;
  savedAt: string;
  payload: DraftPayload;
};

type AdminQrForm = {
  propertyCode: string;
  propertyId?: string;
  inquiryUrl?: string;
  buildingName: string;
  address: string;
  viewMethod: string;
  price: string;
  available: string;
  managerName: string;
  managerEmail: string;
};

type CategoryKey = "new-house" | "used-house" | "land" | "new-mansion" | "used-mansion" | "rental";
type ThemeColorKey = "sunset-red" | "ocean-blue" | "forest-green" | "royal-purple" | "charcoal-gold" | "sky-blue";

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
   rental: {
    label: "賃貸仮入力",
    propertyType: "賃貸",
    catchCopy: "駅近×生活利便。都市型ライフスタイルに合う賃貸レジデンス",
    districts: "1室",
    data: {
      price: "113800",
      name: "目黒マンション X1号室",
      access: "JR山手線 目黒",
      walk: "7",
      address: "東京都目黒区下目黒2-20-5",
    },
  },
};

const PROPERTY_TYPE_OPTIONS = ["中古マンション", "賃貸", "新築分譲マンション", "新築分譲住宅", "中古住宅", "土地"];

const SALES_TAGS = ["# 2沿線以上利用可", "# 駐車2台可", "# 環境重視の住宅地", "# 閑静な住宅街", "# 平坦地", "# 角地"];
const FEATURE_TAGS = ["# シャワートイレ", "# DEN", "# LDKカウンターテーブル", "# ダイニング収納", "# 納戸", "# シューズクローク"];
const DEFAULT_QR_NOTE = "☚内見、物件確認";
const DEFAULT_LIFE_INFORMATION_ROWS = [
  "□スーパー 徒歩6分",
  "□小学校 徒歩7分",
  "□総合病院 徒歩12分",
  "□公園 徒歩3分",
  "□コンビニ 徒歩4分",
  "□ドラッグストア 徒歩8分",
];
const DEFAULT_LIFE_INFORMATION_TEXT = DEFAULT_LIFE_INFORMATION_ROWS.join("\n");
const DEFAULT_CATEGORY: CategoryKey = "new-house";
const DEFAULT_MANAGER_NO = "12345678";
const DEFAULT_PUBLISH_DATE = "2025-06-01";
const DEFAULT_EXPIRE_DATE = "2025-12-31";
const DEFAULT_CONTACT_INFO = {
  companyName: "株式会社パワーウェイ",
  companyPhone: "090-6695-1306",
  companyAddress: "〒101-0025 東京都千代田区神田須田町2-2 3-1芝崎ビル4F",
  companyFax: "03-5207-2768",
  companyEmail: "lianghf2000@gmail.com",
  licenseNo: "東京都知事（2）第101930号",
  transactionType: "一般",
  staffName: "野村",
  fee: "分かれて",
  inspectionNote: DEFAULT_QR_NOTE,
  infoPageUrl: "",
};
const DEFAULT_ADMIN_QR_FORM: AdminQrForm = {
  propertyCode: "",
  propertyId: "",
  inquiryUrl: "",
  buildingName: "",
  address: "",
  price: "",
  viewMethod: "",
  available: "募集中",
  managerName: "",
  managerEmail: "",
};
const SHARED_QR_COUNTER_STORAGE_KEY = "sharedQrPropertyCodeCounter";
const ZUMEN_DRAFTS_STORAGE_KEY = "zumenDrafts";
const SHARED_QR_CODE_PREFIX = "P";
const SHARED_QR_INITIAL_CODE = 1241;
const INITIAL_MANSION_DETAILS = {
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
};
const INITIAL_RENTAL_DETAILS = {
  rent: "113800",
  commonFee: "15000",
  depositGuarantee: "なし",
  renewalFee: "1ヶ月",
  keyMoney: "1ヶ月",
  securityDeposit: "1ヶ月",
  exclusiveArea: "18.31",
};

const INITIAL_HOUSE_DETAILS = {
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
};
function loadStoredDrafts(): StoredDraft[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(ZUMEN_DRAFTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredDraft[];
  } catch {
    return [];
  }
}

function loadDraftPayload(): DraftPayload | null {
  if (typeof window === "undefined") return null;
const searchParams = new URLSearchParams(window.location.search);
  const draftId = searchParams.get("draftId")?.trim();
  if (draftId) {
    const found = loadStoredDrafts().find((item) => item.id === draftId);
    if (found?.payload) {
      return { ...found.payload, draftId: found.id };
    }
  }

  const runtimePayload = (window as Window & { __zumenPayload?: DraftPayload }).__zumenPayload;
  if (runtimePayload) return runtimePayload;

  const saved = localStorage.getItem("zumenData");
  if (!saved) return null;

  try {
    return JSON.parse(saved) as DraftPayload;
  } catch {
    return null;
  }
}


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
      className={`w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white ${props.className ?? ""}`}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white ${props.className ?? ""}`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white ${props.className ?? ""}`}
    />
  );
}

async function optimizeImageFile(file: File): Promise<Blob | null> {
  const imageBitmap = await createImageBitmap(file);
  const maxDimension = 1600;
  const scale = Math.min(1, maxDimension / Math.max(imageBitmap.width, imageBitmap.height));
  const targetWidth = Math.max(1, Math.round(imageBitmap.width * scale));
  const targetHeight = Math.max(1, Math.round(imageBitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    imageBitmap.close();
    return null;
  }

  context.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);
  imageBitmap.close();

  const outputType =
    file.type === "image/png"
      ? "image/png"
      : file.type === "image/webp"
        ? "image/webp"
        : "image/jpeg";
 const outputBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), outputType, 0.82);
  });
  return outputBlob;
}

type UploadedImageResult = {
  publicUrl: string;
};

async function uploadImageToSupabase(file: File): Promise<string> {
  const optimizedBlob =
    file.type.startsWith("image/") && file.type !== "image/gif" && file.type !== "image/svg+xml"
      ? await optimizeImageFile(file)
      : null;

  const uploadBlob = optimizedBlob ?? file;
  const extFromName = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : undefined;
  const mimeExt = uploadBlob.type.split("/")[1]?.toLowerCase();
  const extension = extFromName || mimeExt || "jpg";
  const uploadFile = new File([uploadBlob], file.name || `image.${extension}`, {
    type: uploadBlob.type || file.type || "image/jpeg",
  });

  const formData = new FormData();
  formData.append("file", uploadFile);
  formData.append("extension", extension);

  const response = await fetch("/api/zumen-images", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errorPayload?.error || "Image upload failed");
  }

  const payload = (await response.json()) as UploadedImageResult;
  if (!payload.publicUrl) {
    throw new Error("Missing uploaded image URL");
  }

  return payload.publicUrl;
}

const STORAGE_IMAGE_KEYS: Array<keyof Pick<
  DraftPayload,
   "imgMain" | "imgPlan" | "imgSub1" | "imgSub2" | "imgSub3" | "imgQr" | "imgMap"
>> = ["imgMain", "imgPlan", "imgSub1", "imgSub2", "imgSub3", "imgQr", "imgMap"];

function createStorageSafePayload(payload: DraftPayload): { payload: DraftPayload; strippedImages: boolean } {
  let strippedImages = false;
  const stripDataUrlDeep = (value: unknown): unknown => {
    if (typeof value === "string") {
      if (value.startsWith("data:")) {
        strippedImages = true;
        return "";
      }
      return value;
    }
    if (Array.isArray(value)) {
      return value.map((item) => stripDataUrlDeep(item));
    }
    if (value && typeof value === "object") {
      const nextObject: Record<string, unknown> = {};
      for (const [key, childValue] of Object.entries(value as Record<string, unknown>)) {
        nextObject[key] = stripDataUrlDeep(childValue);
      }
      return nextObject;
    }
    return value;
  };

  const nextPayload = stripDataUrlDeep({ ...payload }) as DraftPayload;

  for (const key of STORAGE_IMAGE_KEYS) {
    const value = nextPayload[key];
    if (typeof value === "string" && value.startsWith("data:")) {
      nextPayload[key] = "";
      strippedImages = true;
    }
  }

  return { payload: nextPayload, strippedImages };
}

function savePayloadToStorage(payload: DraftPayload): { localSaved: boolean; strippedImages: boolean } {
  if (typeof window === "undefined") {
    return { localSaved: false, strippedImages: false };
  }
  
  let localSaved = false;
  let strippedImages = false;
  try {
    localStorage.setItem("zumenData", JSON.stringify(payload));
    localSaved = true;
  } catch {
    const fallback = createStorageSafePayload(payload);
    strippedImages = fallback.strippedImages;

    try {
      localStorage.setItem("zumenData", JSON.stringify(fallback.payload));
      localSaved = true;
    } catch {
      localSaved = false;
    }
  }

  (window as Window & { __zumenPayload?: DraftPayload }).__zumenPayload = payload;
  return { localSaved, strippedImages };
}
function saveDraftToCollection(payload: DraftPayload, draftId?: string): { localSaved: boolean; draftId: string; strippedImages: boolean } {
  if (typeof window === "undefined") {
   return { localSaved: false, draftId: draftId ?? "", strippedImages: false };
  }

  const id = draftId ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const savedAt = new Date().toLocaleString("ja-JP");
  const nextPayload = { ...payload, draftId: id, draftSavedAt: savedAt };
  const currentDrafts = loadStoredDrafts();
  let strippedImages = false;
  const filtered = currentDrafts.filter((item) => item.id !== id);
  const nextDrafts: StoredDraft[] = [{ id, savedAt, payload: nextPayload }, ...filtered];

  let localSaved = false;
  let draftsToPersist = [...nextDrafts];

  while (draftsToPersist.length > 0) {
    try {
      localStorage.setItem(ZUMEN_DRAFTS_STORAGE_KEY, JSON.stringify(draftsToPersist));
      localSaved = true;
      break;
    } catch {
      if (draftsToPersist[0]?.id === id) {
        const storageSafeDraft = createStorageSafePayload(draftsToPersist[0].payload as DraftPayload);
        draftsToPersist[0] = {
          ...draftsToPersist[0],
          payload: storageSafeDraft.payload,
        };
        strippedImages = strippedImages || storageSafeDraft.strippedImages;
        continue;
      }
      draftsToPersist = draftsToPersist.slice(0, -1);
    }
  }

  if (!localSaved) {
    try {
      localStorage.removeItem(ZUMEN_DRAFTS_STORAGE_KEY);
    } catch {
      // no-op
    }
  }

  return { localSaved, draftId: id, strippedImages };
}
async function loadDraftFromSupabase(draftId: string): Promise<StoredDraft | null> {
  try {
    const res = await fetch(`/api/zumen-drafts?draftId=${encodeURIComponent(draftId)}`);
    if (!res.ok) return null;
    const json = (await res.json()) as { drafts?: StoredDraft[] };
    const draft = json.drafts?.[0] ?? null;
    if (!draft) return null;

    const currentDrafts = loadStoredDrafts();
    const mergedDrafts = [draft, ...currentDrafts.filter((item) => item.id !== draft.id)];
    try {
      localStorage.setItem(ZUMEN_DRAFTS_STORAGE_KEY, JSON.stringify(mergedDrafts));
    } catch {
      // localStorage quota exceededでもSupabase取得結果は返す
    }
    return draft;
  } catch {
    return null;
  }
}

type SupabaseSyncStatus = "success" | "success_stripped" | "skipped" | "failed";
function extractErrorMessage(value: unknown): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";

  const errorValue = (value as { error?: unknown }).error;
  if (typeof errorValue === "string") return errorValue;
  if (errorValue && typeof errorValue === "object") {
    const nestedMessage = extractErrorMessage(errorValue);
    if (nestedMessage) return nestedMessage;
  }

  const messageValue = (value as { message?: unknown }).message;
  if (typeof messageValue === "string") return messageValue;

  return "";
}

function isSupabaseConfigMissingError(errorMessage: string): boolean {
  if (!errorMessage) return false;
  return /supabase.*(not configured|unconfigured|missing|未設定|環境変数)/i.test(errorMessage);
}

async function syncDraftToSupabase(draft: StoredDraft): Promise<SupabaseSyncStatus> {
  try {
    const syncPayload = async (payload: StoredDraft) =>
      fetch("/api/zumen-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    const res = await syncPayload(draft);
    if (res.ok) return "success";
   
    const json = (await res.json().catch(() => null)) as unknown;
    const primaryError = extractErrorMessage(json);
    if (isSupabaseConfigMissingError(primaryError)) {
    return "skipped";
    }
    
    const fallback = createStorageSafePayload(draft.payload as DraftPayload);
    if (fallback.strippedImages) {
      const fallbackRes = await syncPayload({ ...draft, payload: fallback.payload });
      if (fallbackRes.ok) return "success_stripped";
        const fallbackJson = (await fallbackRes.json().catch(() => null)) as unknown;
      const fallbackError = extractErrorMessage(fallbackJson);
      if (isSupabaseConfigMissingError(fallbackError)) {
        return "skipped";
      }
    }

    return "failed";
  } catch {
    return "failed";
  }
}

export default function Page() {
  const router = useRouter();

  const initialDraft = useMemo(() => loadDraftPayload(), []);
  const initialCategory = initialDraft?.category ?? DEFAULT_CATEGORY;
  const initialCategoryPreset = CATEGORY_PRESETS[initialCategory];
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>(initialCategory);
  const [propertyType, setPropertyType] = useState(initialDraft?.propertyType ?? initialCategoryPreset.propertyType);
  const [data, setData] = useState<ZumenData>({
     ...initialCategoryPreset.data,
    ...initialDraft,
    lifeInformation: initialDraft?.lifeInformation ?? initialCategoryPreset.data.lifeInformation ?? DEFAULT_LIFE_INFORMATION_TEXT,
  });
   const [catchCopy, setCatchCopy] = useState(initialDraft?.catchCopy ?? initialCategoryPreset.catchCopy);
  const [managerNo, setManagerNo] = useState(initialDraft?.managerNo ?? DEFAULT_MANAGER_NO);
  const [publishDate, setPublishDate] = useState(initialDraft?.publishDate ?? DEFAULT_PUBLISH_DATE);
  const [expireDate, setExpireDate] = useState(initialDraft?.expireDate ?? DEFAULT_EXPIRE_DATE);
  const [districts, setDistricts] = useState(initialDraft?.districts ?? initialCategoryPreset.districts);
  const [savedAt, setSavedAt] = useState<string>(initialDraft?.draftSavedAt ?? "");
  const [activeDraftId, setActiveDraftId] = useState<string | undefined>(initialDraft?.draftId);
  const [draftTitle, setDraftTitle] = useState(initialDraft?.draftTitle ?? "");
  const [saveMessage, setSaveMessage] = useState("");
  const [saveMessageTone, setSaveMessageTone] = useState<"success" | "warning" | "error">("success");
  const [qrSyncMessage, setQrSyncMessage] = useState("");
  const [isSyncingQr, setIsSyncingQr] = useState(false);
  const [salesTags, setSalesTags] = useState<string[]>(initialDraft?.salesTags ?? []);
  const [featureTags, setFeatureTags] = useState<string[]>(initialDraft?.featureTags ?? []);
  const [contactInfo, setContactInfo] = useState(initialDraft?.contactInfo ?? DEFAULT_CONTACT_INFO);
  const [themeColor, setThemeColor] = useState<ThemeColorKey>(initialDraft?.themeColor ?? "sunset-red");
  const [highlightSection, setHighlightSection] = useState<"basic" | "house" | "mansion" | "contact" | null>(null);
  const [mansionDetails, setMansionDetails] = useState({
     ...(initialDraft?.mansionDetails ?? INITIAL_MANSION_DETAILS),
  });
  const [houseDetails, setHouseDetails] = useState({
     ...(initialDraft?.houseDetails ?? INITIAL_HOUSE_DETAILS),
  });
  const [rentalDetails, setRentalDetails] = useState({
    ...(initialDraft?.rentalDetails ?? INITIAL_RENTAL_DETAILS),
  });
  const [adminQrForm, setAdminQrForm] = useState<AdminQrForm>({
    ...DEFAULT_ADMIN_QR_FORM,
    ...(initialDraft?.adminQr ?? {}),
    buildingName: initialDraft?.adminQr?.buildingName ?? initialDraft?.name ?? "",
    address: initialDraft?.adminQr?.address ?? initialDraft?.address ?? "",
    price: initialDraft?.adminQr?.price ?? initialDraft?.price ?? "",
    managerName: initialDraft?.adminQr?.managerName ?? initialDraft?.contactInfo?.staffName ?? "",
    managerEmail: initialDraft?.adminQr?.managerEmail ?? initialDraft?.contactInfo?.companyEmail ?? "",
  });
useEffect(() => {
    const draftIdParam = new URLSearchParams(window.location.search).get("draftId")?.trim();
    if (!draftIdParam || initialDraft?.draftId === draftIdParam) return;

    let isMounted = true;
    void loadDraftFromSupabase(draftIdParam).then((remoteDraft) => {
      if (!isMounted || !remoteDraft?.payload) return;

      const payload = remoteDraft.payload as DraftPayload;
      const category = (payload.category as CategoryKey | undefined) ?? DEFAULT_CATEGORY;
      const preset = CATEGORY_PRESETS[category];

      setSelectedCategory(category);
      setPropertyType((payload.propertyType as string | undefined) ?? preset.propertyType);
      setData({
        ...preset.data,
        ...(payload as ZumenData),
        lifeInformation:
          (payload.lifeInformation as string | undefined) ??
          preset.data.lifeInformation ??
          DEFAULT_LIFE_INFORMATION_TEXT,
      });
      setCatchCopy((payload.catchCopy as string | undefined) ?? preset.catchCopy);
      setDistricts((payload.districts as string | undefined) ?? preset.districts);
      setSalesTags((payload.salesTags as string[] | undefined) ?? []);
      setFeatureTags((payload.featureTags as string[] | undefined) ?? []);
      setContactInfo((payload.contactInfo as typeof DEFAULT_CONTACT_INFO | undefined) ?? DEFAULT_CONTACT_INFO);
      setThemeColor((payload.themeColor as ThemeColorKey | undefined) ?? "sunset-red");
      setManagerNo((payload.managerNo as string | undefined) ?? DEFAULT_MANAGER_NO);
      setPublishDate((payload.publishDate as string | undefined) ?? DEFAULT_PUBLISH_DATE);
      setExpireDate((payload.expireDate as string | undefined) ?? DEFAULT_EXPIRE_DATE);
      setDraftTitle((payload.draftTitle as string | undefined) ?? "");
      setSavedAt((payload.draftSavedAt as string | undefined) ?? remoteDraft.savedAt ?? "");
      setActiveDraftId(remoteDraft.id);
      setHouseDetails({ ...(payload.houseDetails as typeof INITIAL_HOUSE_DETAILS | undefined ?? INITIAL_HOUSE_DETAILS) });
      setMansionDetails({ ...(payload.mansionDetails as typeof INITIAL_MANSION_DETAILS | undefined ?? INITIAL_MANSION_DETAILS) });
      setRentalDetails({ ...(payload.rentalDetails as typeof INITIAL_RENTAL_DETAILS | undefined ?? INITIAL_RENTAL_DETAILS) });
      setAdminQrForm({ ...(payload.adminQr as AdminQrForm | undefined ?? DEFAULT_ADMIN_QR_FORM) });
      savePayloadToStorage(payload);
    });

    return () => {
      isMounted = false;
    };
  }, [initialDraft?.draftId]);

  const normalizedPropertyType = propertyType.trim();
  const isMansionCategory = normalizedPropertyType.includes("マンション") || selectedCategory === "new-mansion" || selectedCategory === "used-mansion";
  const isHouseCategory = normalizedPropertyType.includes("住宅") || selectedCategory === "new-house" || selectedCategory === "used-house";
  const isRentalCategory = normalizedPropertyType.includes("賃貸") || selectedCategory === "rental";
  const canGo = useMemo(() => data.price.trim() && data.name.trim() && data.address.trim(), [data]);
  const saveStatusTitle =
    saveMessageTone === "success" ? "保存完了" : saveMessageTone === "warning" ? "保存注意" : "保存エラー";
  const saveToneBadgeClass =
    saveMessageTone === "success"
      ? "bg-sky-100 text-sky-700"
      : saveMessageTone === "warning"
        ? "bg-amber-100 text-amber-700"
        : "bg-rose-100 text-rose-700";
  const saveToneTextClass =
    saveMessageTone === "success" ? "text-sky-700" : saveMessageTone === "warning" ? "text-amber-700" : "text-rose-700";
  const saveToneIcon = saveMessageTone === "success" ? "✓" : saveMessageTone === "warning" ? "!" : "×";
  function update<K extends keyof ZumenData>(key: K, value: ZumenData[K]) {
    setHighlightSection("basic");
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function updateMansion(key: keyof typeof mansionDetails, value: string) {
    setHighlightSection("mansion");
    setMansionDetails((prev) => ({ ...prev, [key]: value }));
  }

  function updateHouse(key: keyof typeof houseDetails, value: string) {
    setHighlightSection("house");
    setHouseDetails((prev) => ({ ...prev, [key]: value }));
  }
 function updateRental(key: keyof typeof rentalDetails, value: string) {
    setHighlightSection("mansion");
    setRentalDetails((prev) => ({ ...prev, [key]: value }));
  }

  function updateContact(key: keyof typeof contactInfo, value: string) {
    setHighlightSection("contact");
    setContactInfo((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTag(tag: string, max: number, setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }
      if (prev.length >= max) {
        return prev;
      }
      return [...prev, tag];
    });
  }

  async function onPick(
    key: keyof Pick<ZumenData, "imgMain" | "imgPlan" | "imgSub1" | "imgSub2" | "imgSub3" | "imgQr" | "imgMap">,
    file?: File
  ) {
    if (!file) return;
     try {
      const uploadedUrl = await uploadImageToSupabase(file);
      update(key, uploadedUrl);
      setSaveMessage("画像を圧縮してSupabase Storageへアップロードしました。");
      setSaveMessageTone("success");
    } catch (error) {
      console.error("image upload error:", error);
      setSaveMessage("画像アップロードに失敗しました。設定または通信状態をご確認ください。");
      setSaveMessageTone("error");
    }
  }

  function removeImage(key: keyof Pick<ZumenData, "imgMain" | "imgPlan" | "imgSub1" | "imgSub2" | "imgSub3" | "imgQr" | "imgMap">) {
    update(key, undefined);
  }

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

  function readSharedQrCounter() {
    if (typeof window === "undefined") return SHARED_QR_INITIAL_CODE;
    const raw = localStorage.getItem(SHARED_QR_COUNTER_STORAGE_KEY);
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < SHARED_QR_INITIAL_CODE) {
      return SHARED_QR_INITIAL_CODE;
    }
    return Math.floor(parsed);
  }

  function reserveNextSharedPropertyCode() {
    const current = readSharedQrCounter();
    const next = current + 1;
    if (typeof window !== "undefined") {
      localStorage.setItem(SHARED_QR_COUNTER_STORAGE_KEY, String(next));
    }
    return `${SHARED_QR_CODE_PREFIX}${current}`;
  }


  function updateAdminQr<K extends keyof AdminQrForm>(key: K, value: AdminQrForm[K]) {
    setAdminQrForm((prev) => ({ ...prev, [key]: value }));
  }

  async function createSharedQr() {
    const propertyCode = adminQrForm.propertyCode.trim() || reserveNextSharedPropertyCode();
    const propertyId = adminQrForm.propertyId?.trim() || crypto.randomUUID();
    const inquiryUrl = `https://qr.powerway.house/inquiry?property_id=${encodeURIComponent(propertyId)}&via=qrcode`;
    const qrServiceUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(inquiryUrl)}`;
    const proxiedQrUrl = `/api/image-proxy?url=${encodeURIComponent(qrServiceUrl)}`;
    const nextForm = { ...adminQrForm, propertyCode, propertyId, inquiryUrl };

    setIsSyncingQr(true);
    setQrSyncMessage("");

    try {
      const syncRes = await fetch("/api/admin-qr/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          propertyCode,
          buildingName: nextForm.buildingName,
          address: nextForm.address,
          price: nextForm.price,
          viewMethod: nextForm.viewMethod,
          status: nextForm.available,
          managerName: nextForm.managerName,
          managerEmail: nextForm.managerEmail,
          formUrl: inquiryUrl,
          qrUrl: qrServiceUrl,
        }),
      });

      const syncJson = (await syncRes.json().catch(() => ({}))) as { error?: string };
      if (!syncRes.ok) {
        throw new Error(syncJson.error || "Supabase sync failed");
      }

      setQrSyncMessage("Supabase同期完了");
      setSaveMessageTone("success");
      setSaveMessage("QR作成＋Supabase同期に成功しました。");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Supabase同期に失敗しました。";
      setQrSyncMessage(`同期エラー: ${msg}`);
      setSaveMessageTone("error");
      setSaveMessage("QRは作成しましたが、Supabase同期でエラーが発生しました。");
    } finally {
      setIsSyncingQr(false);
      setTimeout(() => {
        setSaveMessage("");
      }, 3200);
    }

    setAdminQrForm(nextForm);
    setData((prev) => ({
      ...prev,
      name: nextForm.buildingName,
      address: nextForm.address,
      imgQr: proxiedQrUrl,
    }));
    setContactInfo((prev) => ({
      ...prev,
      staffName: nextForm.managerName,
      companyEmail: nextForm.managerEmail,
      infoPageUrl: inquiryUrl,
    }));
  }

  async function buildPayload() {
    const generatedMap = await createAddressMap(data.address);

    const payload = {
      ...data,
      imgMap: generatedMap ?? data.imgMap,
      imgQr: data.imgQr,
      catchCopy,
      districts,
      salesTags,
      featureTags,
      category: selectedCategory,
      propertyType,
      houseDetails,
      mansionDetails,
      rentalDetails,
      contactInfo,
      themeColor,
       managerNo,
      publishDate,
      expireDate,
      adminQr: adminQrForm,
      draftTitle,
    };
    
    if (generatedMap) {
      setData((prev) => ({ ...prev, imgMap: generatedMap }));
    }
 
    return payload;
     }
     function saveCurrentDraftSnapshot() {
     const payload: DraftPayload = {
      ...data,
      catchCopy,
      districts,
      salesTags,
      featureTags,
      category: selectedCategory,
      propertyType,
      houseDetails,
      mansionDetails,
      rentalDetails,
      contactInfo,
      themeColor,
      managerNo,
      publishDate,
      expireDate,
      adminQr: adminQrForm,
      draftTitle,
    };
    savePayloadToStorage(payload);
   }

  function goToAddressMapGenerator() {
    saveCurrentDraftSnapshot();
    const query = new URLSearchParams({
      address: data.address ?? "",
    });
    router.push(`/address-map?${query.toString()}`);
  }
   async function onTemporarySave() {
    const payload = (await buildPayload()) as DraftPayload;
    const result = savePayloadToStorage(payload);
    const temporarySavedAt = new Date().toLocaleString("ja-JP");
    setSavedAt(temporarySavedAt);

    if (result.localSaved) {
      setSaveMessageTone(result.strippedImages ? "warning" : "success");
      setSaveMessage(
        result.strippedImages
          ? "一時保存しました（保存容量の制限により画像データを除外しました）。"
          : "一時保存しました（この端末の一時メモリのみ）。"
      );
    } else {
      setSaveMessageTone("error");
      setSaveMessage("一時保存に失敗しました。ブラウザ容量をご確認ください。");
    }

    setTimeout(() => {
      setSaveMessage("");
    }, 3200);
  }

  async function onSaveDraft() {
    const payload = (await buildPayload()) as DraftPayload;
    const defaultDraftTitle = draftTitle.trim() || payload.name || "無題の保存データ";
   const inputDraftTitle = window.prompt("保存名を入力してください（図面作成済に保存されます）", defaultDraftTitle);
    if (inputDraftTitle === null) return;
    const normalizedDraftTitle = inputDraftTitle.trim() || defaultDraftTitle;
    setDraftTitle(normalizedDraftTitle);
    const now = new Date();
    const draftSavedAt = now.toLocaleString("ja-JP");
    const draftSavedAtIso = now.toISOString();
   const draftPayload = {
      ...payload,
      draftTitle: normalizedDraftTitle,
      draftSavedAt,
      draftId: activeDraftId,
    };
   const result = savePayloadToStorage(draftPayload);
    const collectionResult = saveDraftToCollection(draftPayload, activeDraftId);
    if (collectionResult.draftId) {
      setActiveDraftId(collectionResult.draftId);
    }
     const supabaseSyncStatus = await syncDraftToSupabase({
      id: collectionResult.draftId,
      savedAt: draftSavedAtIso,
      payload: { ...draftPayload, draftId: collectionResult.draftId },
    });
    const supabaseSaved = supabaseSyncStatus === "success" || supabaseSyncStatus === "success_stripped";
    const supabaseStrippedImages = supabaseSyncStatus === "success_stripped";
    setSavedAt(draftSavedAt);
    const hasDraftListSaved = collectionResult.localSaved || supabaseSaved;
    if (hasDraftListSaved) {
      setSaveMessageTone(
        supabaseSyncStatus === "failed" && collectionResult.localSaved ? "warning" : "success"
      );
    if (collectionResult.localSaved && supabaseSaved) {
        if (result.localSaved) {
         setSaveMessage(
            result.strippedImages || collectionResult.strippedImages || supabaseStrippedImages
              ? "名前付き保存が完了しました（反映・Supabase同期済み。容量制限により一部画像データを除外しました）。"
              : "名前付き保存が完了しました（図面作成済（保存データ）に反映・Supabase同期済み）。"
          );
        } else {
          setSaveMessage("名前付き保存が完了しました（図面作成済（保存データ）・Supabaseには反映済み、下書きキャッシュのみ未保存）。");
        }
      } else if (collectionResult.localSaved) {
         setSaveMessage(
          collectionResult.strippedImages || result.strippedImages
            ? supabaseSyncStatus === "skipped"
              ? "名前付き保存が完了しました（端末保存時に容量制限のため画像データを除外しました。Supabase未設定のためローカル保存のみ実施しました）。"
              : "名前付き保存は端末で完了しました（端末保存時に容量制限のため画像データを除外しました。Supabase同期は失敗しました）。"
            : supabaseSyncStatus === "skipped"
              ? "名前付き保存が完了しました（この端末には保存済み。Supabase未設定のためローカル保存のみ実施しました）。"
              : "名前付き保存は端末で完了しました（この端末には保存済み、Supabase同期は失敗しました）。"
        );
       } else if (supabaseSaved) {
        setSaveMessage("名前付き保存が完了しました（Supabaseには反映済み、端末内の保存領域不足のためローカル保存はスキップされました）。");
     } else if (result.localSaved) {
      setSaveMessageTone("warning");
      setSaveMessage("名前付き保存は未完了です（下書きキャッシュのみ保存）。この状態では「作成図面済」に表示されません。ブラウザ容量または通信状態をご確認ください。");
      }
    } else {
      setSaveMessageTone("error");
       setSaveMessage("名前付き保存に失敗しました。ブラウザ容量または通信状態をご確認ください。");
    }
    setTimeout(() => {
      setSaveMessage("");
    }, 3200);
  }

  async function onGenerate() {
    const payload = (await buildPayload()) as DraftPayload;
    savePayloadToStorage(payload);
    router.push("/zumen");
  }
　 

  function onSelectCategory(category: CategoryKey) {
    const preset = CATEGORY_PRESETS[category];
    setSelectedCategory(category);
    setData({
      ...preset.data,
      lifeInformation: preset.data.lifeInformation ?? DEFAULT_LIFE_INFORMATION_TEXT,
    });
    setCatchCopy(preset.catchCopy);
    setDistricts(preset.districts);
    setPropertyType(preset.propertyType);
  }

 const uploadItems: Array<{ key: keyof Pick<ZumenData, "imgMain" | "imgPlan" | "imgSub1" | "imgSub2" | "imgSub3" | "imgMap">; label: string }> = [
    { key: "imgMain", label: "全体区画図 or 住宅写真" },
    { key: "imgMap", label: "現地MAP（住所から自動生成）" },
    { key: "imgPlan", label: "物件メイン画像" },
    { key: "imgSub1", label: "物件サブ画像（1）" },
    { key: "imgSub2", label: "物件サブ画像（2）" },
    { key: "imgSub3", label: "物件サブ画像（3）" },
   
  ];
　　function goToSavedZumen() {
    router.push("/zumen?view=saved");
  }

  return (
   <main className="min-h-screen bg-[#e6f4ff] p-4 text-zinc-800 md:p-6">
     {saveMessage && (
        <div className="pointer-events-none fixed right-4 top-4 z-50 max-w-xs rounded-xl border border-zinc-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
          <div className="flex items-start gap-2">
            <span
              className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
               saveToneBadgeClass
              }`}
              aria-hidden="true"
            >
              {saveToneIcon}
            </span>
            <div>
               <div className={`text-xs font-semibold ${saveToneTextClass}`}>
                {saveStatusTitle}
              </div>
              <div className="text-[11px] text-zinc-500">{savedAt ? `最終保存: ${savedAt}` : "未保存"}</div>
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto w-full max-w-[1500px]">
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Image src="/powerway-house-logo.svg" alt="Powerway House logo" width={56} height={56} className="h-14 w-14 rounded-xl" priority />
               <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={goToSavedZumen}
                  className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  作成図面済
                </button>
                <a
                  href="https://qr.powerway.house/admin"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  QR 管理
                </a>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
               <button type="button" onClick={onTemporarySave} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">一時保存（メモリのみ）</button>
              <button type="button" onClick={onSaveDraft} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white">名前を付けて保存</button>
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
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <div className="mb-2 text-sm font-semibold text-zinc-700">物件登録 + QR（admin共通）</div>
                  <div className="mb-2 text-sm text-zinc-700">次のコード: <span className="font-semibold">{adminQrForm.propertyCode || `${SHARED_QR_CODE_PREFIX}${readSharedQrCounter()}`}</span>（自動採番）</div>
                  <div className="mb-2 text-xs text-zinc-500">property_id: {adminQrForm.propertyId || "(自動生成)"}</div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <Input value={adminQrForm.buildingName} onChange={(e) => updateAdminQr("buildingName", e.target.value)} placeholder="建物名 (building_name)" />
                    <Input value={adminQrForm.address} onChange={(e) => updateAdminQr("address", e.target.value)} placeholder="住所 (address)" />
                    <Input value={adminQrForm.price} onChange={(e) => updateAdminQr("price", e.target.value)} placeholder="価額 (price)" />
                    <Input value={adminQrForm.viewMethod} onChange={(e) => updateAdminQr("viewMethod", e.target.value)} placeholder="内見方法 (view_method)" />
                    <Select value={adminQrForm.available} onChange={(e) => updateAdminQr("available", e.target.value)}>
                      <option value="募集中">募集中 (available)</option>
                      <option value="停止中">停止中 (unavailable)</option>
                      <option value="申込有り">申込有り (pending)</option>
                      <option value="成約">成約 (sold)</option>
                      <option value="賃貸中">賃貸中 (rented)</option>
                    </Select>
                    <Input value={adminQrForm.managerName} onChange={(e) => updateAdminQr("managerName", e.target.value)} placeholder="担当者名 (manager_name)" />
                    <Input value={adminQrForm.managerEmail} onChange={(e) => updateAdminQr("managerEmail", e.target.value)} placeholder="担当者メール (manager_email)" />
                  </div>
                  <button type="button" onClick={createSharedQr} disabled={isSyncingQr} className="mt-3 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{isSyncingQr ? "Syncing..." : "Create + QR"}</button>
                  {adminQrForm.inquiryUrl ? (
                    <a
                      href={adminQrForm.inquiryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block break-all text-xs text-emerald-700 underline"
                    >
                      {adminQrForm.inquiryUrl}
                    </a>
                  ) : null}
                  {qrSyncMessage ? <div className="mt-1 text-xs text-zinc-600">{qrSyncMessage}</div> : null}
                </div>
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
                <div>
                  <FieldLabel>LIFE INFORMATION（1行ずつ入力・最大6行）</FieldLabel>
                  <Textarea
                    rows={6}
                    value={data.lifeInformation ?? ""}
                    onChange={(e) => update("lifeInformation", e.target.value)}
                   placeholder={DEFAULT_LIFE_INFORMATION_TEXT}
                  />
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
                  <div className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold">
                    <span>画像アップロード</span>
                    <button
                      type="button"
                      onClick={goToAddressMapGenerator}
                      className="rounded-md bg-sky-600 px-3 py-1 text-xs text-white"
                    >
                      住所から現地MAP生成
                    </button>
                  </div>
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
                  
                  <div className="mt-3 rounded-md border border-zinc-200 bg-white p-3">
                    <div className="mb-2 text-xs font-semibold text-zinc-700">物件QRコード（右フッター表示）</div>
                    <Input type="file" accept="image/*" onChange={(e) => onPick("imgQr", e.target.files?.[0])} />
                    <div className="mt-2 h-24 overflow-hidden rounded border border-zinc-200 bg-zinc-50">
                      {data.imgQr ? (
                        <div className="relative h-full">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={data.imgQr} alt="物件QRコード" className="h-full w-full object-contain" />
                          <button
                            type="button"
                            onClick={() => removeImage("imgQr")}
                            className="absolute right-1 top-1 rounded bg-black/60 px-2 py-0.5 text-xs text-white"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-zinc-400">No image</div>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-zinc-500">右側には「{DEFAULT_QR_NOTE}」の文言が表示されます。</div>
                  </div>
                </div>
              </div>
            </div>

            {isHouseCategory && (
              <div className={`mt-6 rounded-lg border p-4 transition ${highlightSection === "house" ? "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-200" : "border-zinc-200 bg-zinc-50"}`}>
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
              <div className={`mt-6 rounded-lg border p-4 transition ${highlightSection === "mansion" ? "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-200" : "border-zinc-200 bg-zinc-50"}`}>
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
              {isRentalCategory && (
              <div className={`mt-6 rounded-lg border p-4 transition ${highlightSection === "mansion" ? "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-200" : "border-zinc-200 bg-zinc-50"}`}>
                <div className="mb-3 text-sm font-semibold text-zinc-700">賃貸詳細</div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div><FieldLabel>賃　料 (円)</FieldLabel><Input value={rentalDetails.rent} onChange={(e) => updateRental("rent", e.target.value)} /></div>
                  <div><FieldLabel>共益費 (円)</FieldLabel><Input value={rentalDetails.commonFee} onChange={(e) => updateRental("commonFee", e.target.value)} /></div>
                  <div><FieldLabel>保証金</FieldLabel><Input value={rentalDetails.depositGuarantee} onChange={(e) => updateRental("depositGuarantee", e.target.value)} /></div>
                  <div><FieldLabel>更新料</FieldLabel><Input value={rentalDetails.renewalFee} onChange={(e) => updateRental("renewalFee", e.target.value)} /></div>
                  <div><FieldLabel>礼　金</FieldLabel><Input value={rentalDetails.keyMoney} onChange={(e) => updateRental("keyMoney", e.target.value)} /></div>
                  <div><FieldLabel>敷　金</FieldLabel><Input value={rentalDetails.securityDeposit} onChange={(e) => updateRental("securityDeposit", e.target.value)} /></div>
                  <div><FieldLabel>専有面積 (㎡)</FieldLabel><Input value={rentalDetails.exclusiveArea} onChange={(e) => updateRental("exclusiveArea", e.target.value)} /></div>
                </div>
              </div>
            )}

            <div className={`mt-6 rounded-lg border p-4 transition ${highlightSection === "contact" ? "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-200" : "border-zinc-200 bg-zinc-50"}`}>
              <div className="mb-3 text-sm font-semibold text-zinc-700">会社・連絡先情報（図面フッター表示）</div>
              <div className="grid gap-3 md:grid-cols-2">
                <div><FieldLabel>会社名</FieldLabel><Input value={contactInfo.companyName} onChange={(e) => updateContact("companyName", e.target.value)} /></div>
                <div><FieldLabel>担当者</FieldLabel><Input value={contactInfo.staffName} onChange={(e) => updateContact("staffName", e.target.value)} /></div>
                <div><FieldLabel>電話番号</FieldLabel><Input value={contactInfo.companyPhone} onChange={(e) => updateContact("companyPhone", e.target.value)} /></div>
                <div><FieldLabel>FAX</FieldLabel><Input value={contactInfo.companyFax} onChange={(e) => updateContact("companyFax", e.target.value)} /></div>
                <div><FieldLabel>Gmail</FieldLabel><Input value={contactInfo.companyEmail} onChange={(e) => updateContact("companyEmail", e.target.value)} /></div>
                <div className="md:col-span-2"><FieldLabel>住所</FieldLabel><Input value={contactInfo.companyAddress} onChange={(e) => updateContact("companyAddress", e.target.value)} /></div>
                <div><FieldLabel>免許番号</FieldLabel><Input value={contactInfo.licenseNo} onChange={(e) => updateContact("licenseNo", e.target.value)} /></div>
                <div><FieldLabel>取引形態</FieldLabel><Input value={contactInfo.transactionType} onChange={(e) => updateContact("transactionType", e.target.value)} /></div>
                <div><FieldLabel>手数料</FieldLabel><Input value={contactInfo.fee} onChange={(e) => updateContact("fee", e.target.value)} /></div>
                <div className="md:col-span-2"><FieldLabel>内見・物件確認文言</FieldLabel><Input value={contactInfo.inspectionNote} onChange={(e) => updateContact("inspectionNote", e.target.value)} /></div>
               <div className="md:col-span-2"><FieldLabel>物件情報URL（QR自動生成用）</FieldLabel><Input value={contactInfo.infoPageUrl} onChange={(e) => updateContact("infoPageUrl", e.target.value)} placeholder="https://..." /></div>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <div className="mb-2 text-sm font-semibold text-zinc-700">メインカラー</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "sunset-red", color: "#b30000" },
                    { key: "ocean-blue", color: "#1d4ed8" },
                    { key: "forest-green", color: "#0f766e" },
                    { key: "royal-purple", color: "#6d28d9" },
                    { key: "charcoal-gold", color: "#9a6b00" },
                    { key: "sky-blue", color: "#7dd3fc" },
                  ].map((item) => {
                    const active = item.key === themeColor;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setThemeColor(item.key as ThemeColorKey)}
                        className={`h-8 w-8 rounded-full border-2 transition ${active ? "scale-110 border-zinc-900" : "border-zinc-300"}`}
                        style={{ backgroundColor: item.color }}
                        aria-label={`theme-${item.key}`}
                      />
                    );
                  })}
                </div>
              </div>
              
              <div>
                 <div className="mb-2 text-sm font-semibold text-zinc-700">分譲地特長（{salesTags.length}/6）</div>
                <div className="flex flex-wrap gap-2">
                  {SALES_TAGS.map((tag) => {
                    const active = salesTags.includes(tag);
                    const limitReached = salesTags.length >= 6 && !active;
                    return (
                      <button
                        key={tag}
                        type="button"
                         onClick={() => toggleTag(tag, 6, setSalesTags)}
                        disabled={limitReached}
                        className={`rounded-full border px-3 py-1.5 text-sm transition ${active ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-300 bg-white text-zinc-600"} ${limitReached ? "cursor-not-allowed opacity-40" : ""}`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
               <div className="mb-2 text-sm font-semibold text-zinc-700">特徴・仕様（{featureTags.length}/10）</div>
                <div className="flex flex-wrap gap-2">
                  {FEATURE_TAGS.map((tag) => {
                    const active = featureTags.includes(tag);
                    const limitReached = featureTags.length >= 10 && !active;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag, 10, setFeatureTags)}
                        disabled={limitReached}
                        className={`rounded-full border px-3 py-1.5 text-sm transition ${active ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-300 bg-white text-zinc-600"} ${limitReached ? "cursor-not-allowed opacity-40" : ""}`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <div>
                <div className="text-xs text-zinc-500">{savedAt ? `最終保存: ${savedAt}` : "未保存"}</div>
                 {saveMessage ? (
                  <div className="mt-1.5 flex items-start gap-2" role="status" aria-live="polite">
                    <span
                      className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4 ${
                       saveToneBadgeClass
                      }`}
                    >
                       {saveStatusTitle}
                    </span>
                    <span className={`text-xs font-semibold ${saveToneTextClass}`}>
                      {saveMessage}
                    </span>
                  </div>
                ) : null}
              </div>
              <div className="flex gap-2">
                 <button type="button" onClick={onTemporarySave} className="rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white">一時保存（メモリのみ）</button>
                <button type="button" onClick={onSaveDraft} className="rounded-md bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white">名前を付けて保存</button>
                <button type="button" onClick={onGenerate} disabled={!canGo} className="rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40">図面を生成してプレビュー</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
