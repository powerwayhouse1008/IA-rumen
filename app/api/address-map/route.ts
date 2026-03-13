import { NextRequest, NextResponse } from "next/server";

const USER_AGENT = "powerway-map-generator/1.0";
const DEFAULT_MAP_ZOOM = 14;

type GeocodeResult = {
  lat: string;
  lon: string;
  displayName: string;
};

function normalizeAddress(address: string) {
  return address
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();
}
function buildGsiTileUrl(lat: number, lon: number, zoom = DEFAULT_MAP_ZOOM) {
  const scale = 2 ** zoom;
  const x = Math.floor(((lon + 180) / 360) * scale);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * scale
  );

  return `https://cyberjapandata.gsi.go.jp/xyz/pale/${zoom}/${x}/${y}.png`;
}

async function geocodeByNominatim(address: string): Promise<GeocodeResult | null> {
  const encodedAddress = encodeURIComponent(address);
  const geoRes = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodedAddress}`,
    {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "ja",
      },
      cache: "no-store",
    }
  );

  if (!geoRes.ok) {
    return null;
  }

  const geoData = (await geoRes.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  if (!Array.isArray(geoData) || geoData.length === 0) {
    return null;
  }

  const { lat, lon, display_name } = geoData[0];
  return {
    lat,
    lon,
    displayName: display_name,
  };
}

async function geocodeByGsi(address: string): Promise<GeocodeResult | null> {
  const encodedAddress = encodeURIComponent(address);
  const response = await fetch(`https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodedAddress}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as Array<{
    geometry?: {
      coordinates?: [number, number];
    };
    properties?: {
      title?: string;
    };
  }>;

  const feature = Array.isArray(payload) ? payload[0] : null;
  const coordinates = feature?.geometry?.coordinates;
  if (!coordinates || coordinates.length < 2) {
    return null;
  }

  const [lon, lat] = coordinates;
  return {
    lat: String(lat),
    lon: String(lon),
    displayName: feature?.properties?.title || address,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawAddress = String(body?.address || "").trim();

    if (!rawAddress) {
      return NextResponse.json({ error: "住所を入力してください。" }, { status: 400 });
    }

    const normalizedAddress = normalizeAddress(rawAddress);

    const geoResult = (await geocodeByNominatim(normalizedAddress)) || (await geocodeByGsi(normalizedAddress));

    if (!geoResult) {
      return NextResponse.json({ error: "MAP生成に失敗しました。住所を確認してください。" }, { status: 404 });
    }

     const { lat, lon, displayName } = geoResult;
    const latitude = Number(lat);
    const longitude = Number(lon);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json({ error: "座標の解決に失敗しました。" }, { status: 500 });
    }

    const mapUrl = `/api/image-proxy?url=${encodeURIComponent(buildGsiTileUrl(latitude, longitude))}`;

    return NextResponse.json({
      success: true,
      lat,
      lon,
      displayName,
      mapUrl,
    });
  } catch (error) {
    console.error("map generate error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}
