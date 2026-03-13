import { NextRequest, NextResponse } from "next/server";

const USER_AGENT = "powerway-map-generator/1.0";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawAddress = String(body?.address || "").trim();

    if (!rawAddress) {
      return NextResponse.json({ error: "住所を入力してください。" }, { status: 400 });
    }

    const encodedAddress = encodeURIComponent(rawAddress);

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
      return NextResponse.json({ error: "住所検索APIの取得に失敗しました。" }, { status: 500 });
    }

    const geoData = (await geoRes.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;

    if (!Array.isArray(geoData) || geoData.length === 0) {
      return NextResponse.json({ error: "MAP生成に失敗しました。住所を確認してください。" }, { status: 404 });
    }

    const { lat, lon, display_name } = geoData[0];

    const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=16&size=900x500&markers=${lat},${lon},red-pushpin`;

    return NextResponse.json({
      success: true,
      lat,
      lon,
      displayName: display_name,
      mapUrl,
    });
  } catch (error) {
    console.error("map generate error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}
