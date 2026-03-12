import { NextRequest } from "next/server";

type SyncPayload = {
  propertyId: string;
  propertyCode: string;
  buildingName: string;
  address: string;
  viewMethod: string;
  status: string;
  managerName: string;
  managerEmail: string;
 formUrl: string;
  qrUrl: string;
  available?: string;
  inquiryUrl?: string;
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
    uuid: payload.propertyId,
    property_code: payload.propertyCode,
    building_name: payload.buildingName ?? "",
    address: payload.address ?? "",
    view_method: payload.viewMethod ?? "",
    tatus: payload.status ?? payload.available ?? "",
    manager_name: payload.managerName ?? "",
    manager_email: payload.managerEmail ?? "",
    form_url: payload.formUrl ?? payload.inquiryUrl ?? "",
    qr_url: payload.qrUrl ?? "",
  };

  const restUrl = `${supabaseUrl}/rest/v1/${tableName}?on_conflict=uuid`;
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
