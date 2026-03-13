import { NextRequest } from "next/server";

export const runtime = "nodejs";

type GeocodeResult = {
  lat: string;
  lon: string;
};

function toDataUrl(contentType: string, data: ArrayBuffer) {
  const base64 = Buffer.from(data).toString("base64");
  return `data:${contentType};base64,${base64}`;
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
          "User-Agent": "IA-rumen/1.0 (address-map)",
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

    const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${first.lat},${first.lon}&zoom=16&size=900x540&markers=${first.lat},${first.lon},red-pushpin`;
    const mapRes = await fetch(mapUrl, {
      headers: {
        "User-Agent": "IA-rumen/1.0 (address-map)",
        Accept: "image/*,*/*;q=0.8",
      },
      cache: "no-store",
    });

    if (!mapRes.ok) {
      return Response.json({ error: "failed to fetch map image" }, { status: 502 });
    }

    const contentType = mapRes.headers.get("content-type") || "image/png";
    const mapArrayBuffer = await mapRes.arrayBuffer();

    return Response.json({
      mapDataUrl: toDataUrl(contentType, mapArrayBuffer),
      lat: first.lat,
      lon: first.lon,
    });
  } catch (error) {
    console.error("address-map api error:", error);
    return Response.json({ error: "address map generation failed" }, { status: 500 });
  }
}
