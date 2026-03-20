import { NextRequest } from "next/server";

type DraftPayload = Record<string, unknown>;

type StoredDraft = {
  id: string;
  savedAt: string;
  payload: DraftPayload;
};

function isDraftPayload(value: unknown): value is DraftPayload {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getEnvOrEmpty(name: string) {
  return process.env[name]?.trim() ?? "";
}

function getSupabaseConfig() {
  const supabaseUrl =
    getEnvOrEmpty("SUPABASE_URL") || getEnvOrEmpty("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseKey =
    getEnvOrEmpty("SUPABASE_SERVICE_ROLE_KEY") ||
    getEnvOrEmpty("SUPABASE_ANON_KEY") ||
    getEnvOrEmpty("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const tableName = getEnvOrEmpty("SUPABASE_ZUMEN_DRAFTS_TABLE") || "zumen_drafts";

  return { supabaseUrl, supabaseKey, tableName };
}
function normalizeSavedAt(value?: string) {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
}

function getHeaders(key: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export async function GET(req: NextRequest) {
  const { supabaseUrl, supabaseKey, tableName } = getSupabaseConfig();
  if (!supabaseUrl || !supabaseKey) {
    return Response.json({ error: "Supabase env missing." }, { status: 500 });
  }

  const draftId = req.nextUrl.searchParams.get("draftId")?.trim();
  const select = "id,saved_at,payload";
  const query = draftId
    ? `${supabaseUrl}/rest/v1/${tableName}?id=eq.${encodeURIComponent(draftId)}&select=${select}&limit=1`
    : `${supabaseUrl}/rest/v1/${tableName}?select=${select}&order=saved_at.desc`;

  const res = await fetch(query, { headers: getHeaders(supabaseKey), cache: "no-store" });
  if (!res.ok) {
    return Response.json({ error: await res.text() }, { status: res.status });
  }

  const rows = (await res.json()) as Array<{ id: string; saved_at: string; payload: DraftPayload }>;
  const drafts: StoredDraft[] = rows.map((row) => ({
    id: row.id,
    savedAt: row.saved_at,
    payload: isDraftPayload(row.payload) ? row.payload : {},
  }));
  return Response.json({ drafts });
}

export async function POST(req: NextRequest) {
  const { supabaseUrl, supabaseKey, tableName } = getSupabaseConfig();
  if (!supabaseUrl || !supabaseKey) {
    return Response.json({ error: "Supabase env missing." }, { status: 500 });
  }

  const body = (await req.json()) as Partial<StoredDraft>;
  if (!body.id || !body.payload) {
    return Response.json({ error: "Missing id or payload" }, { status: 400 });
  }

  const savedAt = normalizeSavedAt(body.savedAt);
  const row = {
    id: body.id,
    saved_at: savedAt,
    payload: body.payload,
  };

  const res = await fetch(`${supabaseUrl}/rest/v1/${tableName}?on_conflict=id`, {
    method: "POST",
    headers: {
      ...getHeaders(supabaseKey),
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(row),
  });

  if (!res.ok) {
    return Response.json({ error: await res.text() }, { status: res.status });
  }

  return Response.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { supabaseUrl, supabaseKey, tableName } = getSupabaseConfig();
  if (!supabaseUrl || !supabaseKey) {
    return Response.json({ error: "Supabase env missing." }, { status: 500 });
  }

  const draftId = req.nextUrl.searchParams.get("draftId")?.trim();
  if (!draftId) {
    return Response.json({ error: "Missing draftId" }, { status: 400 });
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/${tableName}?id=eq.${encodeURIComponent(draftId)}`, {
    method: "DELETE",
    headers: getHeaders(supabaseKey),
  });

  if (!res.ok) {
    return Response.json({ error: await res.text() }, { status: res.status });
  }

  return Response.json({ ok: true });
}
