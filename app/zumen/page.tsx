"use client";

import Link from "next/link";
import {
  CSSProperties,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InfoTable, SectionTitle } from "../../components/JpInfoTable";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

type CategoryKey =
  | "new-house"
  | "used-house"
  | "land"
  | "new-mansion"
  | "used-mansion"
  | "rental";

type ThemeColorKey =
  | "sunset-red"
  | "ocean-blue"
  | "forest-green"
  | "royal-purple"
  | "charcoal-gold"
  | "sky-blue";

type TemplateKey = "classic" | "pop" | "chic";
type ImageFormat = "png" | "jpeg";

const TEMPLATE_OPTIONS: Array<{
  key: TemplateKey;
  title: string;
  subtitle: string;
  swatches: string[];
}> = [
  {
    key: "classic",
    title: "CLASSIC",
    subtitle: "クラシックで高級感あるデザイン",
    swatches: ["#6f3b14", "#8f1212", "#7c5c00", "#1d4ed8", "#365314", "#44403c"],
  },
  {
    key: "pop",
    title: "POP",
    subtitle: "親しみあるデザイン",
    swatches: ["#003049", "#9d0208", "#ca6702", "#3a5a40", "#582f0e", "#4a4a4a"],
  },
  {
    key: "chic",
    title: "CHIC",
    subtitle: "シックで上品なデザイン",
    swatches: ["#5f0f40", "#9a031e", "#d17b0f", "#1e1b4b", "#3f6212", "#3f3f46"],
  },
];

const THEME_COLORS: Record<
  ThemeColorKey,
  { brand: string; section: string; label: string }
> = {
  "sunset-red": { brand: "#b30000", section: "#f3c9b8", label: "#fde7dd" },
  "ocean-blue": { brand: "#1d4ed8", section: "#bfd7ff", label: "#e1ecff" },
  "forest-green": { brand: "#0f766e", section: "#bfe6dc", label: "#e2f5ef" },
  "royal-purple": { brand: "#6d28d9", section: "#d8c2ff", label: "#eee4ff" },
  "charcoal-gold": { brand: "#9a6b00", section: "#ecd9ad", label: "#f8edd2" },
  "sky-blue": { brand: "#0ea5e9", section: "#d8f1ff", label: "#edf8ff" },
};

const THEME_PICKER_COLORS: Array<{ key: ThemeColorKey; color: string }> = [
  { key: "sunset-red", color: "#b30000" },
  { key: "ocean-blue", color: "#1d4ed8" },
  { key: "forest-green", color: "#0f766e" },
  { key: "royal-purple", color: "#6d28d9" },
  { key: "charcoal-gold", color: "#9a6b00" },
  { key: "sky-blue", color: "#7dd3fc" },
];

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

type RentalDetails = {
  rent: string;
  commonFee: string;
  depositGuarantee: string;
  renewalFee: string;
  keyMoney: string;
  securityDeposit: string;
  exclusiveArea: string;
  note: string;
};

type ZumenData = {
  price: string;
  name: string;
  access: string;
  access2?: string;
  access3?: string;
  walk: string;
  address: string;
  lifeInformation?: string;
  catchCopy?: string;
  districts?: string;
  salesTags?: string[];
  featureTags?: string[];
  category?: CategoryKey;
  propertyType?: string;
  houseDetails?: HouseDetails;
  mansionDetails?: MansionDetails;
  rentalDetails?: RentalDetails;
  imgMain?: string;
  imgPlan?: string;
  imgSub1?: string;
  imgSub2?: string;
  imgSub3?: string;
  imgSub4?: string;
  imgSub5?: string;
  imgSub6?: string;
  imgQr?: string;
  imgMap?: string;
  draftTitle?: string;
  draftId?: string;
  draftSavedAt?: string;
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
    infoPageUrl?: string;
  };
};

