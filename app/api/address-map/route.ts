import { NextRequest } from "next/server";

export const runtime = "nodejs";

type GeocodeResult = {
  lat: string;
  lon: string;
};
type StaticMapProvider = {
  name: string;
  buildUrl: (lat: string, lon: string) => string;
};
type AddressMapResponse = {
  mapDataUrl?: string;
  mapUrl?: string;
  lat: string;
  lon: string;
  provider?: string;
  fallback?: boolean;
};

const MAP_FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
};
const STATIC_MAP_PROVIDERS: StaticMapProvider[] = [
  {
    name: "openstreetmap.de",
    buildUrl: (lat, lon) =>
      `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=16&size=900x540&markers=${lat},${lon},red-pushpin`,
  },
  {
    name: "openstreetmap.fr",
    buildUrl: (lat, lon) =>
      `https://staticmap.openstreetmap.fr/?center=${lat},${lon}&zoom=16&size=900x540&markers=${lat},${lon},red-pushpin`,
  },
  {
    name: "wikimedia",
    buildUrl: (lat, lon) => `https://maps.wikimedia.org/img/osm-intl,16,${lon},${lat},900x540.png`,
  },
  {
    name: "openstreetmap-tile",
    buildUrl: (lat, lon) => {
      const zoom = 16;
      const latNum = Number.parseFloat(lat);
      const lonNum = Number.parseFloat(lon);
      const latRad = (latNum * Math.PI) / 180;
      const tileX = Math.floor(((lonNum + 180) / 360) * 2 ** zoom);
      const tileY = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * 2 ** zoom);
      return `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`;
    },
  },
];

function toDataUrl(contentType: string, data: ArrayBuffer) {
  const base64 = Buffer.from(data).toString("base64");
  return `data:${contentType};base64,${base64}`;
}
async function fetchMapImage(lat: string, lon: string) {
  const errors: string[] = [];

  for (const provider of STATIC_MAP_PROVIDERS) {
    try {
      const mapRes = await fetch(provider.buildUrl(lat, lon), {
         headers: MAP_FETCH_HEADERS,
        cache: "no-store",
      });

      if (!mapRes.ok) {
        errors.push(`${provider.name}: HTTP ${mapRes.status}`);
        continue;
      }

      const contentType = mapRes.headers.get("content-type") || "";
      if (!contentType.startsWith("image/")) {
        errors.push(`${provider.name}: invalid content-type ${contentType || "unknown"}`);
        continue;
      }

      const mapArrayBuffer = await mapRes.arrayBuffer();
      if (!mapArrayBuffer.byteLength) {
        errors.push(`${provider.name}: empty image`);
        continue;
      }

      return {
        provider: provider.name,
        mapDataUrl: toDataUrl(contentType, mapArrayBuffer),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${provider.name}: ${message}`);
    }
  }

  throw new Error(`all static map providers failed: ${errors.join(" | ")}`);
}
function buildFallbackMapUrl(lat: string, lon: string) {
  const primaryUrl = STATIC_MAP_PROVIDERS[0]?.buildUrl(lat, lon);
  if (!primaryUrl) return undefined;
  return `/api/image-proxy?url=${encodeURIComponent(primaryUrl)}`;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { address?: string } | null;
  const address = body?.address?.trim();

  if (!address) {
    return Response.json({ error: "address is required" }, { status: 400 });
  }

  try {
    const geocodeRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`,
      {
        headers: {
          User-Agent": "IA-rumen/1.0 (address-map; contact: support@powerway.house)",
          Accept: "application/json",
          "Accept-Language": "ja,en;q=0.8",
        },
        cache: "no-store",
      }
    );

    if (!geocodeRes.ok) {
      return Response.json({ error: "failed to geocode address" }, { status: 502 });
    }

    const geocodeData = (await geocodeRes.json()) as GeocodeResult[];
    const first = geocodeData[0];

    if (!first) {
      return Response.json({ error: "address not found" }, { status: 404 });
    }

    try {
      const mapResult = await fetchMapImage(first.lat, first.lon);

     const payload: AddressMapResponse = {
        mapDataUrl: mapResult.mapDataUrl,
        lat: first.lat,
        lon: first.lon,
        provider: mapResult.provider,
      };

      return Response.json(payload);
    } catch (mapError) {
      const fallbackUrl = buildFallbackMapUrl(first.lat, first.lon);
      if (!fallbackUrl) {
        throw mapError;
      }

      const payload: AddressMapResponse = {
        mapUrl: fallbackUrl,
        lat: first.lat,
        lon: first.lon,
        provider: "image-proxy-fallback",
        fallback: true,
      };

      return Response.json(payload);
    }
  } catch (error) {
    console.error("address-map api error:", error);
    return Response.json({ error: "address map generation failed" }, { status: 500 });
  }
}
