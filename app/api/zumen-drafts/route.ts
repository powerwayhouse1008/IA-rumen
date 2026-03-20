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
function normalizeDraftPayload(value: unknown): DraftPayload {
  if (isDraftPayload(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (isDraftPayload(parsed)) {
        return parsed;
      }
    } catch {
      // Keep fallback below for invalid JSON strings.
    }
  }
  return {};
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
function isMissingColumnError(message: string, column: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("column") && normalized.includes(column.toLowerCase());
}

async function fetchDraftRows(
  supabaseUrl: string,
  supabaseKey: string,
  tableName: string,
  draftId?: string,
) {
  const snakeSelect = "id,saved_at,payload";
  const camelSelect = "id,savedAt,payload";

  const snakeQuery = draftId
    ? `${supabaseUrl}/rest/v1/${tableName}?id=eq.${encodeURIComponent(draftId)}&select=${snakeSelect}&limit=1`
    : `${supabaseUrl}/rest/v1/${tableName}?select=${snakeSelect}&order=saved_at.desc`;
  const snakeRes = await fetch(snakeQuery, {
    headers: getHeaders(supabaseKey),
    cache: "no-store",
  });
  if (snakeRes.ok) {
    return {
      ok: true as const,
      rows: (await snakeRes.json()) as Array<{ id: string; saved_at?: string; payload: unknown }>,
    };
  }

  const snakeError = await snakeRes.text();
  if (!isMissingColumnError(snakeError, "saved_at")) {
    return {
      ok: false as const,
      status: snakeRes.status,
      error: snakeError,
    };
  }

  const camelQuery = draftId
    ? `${supabaseUrl}/rest/v1/${tableName}?id=eq.${encodeURIComponent(draftId)}&select=${camelSelect}&limit=1`
    : `${supabaseUrl}/rest/v1/${tableName}?select=${camelSelect}&order=savedAt.desc`;
  const camelRes = await fetch(camelQuery, {
    headers: getHeaders(supabaseKey),
    cache: "no-store",
  });
  if (!camelRes.ok) {
    return {
      ok: false as const,
      status: camelRes.status,
      error: await camelRes.text(),
    };
  }

  return {
    ok: true as const,
    rows: (await camelRes.json()) as Array<{ id: string; savedAt?: string; payload: unknown }>,
  };
}

async function upsertDraftRow(
  supabaseUrl: string,
  supabaseKey: string,
  tableName: string,
  row: { id: string; saved_at: string; payload: DraftPayload },
) {
  const endpoint = `${supabaseUrl}/rest/v1/${tableName}?on_conflict=id`;
  const baseHeaders = {
    ...getHeaders(supabaseKey),
    Prefer: "resolution=merge-duplicates,return=representation",
  };

  const snakeRes = await fetch(endpoint, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify(row),
  });
  if (snakeRes.ok) return { ok: true as const };

  const snakeError = await snakeRes.text();
  if (!isMissingColumnError(snakeError, "saved_at")) {
    return {
      ok: false as const,
      status: snakeRes.status,
      error: snakeError,
    };
  }

  const { saved_at, ...rest } = row;
  const camelRes = await fetch(endpoint, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ ...rest, savedAt: saved_at }),
  });
  if (!camelRes.ok) {
    return {
      ok: false as const,
      status: camelRes.status,
      error: await camelRes.text(),
    };
  }

  return { ok: true as const };
}

export async function GET(req: NextRequest) {
  const { supabaseUrl, supabaseKey, tableName } = getSupabaseConfig();
  if (!supabaseUrl || !supabaseKey) {
    return Response.json({ error: "Supabase env missing." }, { status: 500 });
  }

  const draftId = req.nextUrl.searchParams.get("draftId")?.trim();
  const result = await fetchDraftRows(supabaseUrl, supabaseKey, tableName, draftId);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

   const drafts: StoredDraft[] = result.rows.map((row) => ({
    id: row.id,
   savedAt:
      ("saved_at" in row && typeof row.saved_at === "string" && row.saved_at) ||
      ("savedAt" in row && typeof row.savedAt === "string" && row.savedAt) ||
      new Date().toISOString(),
    payload: normalizeDraftPayload(row.payload),
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

 const result = await upsertDraftRow(supabaseUrl, supabaseKey, tableName, row);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
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