function toExportableImageSrc(src?: string) {
  if (!src) return src;
  const normalizedSrc = src.trim();

  if (/^(data:|blob:|\/|\.\/|\.\.\/)/.test(normalizedSrc)) {
    return normalizedSrc;
  }

  if (/^\/\//.test(normalizedSrc)) {
    return `/api/image-proxy?url=${encodeURIComponent(`https:${normalizedSrc}`)}`;
  }

  if (/^https?:\/\//i.test(normalizedSrc)) {
    return `/api/image-proxy?url=${encodeURIComponent(normalizedSrc)}`;
  }

  if (/^[\w.-]+\.[a-z]{2,}(?:[/:?#]|$)/i.test(normalizedSrc)) {
    return `/api/image-proxy?url=${encodeURIComponent(`https://${normalizedSrc}`)}`;
  }

  return normalizedSrc;
}

function ImgBox({
  src,
  label,
  fit = "cover",
  h,
  showCenterLogo = false,
}: {
  src?: string;
  label: string;
  fit?: "cover" | "contain";
  h: number;
  showCenterLogo?: boolean;
}) {
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden border border-black bg-zinc-50"
      style={{ height: `${h}px` }}
    >
      {src ? (
        <>
          <img
            src={toExportableImageSrc(src)}
            alt={label}
            className="h-full w-full"
            style={{ objectFit: fit }}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
          {showCenterLogo ? (
            <div
              aria-label="house marker"
              className="pointer-events-none absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-sky-500 text-white shadow"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M12 3 3 10.5h2V21h6v-5h2v5h6V10.5h2L12 3Zm5 16h-2v-5H9v5H7v-9.62l5-4.17 5 4.17V19Z" />
              </svg>
            </div>
          ) : null}
        </>
      ) : (
        <div className="text-xs text-zinc-500">{label}</div>
      )}
    </div>
  );
}

type StoredDraft = {
  id: string;
  savedAt: string;
  payload: ZumenData;
};

const ZUMEN_DRAFTS_STORAGE_KEY = "zumenDrafts";

function loadStoredDraftsFromLocal(): StoredDraft[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(ZUMEN_DRAFTS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as StoredDraft[];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item) => item?.id && item?.payload);
  } catch {
    return [];
  }
}
function saveStoredDraftsToLocal(drafts: StoredDraft[]) {
  if (typeof window === "undefined") return;

  try {
    if (drafts.length === 0) {
      localStorage.removeItem(ZUMEN_DRAFTS_STORAGE_KEY);
      return;
    }
    localStorage.setItem(ZUMEN_DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
  } catch (error) {
    console.error("saveStoredDraftsToLocal error:", error);
  }
}

const A4_RATIO = Math.SQRT2;
const SHEET_HEIGHT = 794;
const SHEET_WIDTH = Math.round(SHEET_HEIGHT * A4_RATIO);
const PAPER_MARGIN_CM = 0.05;
const CM_TO_PX = 96 / 2.54;
const PAPER_MARGIN_PX = PAPER_MARGIN_CM * CM_TO_PX;
const EXPORT_SHEET_WIDTH = SHEET_WIDTH - PAPER_MARGIN_PX * 2;
const EXPORT_SHEET_HEIGHT = SHEET_HEIGHT - PAPER_MARGIN_PX * 2;
const PROPERTY_NAME_MAX_HEIGHT = 84;
const DEFAULT_QR_NOTE = "☚内見、物件確認";
const DEFAULT_LIFE_INFORMATION_ROWS = [
  "□スーパー 徒歩6分",
  "□小学校 徒歩7分",
  "□総合病院 徒歩12分",
  "□公園 徒歩3分",
  "□コンビニ 徒歩4分",
  "□ドラッグストア 徒歩8分",
];
const FOOTER_HEIGHT_CLASS = "h-[1.5cm]";
const FOOTER_QR_SIZE_CLASS = "h-[1.5cm] w-[1.5cm]";

function adaptiveTextStyle(
  text: string | undefined,
  minSize: number,
  maxSize: number
): CSSProperties {
  const normalized = (text ?? "").replace(/\s+/g, "");
  const length = normalized.length;
  const minLength = 12;
  const maxLength = 64;

  if (length <= minLength) {
    return {
      fontSize: `${maxSize}px`,
      lineHeight: 1.2,
      overflowWrap: "anywhere",
    };
  }

  if (length >= maxLength) {
    return {
      fontSize: `${minSize}px`,
      lineHeight: 1.2,
      overflowWrap: "anywhere",
    };
  }

  const ratio = (length - minLength) / (maxLength - minLength);
  const size = maxSize - (maxSize - minSize) * ratio;

  return {
    fontSize: `${size}px`,
    lineHeight: 1.2,
    overflowWrap: "anywhere",
  };
}

function AutoFitText({
  text,
  minSize,
  maxSize,
  className,
  style,
}: {
  text: string;
  minSize: number;
  maxSize: number;
  className?: string;
  style?: CSSProperties;
}) {
  const textRef = useRef<HTMLDivElement | null>(null);
  const [fontSize, setFontSize] = useState(maxSize);

  useLayoutEffect(() => {
    const node = textRef.current;
    if (!node) return;

    const fitText = () => {
      let nextSize = maxSize;
      node.style.fontSize = `${nextSize}px`;

      while (nextSize > minSize && node.scrollWidth > node.clientWidth) {
        nextSize -= 1;
        node.style.fontSize = `${nextSize}px`;
      }

      setFontSize(nextSize);
    };

    fitText();

    const resizeObserver = new ResizeObserver(fitText);
    resizeObserver.observe(node);
    return () => resizeObserver.disconnect();
  }, [text, minSize, maxSize]);

  return (
    <div
      ref={textRef}
      className={className}
      style={{
        ...style,
        fontSize: `${fontSize}px`,
        whiteSpace: "nowrap",
        lineHeight: 1.03,
      }}
      title={text}
    >
      {text}
    </div>
  );
}

function ZumenPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const shouldExportPdf = searchParams.get("export") === "pdf";
  const viewMode = searchParams.get("view") === "saved" ? "saved" : "preview";
  const draftIdFromQuery = searchParams.get("draftId");
  const isSavedDraftsView = viewMode === "saved";

  const [data, setData] = useState<ZumenData | null>(null);
  const [savedDrafts, setSavedDrafts] = useState<StoredDraft[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  const [sheetScale, setSheetScale] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState<ThemeColorKey>("sunset-red");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [imageFormat, setImageFormat] = useState<ImageFormat>("png");
  const [exportError, setExportError] = useState<string | null>(null);

  const [debugCanvasUrl, setDebugCanvasUrl] = useState<string | null>(null);
  const [debugCanvasInfo, setDebugCanvasInfo] = useState<string>("");
  const [showDebugPreview, setShowDebugPreview] = useState(false);

  const activeTemplate: TemplateKey | null = isSavedDraftsView
    ? selectedTemplate ?? "classic"
    : selectedTemplate;

  const loadPreviewData = useCallback(() => {
    try {
      const runtimePayload = (window as Window & { __zumenPayload?: ZumenData }).__zumenPayload;
      if (runtimePayload) {
        setData(runtimePayload);
        return;
      }

      const saved = localStorage.getItem("zumenData");
      setData(saved ? (JSON.parse(saved) as ZumenData) : null);
    } catch {
      setData(null);
    }
  }, []);

  const loadDrafts = useCallback(async () => {
    const applyDrafts = (incomingDrafts: StoredDraft[]) => {
      const drafts = Array.isArray(incomingDrafts) ? incomingDrafts : [];

      setSavedDrafts(drafts);

      if (drafts.length === 0) {
        setSelectedDraftId(null);
        setData(null);
        return;
      }

      const selected =
        (draftIdFromQuery ? drafts.find((d) => d.id === draftIdFromQuery) : undefined) ??
        drafts[0];

      setSelectedDraftId(selected.id);
      setData(selected.payload);
       };

    try {
      const res = await fetch("/api/zumen-drafts", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("draft fetch failed");
      }

      const json = (await res.json()) as { drafts?: StoredDraft[] };
      const remoteDrafts = Array.isArray(json.drafts) ? json.drafts : [];
      const localDrafts = loadStoredDraftsFromLocal();
       const mergedById = new Map<string, StoredDraft>();
      [...remoteDrafts, ...localDrafts].forEach((draft) => {
        if (!draft?.id || !draft?.payload) return;

        const existing = mergedById.get(draft.id);
        if (!existing) {
          mergedById.set(draft.id, draft);
          return;
        }

        const existingTime = Date.parse(existing.savedAt || existing.payload.draftSavedAt || "");
        const nextTime = Date.parse(draft.savedAt || draft.payload.draftSavedAt || "");
        if ((Number.isFinite(nextTime) ? nextTime : 0) >= (Number.isFinite(existingTime) ? existingTime : 0)) {
          mergedById.set(draft.id, draft);
        }
      });

      const mergedDrafts = Array.from(mergedById.values()).sort((a, b) => {
        const aTime = Date.parse(a.savedAt || a.payload.draftSavedAt || "");
        const bTime = Date.parse(b.savedAt || b.payload.draftSavedAt || "");
        return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
      });
      saveStoredDraftsToLocal(mergedDrafts);
      applyDrafts(mergedDrafts);
    } catch (error) {
      console.error("loadDrafts error:", error);
      applyDrafts(loadStoredDraftsFromLocal());
    }
  }, [draftIdFromQuery]);

  useEffect(() => {
    if (isSavedDraftsView) {
      void loadDrafts();
    } else {
      loadPreviewData();
    }
  }, [isSavedDraftsView, loadDrafts, loadPreviewData]);

  useEffect(() => {
    if (!isSavedDraftsView) return;

    const reloadDrafts = () => {
      void loadDrafts();
    };

    window.addEventListener("focus", reloadDrafts);
    document.addEventListener("visibilitychange", reloadDrafts);

    return () => {
      window.removeEventListener("focus", reloadDrafts);
      document.removeEventListener("visibilitychange", reloadDrafts);
    };
  }, [isSavedDraftsView, loadDrafts]);

  useEffect(() => {
    if (!data?.themeColor) return;
    setSelectedTheme(data.themeColor);
  }, [data?.themeColor]);

  useEffect(() => {
    if (isSavedDraftsView && !selectedTemplate) {
      setSelectedTemplate("classic");
    }
  }, [isSavedDraftsView, selectedTemplate]);

  useEffect(() => {
    const updateScale = () => {
      const el = previewRef.current;
      if (!el) return;
      setSheetScale(Math.min(1, el.clientWidth / SHEET_WIDTH));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const propertyType = data?.propertyType?.trim() ?? "";
  const category = data?.category;

  const isMansion =
    propertyType.includes("マンション") ||
    category === "new-mansion" ||
    category === "used-mansion";

  const isHouse =
    propertyType.includes("住宅") ||
    (!isMansion && (category === "new-house" || category === "used-house"));

  const isLand = propertyType === "土地" || category === "land";
  const isRental = propertyType.includes("賃貸") || category === "rental";
  const transportLines = useMemo(() => {
    if (!data) return ["-"];

   
    const normalizeLine = (raw?: string) => {
      const value = raw?.trim();
      if (!value) return null;
      return value;
    };

    const lines = [data.access, data.access2, data.access3]
      .map((line) => normalizeLine(line))
      .filter((line): line is string => Boolean(line));

    return lines.length > 0 ? lines : ["-"];
  }, [data]);
  const transportInlineText = useMemo(() => transportLines.join(" / "), [transportLines]);
  const transportMultilineText = useMemo(() => transportLines.join("\n"), [transportLines]);
  const handleDeleteDraft = async (draftId: string) => {
    try {
      await fetch(`/api/zumen-drafts?draftId=${encodeURIComponent(draftId)}`, {
        method: "DELETE",
      });

      const nextDrafts = savedDrafts.filter((draft) => draft.id !== draftId);
      setSavedDrafts(nextDrafts);
      saveStoredDraftsToLocal(nextDrafts);
      if (selectedDraftId === draftId) {
        const nextSelected = nextDrafts[0] ?? null;
        setSelectedDraftId(nextSelected?.id ?? null);
        setData(nextSelected?.payload ?? null);

        if (nextSelected) {
          router.push(`/zumen?view=saved&draftId=${encodeURIComponent(nextSelected.id)}`);
        } else {
          router.push(`/zumen?view=saved`);
        }
      }
    } catch (error) {
      console.error("delete draft error:", error);
    }
  };

  const handleSelectDraft = (draft: StoredDraft) => {
    setSelectedDraftId(draft.id);
    setData(draft.payload);
   };
    const handleEditDraft = (draft: StoredDraft) => {
    try {
      const payloadForInput = {
        ...draft.payload,
        draftId: draft.id,
        draftSavedAt: draft.savedAt || draft.payload.draftSavedAt,
      };
      localStorage.setItem("zumenData", JSON.stringify(payloadForInput));
    } catch (error) {
      console.error("failed to cache selected draft for input screen:", error);
    }
     router.push(`/?draftId=${encodeURIComponent(draft.id)}`);
  };

  const summaryRows = useMemo(() => {
    if (!data) return [];

    if (isHouse && data.houseDetails) {
      return [
        { label: "所在地", value: data.address },
        { label: "権利", value: data.houseDetails.right || "-" },
        {
          label: "敷地面積",
          value: data.houseDetails.landArea ? `${data.houseDetails.landArea}㎡` : "-",
        },
        {
          label: "地目",
          value: data.houseDetails.lot || "-",
          label2: "間取り",
          value2: data.houseDetails.layout || "-",
        },
        { label: "私道", value: data.houseDetails.privateRoad || "-" },
        {
          label: "専有面積",
          value: data.houseDetails.exclusiveArea
            ? `${data.houseDetails.exclusiveArea}㎡`
            : "-",
        },
        { label: "構造・階数", value: data.houseDetails.structure || "-" },
        { label: "築年月", value: data.houseDetails.builtAt || "-" },
      ];
    }

    if (isMansion && data.mansionDetails) {
      const builtAtRow = {
        label: "築年月",
        value: data.mansionDetails.builtAt || "-",
      };
       const chicAdditionalRows =
        activeTemplate === "chic"
          ? [
              {
                label: "敷地面積",
                value: data.mansionDetails.landArea
                  ? `${data.mansionDetails.landArea}㎡`
                  : "-",
              },
              {
                label: "用途地域",
                value: data.mansionDetails.zoning || "-",
              },
              {
                label: "分譲会社",
                value: data.mansionDetails.developer || "-",
              },
              {
                label: "施工会社",
                value: data.mansionDetails.constructor || "-",
              },
            ]
          : [];
      const totalUnitsRow = {
        label: "総戸数",
        value: data.mansionDetails.totalUnits
          ? `${data.mansionDetails.totalUnits}戸`
          : "-",
      };

      return [
        { label: "所在地", value: data.address },
        { label: "権利", value: data.mansionDetails.right || "-" },
        {
          label: "専有面積",
          value: data.mansionDetails.exclusiveArea
            ? `${data.mansionDetails.exclusiveArea}㎡`
            : "-",
        },
        {
          label: "バルコニー",
          value: data.mansionDetails.balconyArea
            ? `${data.mansionDetails.balconyArea}㎡`
            : "-",
        },
        { label: "間取り", value: data.mansionDetails.layout || "-" },
        { label: "構造・階数", value: data.mansionDetails.structure || "-" },
        { label: "所在階", value: data.mansionDetails.floor || "-" },
        ...(activeTemplate === "chic"
          ? [builtAtRow, ...chicAdditionalRows, totalUnitsRow]
          : [
              {
                ...builtAtRow,
                label2: "総戸数",
                value2: totalUnitsRow.value,
              },
            ]),
      ];
    }

    if (isRental && data.rentalDetails) {
      return [
        {
          label: "賃　料",
          value: data.rentalDetails.rent
            ? `${Number(data.rentalDetails.rent).toLocaleString()}円`
            : "-",
          label2: "保証金",
          value2: data.rentalDetails.depositGuarantee || "-",
        },
        {
          label: "共益費",
          value: data.rentalDetails.commonFee
            ? `${Number(data.rentalDetails.commonFee).toLocaleString()}円`
            : "-",
          label2: "更新料",
          value2: data.rentalDetails.renewalFee || "-",
        },
        {
          label: "礼　金",
          value: data.rentalDetails.keyMoney || "-",
          label2: "敷　金",
          value2: data.rentalDetails.securityDeposit || "-",
        },
        {
          label: "専有面積",
          value: data.rentalDetails.exclusiveArea
            ? `${data.rentalDetails.exclusiveArea}㎡`
            : "-",
        },
      ];
    }

    if (isLand) {
      return [
        { label: "所在地", value: data.address },
        { label: "物件種別", value: data.propertyType || "土地" },
        { label: "交通", value: transportInlineText },
        {
          label: "価格",
          value: `${Number(data.price || 0).toLocaleString()}万円`,
        },
      ];
    }

    return [{ label: "所在地", value: data.address }];
   }, [data, isHouse, isLand, isMansion, isRental, activeTemplate, transportInlineText]);


  const managementRows = useMemo(() => {
    if (isRental) {
      return [];
    }

    if (isMansion && data?.mansionDetails) {
      return [
        {
          label: "管理費",
          value: data.mansionDetails.managementFee
            ? `${data.mansionDetails.managementFee}円`
            : "-",
        },
        {
          label: "修繕積立金",
          value: data.mansionDetails.reserveFund
            ? `${data.mansionDetails.reserveFund}円`
            : "-",
        },
        {
          label: "その他使用料",
          value: data.mansionDetails.internetFee
            ? `${data.mansionDetails.internetFee}円`
            : "-",
        },
        {
          label: "管理会社",
          value: data.mansionDetails.managementCompany || "-",
        },
        ...(activeTemplate === "chic"
          ? [
              {
                label: "管理形態",
                value: data.mansionDetails.managementStyle || "-",
              },
            ]
          : []),
      ];
    }

    if (isHouse && data?.houseDetails) {
      return [
        { label: "都市計画", value: data.houseDetails.cityPlan || "-" },
        { label: "用途地域", value: data.houseDetails.zoning || "-" },
        {
          label: "建ぺい率",
          value: data.houseDetails.buildingCoverage || "-",
          label2: "容積率",
          value2: data.houseDetails.floorAreaRatio || "-",
        },
        ...(activeTemplate === "chic"
          ? []
          : [{ label: "駐車場", value: data.houseDetails.parking || "-" }]),
      ];
    }

    return [];
  }, [data, isHouse, isMansion, isRental, activeTemplate]);

  const facilityRows = useMemo(() => {
    if (isRental) {
      return [
        { label: "所在地", value: data?.address || "-" },
         { label: "交通", value: transportInlineText },
      ];
    }

    if (isMansion && data?.mansionDetails) {
      return [
        { label: "ガス", value: data.mansionDetails.gas || "-" },
        { label: "EV", value: data.mansionDetails.elevator || "-" },
        {
          label: "現況",
          value: data.mansionDetails.currentStatus || "-",
          label2: "引渡し",
          value2: data.mansionDetails.handover || "-",
        },
      ];
    }

    if (isHouse && data?.houseDetails) {
      return [
        {
          label: "ガス",
          value: data.houseDetails.gas || "-",
          label2: "飲用水",
          value2: data.houseDetails.water || "-",
        },
        {
          label: "汚水",
          value: data.houseDetails.sewage || "-",
          label2: "雑排水",
          value2: data.houseDetails.drain || "-",
        },
        {
          label: "現況",
          value: data.houseDetails.status || "-",
          label2: "引渡し",
          value2: data.houseDetails.handover || "-",
        },
      ];
    }

    return [
      { label: "ガス", value: "-" },
      { label: "現況", value: "-", label2: "引渡し", value2: "-" },
    ];
   }, [data, isHouse, isMansion, isRental, transportInlineText]);

  const remarks = isMansion
    ? data?.mansionDetails?.note
    : isRental
      ? data?.rentalDetails?.note
    : isHouse
      ? data?.houseDetails?.note
      : "※図面と相違する場合は現況を優先します。";
     const displayRemarks = remarks || "※図面と相違する場合は現況を優先します。";
  const chicRemarksFontSize = useMemo(() => {
    const normalized = displayRemarks.replace(/\s+/g, "");
    const length = normalized.length;

    if (length <= 180) return 10;
    if (length <= 260) return 9;
    if (length <= 340) return 8;
    if (length <= 430) return 7;
    return 6;
  }, [displayRemarks]);
  const popRemarkItems = useMemo(() => {
    if (!data) return ["※図面と相違する場合は現況を優先します。"];

    const basicRows = [
      `●物件名：${data.name || "-"}`,
      `●所在地：${data.address || "-"}`,
       `●交通：${transportInlineText}`,
      `●価格：${data.price ? `${Number(data.price).toLocaleString()}万円` : "-"}`,
      `●物件種別：${data.propertyType || "-"}`,
    ];

    if (isHouse && data.houseDetails) {
      const house = data.houseDetails;
      return [
        ...basicRows,
        `●権利：${house.right || "-"}`,
        `●敷地面積：${house.landArea ? `${house.landArea}㎡` : "-"}`,
        `●土地権利：${house.lot || "-"}`,
        `●私道負担：${house.privateRoad || "-"}`,
        `●建物面積：${house.exclusiveArea ? `${house.exclusiveArea}㎡` : "-"}`,
        `●間取り：${house.layout || "-"}`,
        `●構造：${house.structure || "-"}`,
        `●築年月：${house.builtAt || "-"}`,
        `●都市計画：${house.cityPlan || "-"}`,
        `●用途地域：${house.zoning || "-"}`,
        `●建ぺい率：${house.buildingCoverage ? `${house.buildingCoverage}%` : "-"}`,
        `●容積率：${house.floorAreaRatio ? `${house.floorAreaRatio}%` : "-"}`,
        `●駐車場：${house.parking || "-"}`,
        `●設備：ガス ${house.gas || "-"} / 水道 ${house.water || "-"} / 汚水 ${house.sewage || "-"} / 雑排水 ${house.drain || "-"}`,
        `●現況 / 引渡し：${house.status || "-"} / ${house.handover || "-"}`,
        ...(house.note ? [house.note] : []),
      ];
    }

    if (isMansion && data.mansionDetails) {
      const mansion = data.mansionDetails;
      return [
        ...basicRows,
        `●権利：${mansion.right || "-"}`,
        `●専有面積：${mansion.exclusiveArea ? `${mansion.exclusiveArea}㎡` : "-"}`,
        `●バルコニー面積：${mansion.balconyArea ? `${mansion.balconyArea}㎡` : "-"}`,
        `●間取り：${mansion.layout || "-"}`,
        `●構造：${mansion.structure || "-"}`,
        `●所在階：${mansion.floor || "-"}`,
        `●築年月：${mansion.builtAt || "-"}`,
        `●管理費 / 修繕積立金：${mansion.managementFee || "-"}円 / ${mansion.reserveFund || "-"}円`,
        `●現況 / 引渡し：${mansion.currentStatus || "-"} / ${mansion.handover || "-"}`,
        ...(mansion.note ? [mansion.note] : []),
      ];
    }

    return [...basicRows, remarks || ""].filter(Boolean);
  }, [data, isHouse, isMansion, remarks, transportInlineText]);

  const layoutLabel =
    (isMansion
      ? data?.mansionDetails?.layout
      : isHouse
        ? data?.houseDetails?.layout
        : data?.propertyType) || "4LDK + WIC";

  const featureRows = data?.featureTags?.map((item) => item.replace(/^#\s*/, "")) ?? [];
  const salesRows = data?.salesTags?.map((item) => item.replace(/^#\s*/, "")) ?? [];

  const inputLifeInfoRows = useMemo(() => {
    return (data?.lifeInformation ?? "")
      .split(/\r?\n/)
      .map((row) => row.trim())
      .filter(Boolean)
      .slice(0, 6);
  }, [data?.lifeInformation]);

  const lifeInfoRows =
    inputLifeInfoRows.length > 0 ? inputLifeInfoRows : DEFAULT_LIFE_INFORMATION_ROWS;

  const popLifeInfoRows =
    inputLifeInfoRows.length > 0 ? inputLifeInfoRows : DEFAULT_LIFE_INFORMATION_ROWS;

  const formatCheckboxLifeInfoRow = useCallback((row: string) => {
    return row.startsWith("□") ? row : `□${row.replace(/^[・･•●]\s*/, "")}`;
  }, []);

  const formatChicLifeInfoRow = useCallback((row: string) => {
    if (row.startsWith("□")) {
      return row.replace(/^□\s*/, "・");
    }

    if (/^[・･•●]/.test(row)) {
      return `・${row.replace(/^[・･•●]\s*/, "")}`;
    }

    return `・${row}`;
  }, []);

  const defaultContact = {
    companyName: "株式会社パワーウェイ",
    companyPhone: "090-6695-1306",
    companyAddress: "〒101-0025 東京都千代田区神田須田町2-2 3-1芝崎ビル4F",
    companyFax: "03-5207-2768",
    companyEmail: "lianghf2000@gmail.com",
    licenseNo: "東京都知事（2）第101930号",
    transactionType: "一般",
    staffName: "野村",
    fee: "分かれて",
  };

  const contact = { ...defaultContact, ...data?.contactInfo };
  const inspectionNote = contact.inspectionNote?.trim() || DEFAULT_QR_NOTE;
  const theme = THEME_COLORS[selectedTheme];

  const waitForSheetImages = useCallback(async (root: HTMLElement) => {
    const images = Array.from(root.querySelectorAll("img")).filter((img) =>
      Boolean(img.getAttribute("src") || img.currentSrc || img.src)
    );

    await Promise.all(
      images.map(async (img) => {
        await new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }

          const cleanUp = () => {
            img.removeEventListener("load", onLoad);
            img.removeEventListener("error", onError);
          };

          const onLoad = () => {
            cleanUp();
            resolve();
          };

          const onError = () => {
            cleanUp();
            resolve();
          };

          img.addEventListener("load", onLoad, { once: true });
          img.addEventListener("error", onError, { once: true });

          window.setTimeout(() => {
            cleanUp();
            resolve();
          }, 15000);
        });

        if (typeof img.decode === "function") {
          try {
            await img.decode();
          } catch {
            //
          }
        }
      })
    );
  }, []);

  const inlineCloneImages = useCallback(async (root: HTMLElement) => {
    const images = Array.from(root.querySelectorAll("img"));

    await Promise.all(
      images.map(async (img) => {
        const src = img.getAttribute("src") ?? img.currentSrc ?? img.src ?? "";
        if (!src || /^data:/i.test(src)) {
          return;
        }

        try {
          const response = await fetch(src, { cache: "force-cache" });
          if (!response.ok) {
            return;
          }

          const blob = await response.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error("failed to convert image to data url"));
            reader.readAsDataURL(blob);
          });

          img.setAttribute("src", dataUrl);
        } catch {
          //
        }
      })
    );
  }, []);

  const createExportClone = useCallback(async () => {
    if (!sheetRef.current) {
      throw new Error("出力対象が見つかりません。");
    }

    const wrapper = document.createElement("div");
    wrapper.id = "zumen-export-clone-root";
    wrapper.style.position = "fixed";
    wrapper.style.left = "0";
    wrapper.style.top = "0";
    wrapper.style.width = `${SHEET_WIDTH}px`;
    wrapper.style.height = `${SHEET_HEIGHT}px`;
    wrapper.style.margin = "0";
    wrapper.style.padding = "0";
    wrapper.style.overflow = "hidden";
    wrapper.style.background = "#ffffff";
    wrapper.style.opacity = "0.01";
    wrapper.style.pointerEvents = "none";
    wrapper.style.zIndex = "2147483647";

    const clone = sheetRef.current.cloneNode(true) as HTMLDivElement;
    clone.style.width = `${EXPORT_SHEET_WIDTH}px`;
    clone.style.height = `${EXPORT_SHEET_HEIGHT}px`;
    clone.style.transform = "none";
    clone.style.transformOrigin = "top left";
    clone.style.overflow = "hidden";
    clone.style.margin = "0";
    clone.style.background = "#ffffff";
    clone.style.visibility = "visible";

    const clonedImages = Array.from(clone.querySelectorAll("img"));
    clonedImages.forEach((img) => {
      const src = img.getAttribute("src") ?? img.currentSrc ?? img.src ?? "";
      if (!src) return;

      const exportableSrc = toExportableImageSrc(src);
      if (exportableSrc) {
        img.setAttribute("src", exportableSrc);
      }

      img.setAttribute("crossorigin", "anonymous");
      img.setAttribute("referrerpolicy", "no-referrer");
    });

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {
        //
      }
    }

    await inlineCloneImages(clone);
    await waitForSheetImages(clone);

    return {
      clone,
      cleanup: () => {
        if (wrapper.parentNode) {
          wrapper.parentNode.removeChild(wrapper);
        }
      },
    };
  }, [inlineCloneImages, waitForSheetImages]);

  const analyzeCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return "canvas分析失敗: 2D contextなし";
    }

    const samplePoints = [
      [10, 10],
      [Math.floor(canvas.width / 2), 10],
      [10, Math.floor(canvas.height / 2)],
      [Math.floor(canvas.width / 2), Math.floor(canvas.height / 2)],
      [canvas.width - 10, canvas.height - 10],
    ].filter(([x, y]) => x >= 0 && y >= 0 && x < canvas.width && y < canvas.height);

    const samples = samplePoints.map(([x, y]) => {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      return `(${x},${y}) rgba(${pixel[0]},${pixel[1]},${pixel[2]},${pixel[3]})`;
    });

    return `canvas: ${canvas.width}x${canvas.height} | ${samples.join(" | ")}`;
  }, []);

  const captureSheet = useCallback(async () => {
    const { clone, cleanup } = await createExportClone();

    const renderWithOptions = (foreignObjectRendering: boolean) =>
      html2canvas(clone, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: false,
        imageTimeout: 15000,
        logging: false,
        foreignObjectRendering,
        removeContainer: true,
        width: SHEET_WIDTH,
        height: SHEET_HEIGHT,
        windowWidth: SHEET_WIDTH,
        windowHeight: SHEET_HEIGHT,
        scrollX: 0,
        scrollY: 0,
      });

    try {
      let canvas: HTMLCanvasElement;

      try {
        canvas = await renderWithOptions(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        const isOklchParseError = message.includes(
          'Attempting to parse an unsupported color function "oklch"'
        );

        if (!isOklchParseError) {
          throw error;
        }

        console.warn(
          "html2canvas parser does not support oklch(). Retrying with foreignObjectRendering.",
          error
        );

        canvas = await renderWithOptions(true);
      }

      if (!canvas.width || !canvas.height) {
        throw new Error("Canvasの生成に失敗しました。");
      }

      return canvas;
    } finally {
      cleanup();
    }
  }, [createExportClone]);

  function getExportErrorMessage(error: unknown, type: "image" | "pdf") {
    const msg = error instanceof Error ? error.message : "";
    const name = error instanceof Error ? error.name : "";
    const crossOriginHint =
      name === "SecurityError"
        ? " 一部の画像URLが外部ドメイン(CORS制限)の可能性があります。"
        : "";

    if (type === "image") {
      return `画像の保存に失敗しました。${msg}${crossOriginHint}`;
    }

    return `PDFの保存に失敗しました。${msg}${crossOriginHint}`;
  }

  function isEmptyDataUrl(dataUrl: string) {
    const payload = dataUrl.split(",", 2)[1];
    return !payload;
  }

  function downloadDataUrl(dataUrl: string, filename: string) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function canvasToImageDataUrl(canvas: HTMLCanvasElement, format: ImageFormat) {
    const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
    const quality = format === "jpeg" ? 0.98 : 1;
    const dataUrl = canvas.toDataURL(mimeType, quality);

    if (dataUrl === "data:," || isEmptyDataUrl(dataUrl)) {
      throw new Error("画像データの生成に失敗しました。");
    }

    return dataUrl;
  }

  async function previewDebugCanvas() {
    setIsExporting(true);
    setExportError(null);

    try {
      const canvas = await captureSheet();
      const debugUrl = canvas.toDataURL("image/png", 1);

      if (debugUrl === "data:," || isEmptyDataUrl(debugUrl)) {
        throw new Error("Canvas確認用画像の生成に失敗しました。");
      }

      setDebugCanvasUrl(debugUrl);
      setDebugCanvasInfo(analyzeCanvas(canvas));
      setShowDebugPreview(true);
    } catch (error) {
      console.error("Debug canvas preview error:", error);
      setExportError(getExportErrorMessage(error, "image"));
      setDebugCanvasInfo(error instanceof Error ? error.message : "unknown debug error");
      setShowDebugPreview(true);
      setDebugCanvasUrl(null);
    } finally {
      setIsExporting(false);
    }
  }

  async function saveAsImage() {
    setIsExporting(true);
    setExportError(null);

    try {
      const canvas = await captureSheet();
      const dataUrl = await canvasToImageDataUrl(canvas, imageFormat);
      const extension = imageFormat === "jpeg" ? "jpg" : "png";
      downloadDataUrl(dataUrl, `zumen-${activeTemplate ?? "preview"}.${extension}`);
    } catch (error) {
      console.error("Image export error:", error);
      setExportError(getExportErrorMessage(error, "image"));
    } finally {
      setIsExporting(false);
    }
  }

  const saveAsPdf = useCallback(async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      const canvas = await captureSheet();

      const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.95);
      if (jpegDataUrl === "data:," || isEmptyDataUrl(jpegDataUrl)) {
        throw new Error("PDF画像の生成に失敗しました。");
      }

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const safeMargin = PAPER_MARGIN_CM * 10;
      const availableWidth = pageWidth - safeMargin * 2;
      const availableHeight = pageHeight - safeMargin * 2;
      const imageRatio = canvas.width / canvas.height;
      const pageRatio = availableWidth / availableHeight;

      const renderWidth =
        imageRatio > pageRatio ? availableWidth : availableHeight * imageRatio;
      const renderHeight =
        imageRatio > pageRatio ? availableWidth / imageRatio : availableHeight;

      const offsetX = pageWidth / 2 - renderWidth / 2;
      const offsetY = pageHeight / 2 - renderHeight / 2;

      pdf.addImage(jpegDataUrl, "JPEG", offsetX, offsetY, renderWidth, renderHeight);
      pdf.save(`zumen-${activeTemplate ?? "preview"}.pdf`);
    } catch (error) {
      console.error("PDF export error:", error);
      setExportError(getExportErrorMessage(error, "pdf"));
    } finally {
      setIsExporting(false);
    }
  }, [captureSheet, activeTemplate]);

  useEffect(() => {
    if (!shouldExportPdf || !data || isExporting) return;

    if (!activeTemplate) {
      setSelectedTemplate("classic");
      return;
    }

    const timer = window.setTimeout(() => {
      void saveAsPdf();
    }, 600);

    return () => window.clearTimeout(timer);
  }, [activeTemplate, data, isExporting, saveAsPdf, shouldExportPdf]);

  const renderSheet = (template: TemplateKey) => {
    if (!data) return null;

    return (
      <div
        id="zumen-export-sheet"
        ref={sheetRef}
        className={`border border-black bg-white text-black ${
          template === "pop" ? "font-semibold" : ""
        } ${template === "chic" ? "bg-[#fcfbf8]" : ""}`}
        style={{
          width: `${EXPORT_SHEET_WIDTH}px`,
          height: `${EXPORT_SHEET_HEIGHT}px`,
          margin: `${PAPER_MARGIN_PX}px`,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {template === "classic" ? (
          <>
            <div className="grid grid-cols-[470px_380px_273px] border-b border-black">
              <div className="border-r border-black p-2">
                <div
                  className="mt-2 text-center font-bold leading-tight"
                  style={{
                    ...adaptiveTextStyle(data?.name, 24, 38),
                    maxHeight: PROPERTY_NAME_MAX_HEIGHT,
                    overflow: "hidden",
                  }}
                >
                  {data.name}
                </div>
                <div className="mt-2 text-center text-2xl font-bold text-[#4a2207]">
                  販売価格 {Number(data.price || 0).toLocaleString()}万円
                </div>
                <div className="mt-2 text-center" style={adaptiveTextStyle(data.catchCopy, 11, 15)}>
                  {data.catchCopy || "徒歩圏内に学校や公園！ 毎日が便利で快適な住環境"}
                </div>
              </div>

              <div className="border-r border-black p-2">
                <div
                   className="mt-1 whitespace-pre-line font-semibold leading-tight"
                  style={adaptiveTextStyle(transportMultilineText, 12, 17)}
                >
                  {transportMultilineText}
                </div>
                <div className="mt-2 border-b border-black pb-1 text-sm font-bold" style={{ color: theme.brand }}>
                  LIFE INFORMATION
                </div>
                <div className="mt-1 text-xs leading-5">
                  {lifeInfoRows.slice(0, 6).map((row) => (
                    <div key={row}>{formatCheckboxLifeInfoRow(row)}</div>
                  ))}
                </div>
              </div>

              <div className="p-2">
                <ImgBox src={data.imgMap ?? data.imgMain} label="MAP" h={170} showCenterLogo={Boolean(data.imgMap)} />
                <div
                  className="border-t border-black p-1 text-center"
                  style={adaptiveTextStyle(`NAVI ${data.address}`, 9, 12)}
                >
                  NAVI {data.address}
                </div>
              </div>
            </div>

            {salesRows.length > 0 && (
              <div className="grid grid-cols-6 border-b border-black text-center text-sm font-semibold text-white">
                {salesRows.slice(0, 6).map((tag) => (
                  <div
                    key={tag}
                    className="border-r border-black py-2 last:border-r-0"
                    style={{ backgroundColor: theme.brand }}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-[300px_421px_402px] border-b border-black">
              <div className="border-r border-black p-2">
                <div className="flex items-start justify-between" style={{ color: theme.brand }}>
                  <div className="font-bold" style={adaptiveTextStyle(data.districts, 10, 14)}>
                    {data.districts || "1区画"}
                  </div>
                  <div
                    className="max-w-[170px] overflow-hidden text-ellipsis whitespace-nowrap font-bold"
                    title={layoutLabel}
                    style={adaptiveTextStyle(layoutLabel, 9, 15)}
                  >
                    {layoutLabel}
                  </div>
                </div>

                <div className="mt-2">
                  <ImgBox src={data.imgMain} label="メイン写真" h={180} />
                </div>

                <div className="mt-2 space-y-1 text-xs">
                  {summaryRows.slice(0, 6).map((row) => (
                    <div
                      key={row.label}
                      className="border border-black px-2 py-1 text-[11px] leading-tight [overflow-wrap:anywhere]"
                    >
                      {row.label}: {row.value}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-r border-black p-2">
                <ImgBox src={data.imgPlan} label="間取り図" h={320} fit="contain" />
              </div>

              <div className="p-2">
                <div className="grid grid-cols-2 gap-2">
                  <ImgBox src={data.imgSub1} label="サブ画像1" h={180} />
                  <ImgBox src={data.imgSub2} label="サブ画像2" h={180} />
                </div>
                <div className="mt-2">
                  <ImgBox src={data.imgSub3} label="現地案内図" h={170} />
                </div>

                {featureRows.length > 0 && (
                  <>
                    <div className="mt-3 text-lg font-bold" style={{ color: theme.brand }}>
                      建物備・仕様
                    </div>
                    <div className="mt-2 grid grid-cols-5 gap-2 text-center text-[10px]">
                      {featureRows.slice(0, 10).map((item) => (
                        <div
                          key={item}
                          className="flex h-12 items-center justify-center border border-zinc-400 px-1"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="h-[52px] border-b border-black px-3 py-1.5 text-[10px] leading-4 overflow-hidden">
              {displayRemarks}
            </div>

            <div className={`grid ${FOOTER_HEIGHT_CLASS} grid-cols-[1.2fr_330px_190px] items-center px-3 py-1`}>
              <div>
                <div className="text-[12px] font-semibold text-[#243b64] [overflow-wrap:anywhere]">
                  {contact.licenseNo || "-"}
                </div>
                <div className="font-serif text-[#243b64]" style={adaptiveTextStyle(contact.companyName, 22, 42)}>
                  {contact.companyName}
                </div>
                <div className="text-[10px] [overflow-wrap:anywhere]">{contact.companyAddress}</div>
              </div>

              <div
                className="flex flex-col items-center justify-center text-center font-serif text-[#a21717]"
                style={{ letterSpacing: "0.01em" }}
              >
                <div
                  style={{
                    ...adaptiveTextStyle(`TEL ${contact.companyPhone}`, 20, 28),
                    whiteSpace: "nowrap",
                  }}
                >
                  TEL {contact.companyPhone}
                </div>

                <div className="mt-0.5 flex items-center gap-2">
                  {data.imgQr ? (
                    <img
                      src={toExportableImageSrc(data.imgQr)}
                      alt="QR"
                      className={`${FOOTER_QR_SIZE_CLASS} bg-white p-[1px] object-contain`}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div
                      className={`flex ${FOOTER_QR_SIZE_CLASS} items-center justify-center border border-zinc-300 text-[10px] text-zinc-500`}
                    >
                      QR
                    </div>
                  )}

                  <div className="text-left text-[11px] leading-tight text-[#243b64]">
                    <div className="font-semibold">FAX:{contact.companyFax}</div>
                    <div>{inspectionNote}</div>
                  </div>
                </div>
              </div>

              <div className="self-start justify-self-end text-right text-[12px] leading-4 [overflow-wrap:anywhere]">
                <div className="text-[12px] leading-5 [overflow-wrap:anywhere]">
                  <div>Email: {contact.companyEmail}</div>
                  <div className="mt-1 flex justify-center leading-tight">
                    <div className="grid grid-cols-[4.8em_1em_auto] gap-x-1 text-left">
                      <div className="text-right whitespace-nowrap">取引形態</div>
                      <div>：</div>
                      <div>{contact.transactionType || "-"}</div>
                      <div className="text-right whitespace-nowrap">担当者</div>
                      <div>：</div>
                      <div>{contact.staffName || "-"}</div>
                      <div className="text-right whitespace-nowrap">手数料</div>
                      <div>：</div>
                      <div>{contact.fee || "-"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : template === "pop" ? (
          <>
            <div className="grid grid-cols-[470px_330px_323px] border-b border-black">
              <div
                className="relative border-r border-black p-2 text-white"
                style={{ backgroundColor: theme.brand }}
              >
                <div
                  className="text-center font-bold leading-tight"
                  style={adaptiveTextStyle(
                    `${data.propertyType || "中古マンション"} ${data.districts || "全10区画"}`,
                    15,
                    20
                  )}
                >
                  {data.propertyType || "中古マンション"} {data.districts || "全10区画"}
                </div>

                <AutoFitText
                  text={data.name}
                  minSize={20}
                  maxSize={40}
                  className="mt-1.5 text-center font-serif"
                  style={{ maxHeight: "2.5cm", overflow: "hidden" }}
                />

                <div
                  className="mt-1 text-center leading-tight"
                  style={{
                    ...adaptiveTextStyle(data.catchCopy, 10, 14),
                    maxHeight: "34px",
                    overflow: "hidden",
                  }}
                >
                  {data.catchCopy ||
                    "徒歩圏内に学校や公園！ 毎日が便利で快適な住環境の分譲地"}
                </div>

                <div className="absolute bottom-2 right-2 text-right">
                  <div className="font-bold text-[#fff7db]" style={adaptiveTextStyle("販売価格", 11, 15)}>
                    販売価格
                  </div>
                  <div className="mt-0.5 flex items-baseline justify-end gap-1.5 leading-none">
                    <div
                      className="font-serif font-bold text-[#ffe9a8]"
                      style={{
                        ...adaptiveTextStyle(Number(data.price || 0).toLocaleString(), 24, 34),
                        letterSpacing: "0.01em",
                      }}
                    >
                      {Number(data.price || 0).toLocaleString()}
                    </div>
                    <div className="font-bold text-[#fff7db]" style={adaptiveTextStyle("万円", 12, 18)}>
                      万円
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-r border-black p-2">
                <div
                  className="whitespace-pre-line text-right font-bold leading-tight"
                  style={adaptiveTextStyle(transportMultilineText, 12, 24)}
                >
                   {transportMultilineText}
                </div>

                <div
                  className="mt-1.5 px-2 py-0.5 text-xs font-bold tracking-widest text-white"
                  style={{ backgroundColor: theme.brand }}
                >
                  LIFE INFORMATION
                </div>

                <div className="mt-2 text-[12px] leading-5 [overflow-wrap:anywhere]">
                  {popLifeInfoRows.slice(0, 6).map((row) => (
                    <div key={row}>{formatCheckboxLifeInfoRow(row)}</div>
                  ))}
                </div>
              </div>

              <div className="p-2">
                <ImgBox src={data.imgMap ?? data.imgMain} label="MAP" h={170} showCenterLogo={Boolean(data.imgMap)} />
                <div
                  className="px-1 py-0.5 text-center font-bold text-white"
                  style={{
                    ...adaptiveTextStyle(`NAVI ${data.address} 付近`, 8, 11),
                    backgroundColor: theme.brand,
                    minHeight: "18px",
                  }}
                >
                  NAVI {data.address} 付近
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[380px_420px_323px] border-b border-black">
              <div className="border-r border-black p-2" style={{ backgroundColor: theme.brand }}>
                <ImgBox src={data.imgMain} label="メイン画像" h={220} />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <ImgBox src={data.imgSub1} label="サブ1" h={85} />
                  <ImgBox src={data.imgSub2} label="サブ2" h={85} />
                </div>
              </div>

              <div className="border-r border-black p-2">
                <div>
                  <div className="font-bold text-[#1f2937]" style={adaptiveTextStyle(layoutLabel, 20, 34)}>
                    {layoutLabel}
                  </div>
                  <div className="text-xs">□専有面積/75㎡(22.68坪)</div>
                  <div className="text-xs">□バルコニー面積/10㎡(3.02坪)</div>
                  <div className="mt-2">
                    <ImgBox src={data.imgPlan} label="間取り" h={205} fit="contain" />
                  </div>
                </div>
              </div>

              <div className="p-2">
                <ImgBox src={data.imgSub3} label="拡大図" h={130} />

                {featureRows.length > 0 && (
                  <div className="mt-2 grid grid-cols-5 gap-2 text-center text-[10px]">
                    {featureRows.slice(0, 10).map((item) => (
                      <div key={item} className="flex h-14 items-center justify-center border border-zinc-400">
                        {item}
                      </div>
                    ))}
                  </div>
                )}

                {salesRows.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs font-bold text-white">
                    {salesRows.slice(0, 6).map((item) => (
                      <div
                        key={item}
                        className="border border-[#d2a52b] px-1 py-1.5"
                        style={{ backgroundColor: theme.brand }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="h-[120px] w-[29cm] border-b border-black px-3 py-1.5 text-[11px] leading-5 overflow-hidden">
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {popRemarkItems.map((item, index) => (
                  <span key={`${item}-${index}`}>{item}</span>
                ))}
              </div>
            </div>

            <div
              className={`grid ${FOOTER_HEIGHT_CLASS} w-[29.5cm] grid-cols-[1.45fr_390px_200px] items-center border-t border-black px-3 py-1`}
            >
              <div>
                <div className="text-[12px] font-semibold text-[#243b64]">
                  免許番号：{contact.licenseNo || "-"}
                </div>
                <div className="font-serif text-[#243b64]" style={adaptiveTextStyle(contact.companyName, 22, 42)}>
                  {contact.companyName}
                </div>
                <div className="text-[10px] [overflow-wrap:anywhere]">{contact.companyAddress}</div>
              </div>

              <div
                className="flex flex-col items-center justify-center text-center font-serif text-[#a21717]"
                style={{ letterSpacing: "0.01em" }}
              >
                <div
                  style={{
                    ...adaptiveTextStyle(`TEL ${contact.companyPhone}`, 20, 28),
                    whiteSpace: "nowrap",
                  }}
                >
                  TEL {contact.companyPhone}
                </div>

                <div className="mt-0.5 flex items-center gap-2">
                  {data.imgQr ? (
                    <img
                      src={toExportableImageSrc(data.imgQr)}
                      alt="QR"
                      className={`${FOOTER_QR_SIZE_CLASS} object-cover`}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div
                      className={`flex ${FOOTER_QR_SIZE_CLASS} items-center justify-center border border-zinc-300 text-[10px] text-zinc-500`}
                    >
                      QR
                    </div>
                  )}

                  <div className="text-left text-[11px] leading-tight text-[#243b64]">
                    <div className="font-semibold">FAX:{contact.companyFax}</div>
                    <div>{inspectionNote}</div>
                  </div>
                </div>
              </div>

              <div className="self-start justify-self-end text-right text-[12px] leading-4 [overflow-wrap:anywhere]">
                <div>Email: {contact.companyEmail}</div>
                <div className="mt-1 flex justify-center leading-tight">
                  <div className="grid grid-cols-[4.8em_1em_auto] gap-x-1 text-left">
                    <div className="text-right whitespace-nowrap">取引形態</div>
                    <div>：</div>
                    <div>{contact.transactionType || "-"}</div>
                    <div className="text-right whitespace-nowrap">担当者</div>
                    <div>：</div>
                    <div>{contact.staffName || "-"}</div>
                    <div className="text-right whitespace-nowrap">手数料</div>
                    <div>：</div>
                    <div>{contact.fee || "-"}</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              className={`grid grid-cols-[140px_1fr_320px] border-b border-black ${
                template === "chic" ? "bg-[#f7f3ee]" : ""
              }`}
            >
              <div className="relative flex items-center justify-center border-r border-black p-2">
                <div className="-translate-y-0.5 text-3xl font-extrabold leading-none">
                  {Number(data.price || 0).toLocaleString()}
                </div>
                <div className="absolute bottom-1.5 right-2 text-xs font-bold">万円</div>
              </div>

              <div className="p-2">
                <div className="text-[12px] font-bold">物件名</div>
                <div
                  className="mt-1 text-lg font-extrabold tracking-[0.2em]"
                  style={{
                    maxHeight: PROPERTY_NAME_MAX_HEIGHT,
                    overflow: "hidden",
                  }}
                >
                  {data.name}
                </div>
              </div>

              <div className="border-l border-black p-2">
                <div className="grid grid-cols-[60px_1fr] items-center">
                  <div className="text-[12px] font-bold">交通</div>
                  <div
                    className="text-right text-[12px] font-bold whitespace-pre-line leading-tight"
                    style={adaptiveTextStyle(transportMultilineText, 10, 12)}
                  >
                    {transportMultilineText}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[260px_1fr_320px]">
              <div className="border-r border-black p-2">
                <ImgBox src={data.imgMain} label="外観画像（左上）" h={210} />
                <div className="mt-2 grid grid-cols-[calc(50%+0.1cm)_calc(50%-0.1cm)] gap-2">
                  <ImgBox src={data.imgSub1} label="共用（左中）" h={118} />
                  <ImgBox src={data.imgSub2} label="室内（左中）" h={118} />
                </div>
               <div className="mt-2">
                  <ImgBox src={data.imgSub3} label="追加画像（左下）" h={120} />
                </div>
                <div className="mt-3 text-[10px] leading-5">
                  {lifeInfoRows.slice(0, 6).map((row) => (
                    <div key={row}>{formatChicLifeInfoRow(row)}</div>
                  ))}
                </div>
              </div>

              <div className="border-r border-black p-2">
                <ImgBox src={data.imgPlan} label="間取り図（中央上）" h={360} fit="contain" />
                <div className="mt-2 grid grid-cols-2 gap-2">
                   <ImgBox
                    src={data.imgSub4}
                    label="リビング（中央下左）"
                    h={template === "chic" ? 244 : 168}
                  />
                  <ImgBox
                    src={data.imgSub5}
                    label="キッチン（中央下右）"
                    h={template === "chic" ? 244 : 168}
                  />
                </div>
              </div>

              <div className="p-2">
                <SectionTitle bgColor={theme.section}>
                  {isRental ? "賃貸条件（賃貸居住用）" : "物件概要"}
                </SectionTitle>
                <InfoTable rows={summaryRows} labelBgColor={theme.label} compact={template === "chic"} />

                {managementRows.length > 0 && (
                  <div className="mt-2">
                    <SectionTitle bgColor={theme.section}>
                      {isMansion ? "管理費等" : "制限・施設"}
                    </SectionTitle>
                    <InfoTable
                      rows={managementRows}
                      labelBgColor={theme.label}
                      autoValueWidth
                      compact={template === "chic"}
                    />
                  </div>
                )}

                {facilityRows.length > 0 && (
                  <div className="mt-2">
                    <SectionTitle bgColor={theme.section}>
                      {isRental ? "物件概要" : "設備・引渡"}
                    </SectionTitle>
                    <InfoTable
                      rows={facilityRows}
                      labelBgColor={theme.label}
                      autoValueWidth
                      compact={template === "chic"}
                    />
                  </div>
                )}

                <div className="mt-2">
                  <SectionTitle bgColor={theme.section}>備考</SectionTitle>
                  <div
                    className={`whitespace-pre-wrap border border-black border-t-0 p-2 text-[10px] ${
                      template === "chic"
                        ? isMansion
                          ? "min-h-[2.05cm]"
                          : "min-h-[4.29cm]"
                        : "min-h-[3.54cm]"
                    }`}
                    style={template === "chic" ? { fontSize: `${chicRemarksFontSize}px`, lineHeight: 1.4 } : undefined}
                  >
                    {displayRemarks}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[210px_1fr] border-t border-black">
              <div className="px-3 py-2 text-white" style={{ backgroundColor: theme.brand }}>
                <div
                  className={`${
                    template === "chic" ? "text-[22px]" : "text-2xl"
                  } font-extrabold leading-tight tracking-widest`}
                >
                  POWERWAY HOUSE
                </div>
                <div className="mt-0.5 text-[11px]">不動産　販売・賃貸・管理</div>
              </div>

              <div className="grid grid-cols-[1fr_88px_320px]">
                <div className="px-2 py-1 text-[10px] leading-4">
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <div className="font-semibold">{contact.licenseNo}</div>
                    <div className="font-semibold">
                      TEL：{contact.companyPhone}　FAX：{contact.companyFax}
                    </div>
                  </div>

                  <div className="text-[21px] font-extrabold leading-tight">{contact.companyName}</div>

                  <div className="truncate text-[10px]">{contact.companyAddress}</div>
                </div>

                <div className="flex items-center justify-center border-l border-black px-1 py-1">
                  {data.imgQr ? (
                    <img
                      src={toExportableImageSrc(data.imgQr)}
                      alt="QR"
                      className="h-20 w-20 object-cover"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-[10px] text-zinc-500">QR</div>
                  )}
                </div>

                <div className="border-l border-black text-[10px]">
                  <div className="grid grid-cols-[1fr_1fr] items-start border-b border-black px-2 py-1">
                    <div>
                      <div className="font-semibold">{inspectionNote}</div>
                    </div>
                    <div className="text-right">
                      <div>取引形態：{contact.transactionType}</div>
                      <div className="mt-0.5">担当者：{contact.staffName}</div>
                      <div className="mt-0.5">手数料：{contact.fee}</div>
                    </div>
                  </div>
                  <div className="px-2 py-1 text-right text-[9px]">
                    図面と相違する場合は現況を優先します。
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  if (!data) {
    if (!isSavedDraftsView) return null;

    return (
      <main className="min-h-screen bg-[#f3f4f6] p-2 md:p-4">
        <div className="mx-auto w-full max-w-[1500px]">
          <div className="mb-3 flex items-center justify-between">
            <Link
             href="/create"
              className="rounded-md bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700"
            >
              ← 入力画面に戻る
            </Link>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm md:p-4">
            {savedDrafts.length > 0 ? (
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
                <div className="mb-2 text-sm font-semibold text-sky-900">図面作成済（保存データ）</div>
                <ol className="space-y-2">
                  {savedDrafts.map((draft, index) => (
                    <li key={draft.id}>
                      <div className="flex items-stretch gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectDraft(draft)}
                          className="flex flex-1 items-start gap-2 rounded-md border border-sky-200 bg-white px-3 py-2 text-left text-sm text-sky-800 transition hover:bg-sky-100"
                         aria-label={`保存データ ${index + 1} をプレビュー選択`}
                        >
                          <span className="min-w-6 font-semibold">{index + 1}.</span>
                          <span>
                            <span className="block font-semibold">
                              {draft.payload.draftTitle || draft.payload.name || "(物件名未入力)"}
                            </span>
                            <span className="text-xs text-zinc-600">
                              {draft.savedAt || draft.payload.draftSavedAt || "保存日時なし"}
                            </span>
                          </span>
                        </button>
                         <button
                          type="button"
                          onClick={() => handleEditDraft(draft)}
                          className="rounded-md border border-sky-300 bg-sky-100 px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-200"
                          aria-label={`保存データ ${index + 1} を入力画面で編集`}
                        >
                          編集
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDraft(draft.id)}
                          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                          aria-label={`保存データ ${index + 1} を削除`}
                        >
                          削除
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600">
                保存済みの図面データはありません。
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f4f6] p-2 md:p-4">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="mb-3 flex items-center justify-between">
          {isSavedDraftsView ? (
            <Link
                href="/create"
              className="rounded-md bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700"
            >
              ← 入力画面に戻る
            </Link>
          ) : activeTemplate ? (
            <button
              type="button"
              onClick={() => setSelectedTemplate(null)}
              className="rounded-md bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700"
            >
              ← テンプレート選択に戻る
            </button>
          ) : (
            <Link
             href="/create"
              className="rounded-md bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700"
            >
              ← 入力画面に戻る
            </Link>
          )}

          {!isSavedDraftsView && activeTemplate && (
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold">デザインカラー選択</div>

              <div className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-2 py-1">
                {THEME_PICKER_COLORS.map((item) => {
                  const active = item.key === selectedTheme;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      aria-label={`theme-${item.key}`}
                      onClick={() => setSelectedTheme(item.key)}
                      className={`h-5 w-5 rounded-full border transition ${
                        active ? "scale-110 border-zinc-900" : "border-zinc-300"
                      }`}
                      style={{ backgroundColor: item.color }}
                    />
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="image-format" className="text-xs font-medium text-zinc-600">
                  画像形式
                </label>
                <select
                  id="image-format"
                  value={imageFormat}
                  onChange={(event) => setImageFormat(event.target.value as ImageFormat)}
                  className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm"
                >
                  <option value="png">PNG</option>
                  <option value="jpeg">JPG</option>
                </select>
              </div>

              <button
                type="button"
                onClick={previewDebugCanvas}
                disabled={isExporting}
                className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Canvas確認
              </button>

              <button
                type="button"
                onClick={saveAsImage}
                disabled={isExporting}
                className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                画像として保存
              </button>

              <button
                type="button"
                onClick={saveAsPdf}
                disabled={isExporting}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                PDFとして保存
              </button>
            </div>
          )}
        </div>

        {!isSavedDraftsView && exportError && (
          <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {exportError}
          </div>
        )}

        {!isSavedDraftsView && showDebugPreview && (
          <div className="mb-4 rounded-xl border border-sky-300 bg-sky-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold text-sky-900">Debug Canvas Preview</div>
              <button
                type="button"
                onClick={() => setShowDebugPreview(false)}
                className="rounded-md bg-white px-3 py-1 text-sm text-sky-700 border border-sky-300"
              >
                閉じる
              </button>
            </div>

            <div className="mb-2 whitespace-pre-wrap break-words rounded-md bg-white p-2 text-xs text-zinc-700 border">
              {debugCanvasInfo || "no debug info"}
            </div>

            {debugCanvasUrl ? (
              <div className="overflow-auto rounded-md border bg-white p-2">
                <img
                  src={debugCanvasUrl}
                  alt="debug-canvas-preview"
                  className="max-w-full h-auto border"
                />
              </div>
            ) : (
              <div className="rounded-md border bg-white p-4 text-sm text-red-600">
                Canvas preview unavailable
              </div>
            )}
          </div>
        )}

        <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm md:p-4">
          {isSavedDraftsView ? (
            <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
              <div>
                {savedDrafts.length > 0 ? (
                  <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
                    <div className="mb-2 text-sm font-semibold text-sky-900">
                      図面作成済（保存データ）
                    </div>
                    <ol className="space-y-2">
                      {savedDrafts.map((draft, index) => (
                        <li key={draft.id}>
                          <div className="flex items-stretch gap-2">
                            <button
                              type="button"
                              onClick={() => handleSelectDraft(draft)}
                              className={`flex flex-1 items-start gap-2 rounded-md border px-3 py-2 text-left text-sm transition ${
                                selectedDraftId === draft.id
                                  ? "border-sky-300 bg-sky-100 text-sky-900"
                                  : "border-sky-200 bg-white text-sky-800 hover:bg-sky-100"
                              }`}
                               aria-label={`保存データ ${index + 1} をプレビュー選択`}
                            >
                              <span className="min-w-6 font-semibold">{index + 1}.</span>
                              <span>
                                <span className="block font-semibold">
                                  {draft.payload.draftTitle ||
                                    draft.payload.name ||
                                    "(物件名未入力)"}
                                </span>
                                <span className="text-xs text-zinc-600">
                                  {draft.savedAt || draft.payload.draftSavedAt || "保存日時なし"}
                                </span>
                              </span>
                               </button>

                            <button
                              type="button"
                              onClick={() => handleEditDraft(draft)}
                              className="rounded-md border border-sky-300 bg-sky-100 px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-200"
                              aria-label={`保存データ ${index + 1} を入力画面で編集`}
                            >
                              編集
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteDraft(draft.id)}
                              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                            >
                              削除
                            </button>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600">
                    保存済みの図面データはありません。
                  </div>
                )}
              </div>

              <div>
                {data ? (
                  <div ref={previewRef} className="overflow-x-auto overflow-y-visible">
                    <div className="mx-auto" style={{ width: `${SHEET_WIDTH * sheetScale}px` }}>
                      <div
                        style={{
                          width: `${SHEET_WIDTH}px`,
                          height: `${SHEET_HEIGHT}px`,
                          transform: `scale(${sheetScale})`,
                          transformOrigin: "top left",
                        }}
                      >
                        {renderSheet(activeTemplate ?? "classic")}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600">
                    左側から保存データを選択してください。
                  </div>
                )}
              </div>
            </div>
          ) : !activeTemplate ? (
            <div className="grid gap-4 md:grid-cols-3">
              {TEMPLATE_OPTIONS.map((template) => (
                <div key={template.key} className="rounded-xl border border-zinc-200 p-4">
                  <div className="text-xl font-semibold">{template.title}</div>
                  <div className="mt-1 flex gap-1">
                    {template.swatches.map((color) => (
                      <div key={color} className="h-4 w-4 rounded" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-zinc-700">{template.subtitle}</div>
                  <button
                    type="button"
                    onClick={() => setSelectedTemplate(template.key)}
                    className="mt-3 w-full rounded-md bg-emerald-600 py-2 font-semibold text-white"
                  >
                    選択
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div ref={previewRef} className="overflow-x-auto overflow-y-visible">
              <div className="mx-auto" style={{ width: `${SHEET_WIDTH * sheetScale}px` }}>
                <div
                  style={{
                    width: `${SHEET_WIDTH}px`,
                    height: `${SHEET_HEIGHT}px`,
                    transform: `scale(${sheetScale})`,
                    transformOrigin: "top left",
                  }}
                >
                  {renderSheet(activeTemplate)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ZumenPage() {
  return (
    <Suspense fallback={null}>
      <ZumenPageContent />
    </Suspense>
  );
}
