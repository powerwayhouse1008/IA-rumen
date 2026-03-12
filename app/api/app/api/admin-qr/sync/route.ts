import { NextRequest } from "next/server";

type SyncPayload = {
  propertyId: string;
  propertyCode: string;
  buildingName: string;
  address: string;
  viewMethod: string;
  available: string;
  managerName: string;
  managerEmail: string;
  inquiryUrl: string;
};

function getEnvOrEmpty(name: string) {
  return process.env[name]?.trim() ?? "";
}

export async function POST(req: NextRequest) {
  const payload = (await req.json()) as Partial<SyncPayload>;

  if (!payload.propertyId || !payload.propertyCode) {
    return Response.json({ error: "Missing propertyId/propertyCode" }, { status: 400 });
  }

  const supabaseUrl = getEnvOrEmpty("SUPABASE_URL") || getEnvOrEmpty("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseKey = getEnvOrEmpty("SUPABASE_SERVICE_ROLE_KEY") || getEnvOrEmpty("SUPABASE_ANON_KEY") || getEnvOrEmpty("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const tableName = getEnvOrEmpty("SUPABASE_QR_TABLE") || "qr_properties";

  if (!supabaseUrl || !supabaseKey) {
    return Response.json(
      { error: "Supabase env missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or anon key)." },
      { status: 500 }
    );
  }

  const row = {
    id: payload.propertyId,
    property_code: payload.propertyCode,
    building_name: payload.buildingName ?? "",
    address: payload.address ?? "",
    view_method: payload.viewMethod ?? "",
    available: payload.available ?? "",
    manager_name: payload.managerName ?? "",
    manager_email: payload.managerEmail ?? "",
    inquiry_url: payload.inquiryUrl ?? "",
    updated_at: new Date().toISOString(),
  };

  const restUrl = `${supabaseUrl}/rest/v1/${tableName}?on_conflict=id`;
  const res = await fetch(restUrl, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(row),
  });

  if (!res.ok) {
    const errText = await res.text();
    return Response.json(
      { error: `Supabase upsert failed: ${res.status} ${errText}` },
      { status: 500 }
    );
  }

  const data = await res.json();
  return Response.json({ ok: true, data });
}
