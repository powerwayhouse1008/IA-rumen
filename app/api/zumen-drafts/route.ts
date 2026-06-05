import { NextRequest, NextResponse } from "next/server";

function getEnvOrEmpty(name: string) {
  return process.env[name]?.trim() ?? "";
}

const supabaseUrl =
  getEnvOrEmpty("SUPABASE_URL") || getEnvOrEmpty("NEXT_PUBLIC_SUPABASE_URL");
const supabaseKey =
  getEnvOrEmpty("SUPABASE_SERVICE_ROLE_KEY") ||
  getEnvOrEmpty("SUPABASE_ANON_KEY") ||
  getEnvOrEmpty("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const draftsTable = getEnvOrEmpty("SUPABASE_ZUMEN_DRAFTS_TABLE") || "zumen_drafts";

type DraftRecord = {
  id: string;
  draft_title?: string | null;
  payload: Record<string, unknown> | null;
  saved_at: string | null;
  updated_at?: string | null;
};

function ensureSupabaseConfig() {
  if (!supabaseUrl || !supabaseKey) {
    return "Supabaseの接続設定が未設定です。管理者に環境変数を確認してください。";
  }

  return null;
}

function toFriendlySupabaseError(errorText: string, status?: number) {
  const message = errorText.trim();

  if (/duplicate key|unique/i.test(message)) {
    return "同じ保存データがすでに存在します。保存名を変更するか、時間をおいて再度お試しください。";
  }

  if (/Could not find|missing column|column/i.test(message)) {
    return "Supabaseの保存先テーブルに必要な列がありません。管理者にテーブル設定の確認を依頼してください。";
  }

  if (/table|relation/i.test(message)) {
    return "Supabaseの保存先テーブルが見つかりません。管理者にテーブル名の設定を確認してください。";
  }

  if (/permission|jwt|not authorized|unauthorized/i.test(message) || status === 401 || status === 403) {
    return "Supabaseへの保存権限がありません。管理者にAPIキーまたはRLS設定の確認を依頼してください。";
  }

  return status
    ? `Supabaseとの通信に失敗しました。時間をおいて再度お試しください。（ステータス: ${status}）`
    : "Supabaseとの通信に失敗しました。時間をおいて再度お試しください。";
}

async function supabaseRequest<T>(path: string, init?: RequestInit): Promise<{ data: T | null; error: string | null }> {
  const configError = ensureSupabaseConfig();
  if (configError) {
    return { data: null, error: configError };
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabaseKey!,
      Authorization: `Bearer ${supabaseKey!}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    return { data: null, error: toFriendlySupabaseError(message, response.status) };
  }

  if (response.status === 204) {
    return { data: null, error: null };
  }

  const data = (await response.json()) as T;
  return { data, error: null };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const draftId = searchParams.get("draftId")?.trim();
  const query = draftId
    ? `${draftsTable}?select=id,payload,saved_at&id=eq.${encodeURIComponent(draftId)}&limit=1`
    : `${draftsTable}?select=id,payload,saved_at&order=saved_at.desc`;

  const { data, error } = await supabaseRequest<DraftRecord[]>(query);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  const drafts =
    data?.map((item) => ({
      id: item.id,
      savedAt: item.updated_at ?? item.saved_at,
      payload: {
        ...(item.payload || {}),
        draftTitle:
          typeof item.payload?.draftTitle === "string"
            ? item.payload.draftTitle
            : typeof item.payload?.name === "string"
              ? item.payload.name
              : "無題の図面",
        draftSavedAt: item.saved_at,
        draftId: item.id,
      },
    })) ?? [];

  return NextResponse.json({ drafts });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = body?.payload ?? {};
    const id =
      body?.id?.trim?.() ||
      payload?.draftId?.trim?.() ||
      `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const draftTitle =
      body?.draftTitle?.trim?.() ||
      payload?.draftTitle?.trim?.() ||
      payload?.name?.trim?.() ||
      "無題の図面";

    const now = new Date().toISOString();

    const row = {
      id,
      payload: {
        ...payload,
        draftId: id,
        draftTitle,
        draftSavedAt: now,
      },
      saved_at: now,
    };

    const { error } = await supabaseRequest<unknown>(`${draftsTable}?on_conflict=id`, {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(row),
    });

    if (error) {
       return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      id,
      draftTitle,
      savedAt: now,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const draftId = searchParams.get("draftId");

  if (!draftId) {
    return NextResponse.json({ error: "削除する保存データIDが見つかりません。" }, { status: 400 });
  }

  const { error } = await supabaseRequest<unknown>(`${draftsTable}?id=eq.${encodeURIComponent(draftId)}`, {
    method: "DELETE",
    headers: {
      Prefer: "return=minimal",
    },
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
