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

  // backward compatibility with older client payload names
  available?: string;
  inquiryUrl?: string;
};

function getEnvOrEmpty(name: string) {
  return process.env[name]?.trim() ?? "";
}

async function upsertToSupabase(payload: Partial<SyncPayload>) {
  const supabaseUrl =
    getEnvOrEmpty("SUPABASE_URL") || getEnvOrEmpty("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseKey =
    getEnvOrEmpty("SUPABASE_SERVICE_ROLE_KEY") ||
    getEnvOrEmpty("SUPABASE_ANON_KEY") ||
    getEnvOrEmpty("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const tableName = getEnvOrEmpty("SUPABASE_QR_TABLE") || "qr_properties";
  const primaryKey = getEnvOrEmpty("SUPABASE_QR_PRIMARY_KEY") || "uuid";

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase env missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or anon key)."
    );
  }

  const normalizedStatus = payload.status ?? payload.available ?? "";
  const normalizedFormUrl = payload.formUrl ?? payload.inquiryUrl ?? "";

  const row = {
    uuid: payload.propertyId,
    property_code: payload.propertyCode,
    building_name: payload.buildingName ?? "",
    address: payload.address ?? "",
    view_method: payload.viewMethod ?? "",
    status: normalizedStatus,
    manager_name: payload.managerName ?? "",
    manager_email: payload.managerEmail ?? "",
    form_url: normalizedFormUrl,
    qr_url: payload.qrUrl ?? "",
  };

  const restUrl = `${supabaseUrl}/rest/v1/${tableName}?on_conflict=${primaryKey}`;
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
    throw new Error(`Supabase upsert failed: ${res.status} ${errText}`);
  }

  return res.json();
}

async function syncToMirrorVercel(payload: Partial<SyncPayload>) {
  const mirrorSyncUrl =
    getEnvOrEmpty("MIRROR_SYNC_URL") || getEnvOrEmpty("NEXT_PUBLIC_MIRROR_SYNC_URL");
  const mirrorSyncToken =
    getEnvOrEmpty("MIRROR_SYNC_TOKEN") ||
    getEnvOrEmpty("NEXT_PUBLIC_MIRROR_SYNC_TOKEN");

  if (!mirrorSyncUrl) {
    return { skipped: true as const };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (mirrorSyncToken) {
    headers.Authorization = `Bearer ${mirrorSyncToken}`;
  }

  const res = await fetch(mirrorSyncUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Mirror sync failed: ${res.status} ${errText}`);
  }

  return { skipped: false as const };
}

export async function POST(req: NextRequest) {
  const payload = (await req.json()) as Partial<SyncPayload>;

  if (!payload.propertyId || !payload.propertyCode) {
    return Response.json(
      { error: "Missing propertyId/propertyCode" },
      { status: 400 }
    );
  }

  try {
    const [supabaseData, mirrorResult] = await Promise.all([
      upsertToSupabase(payload),
      syncToMirrorVercel(payload),
    ]);

    return Response.json({ ok: true, data: supabaseData, mirror: mirrorResult });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Sync failed unexpectedly.";
    return Response.json({ error: message }, { status: 500 });
  }
}
