import { NextRequest } from "next/server";

type SyncPayload = {
  propertyId: string;
  propertyCode: string;
  buildingName: string;
  address: string;
  price: string;
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

function parseSuggestedTable(errorText: string) {
  return errorText.match(/table\s+'public\.([^']+)'/i)?.[1];
}

function parseMissingColumn(errorText: string) {
  return errorText.match(/Could not find the '([^']+)' column of '[^']+'/i)?.[1];
}

function buildSupabaseErrorMessage(errorText: string, status: number, tableName: string) {
  const suggestedTable = parseSuggestedTable(errorText);
  const missingColumn = parseMissingColumn(errorText);

  if (/duplicate key|unique/i.test(errorText)) {
    return "同じ物件コードがすでに登録されています。物件コードを変更して、もう一度作成してください。";
  }

  if (/there is no unique or exclusion constraint|on_conflict/i.test(errorText)) {
    return `Supabaseの「${tableName}」テーブルで property_code の重複チェック設定が不足しています。管理者にユニーク制約の確認を依頼してください。`;
  }

  if (missingColumn) {
    return `Supabaseの「${tableName}」テーブルに「${missingColumn}」列がありません。管理者にテーブル項目の追加を依頼してください。`;
  }

  if (suggestedTable) {
    return `Supabaseの保存先テーブル「${tableName}」が見つかりません。設定値を「${suggestedTable}」に変更するか、正しいテーブルを作成してください。`;
  }

  if (/permission|jwt|not authorized|unauthorized/i.test(errorText) || status === 401 || status === 403) {
    return "Supabaseへの保存権限がありません。管理者にAPIキーまたはRLS設定の確認を依頼してください。";
  }

  return `Supabaseへの保存に失敗しました。管理者に確認してください。（ステータス: ${status}）`;
}

function buildRow(payload: Partial<SyncPayload>) {
  const normalizedStatus = payload.status ?? payload.available ?? "";
  const normalizedFormUrl = payload.formUrl ?? payload.inquiryUrl ?? "";

  return {
     id: payload.propertyId,
    property_code: payload.propertyCode,
    building_name: payload.buildingName ?? "",
    address: payload.address ?? "",
    price: payload.price ?? "",
    view_method: payload.viewMethod ?? "",
    status: normalizedStatus,
    manager_name: payload.managerName ?? "",
    manager_email: payload.managerEmail ?? "",
    form_url: normalizedFormUrl,
    qr_url: payload.qrUrl ?? "",
  };
  }

  async function upsertToSupabase(payload: Partial<SyncPayload>) {
  const supabaseUrl =
    getEnvOrEmpty("SUPABASE_URL") || getEnvOrEmpty("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseKey =
    getEnvOrEmpty("SUPABASE_SERVICE_ROLE_KEY") ||
    getEnvOrEmpty("SUPABASE_ANON_KEY") ||
    getEnvOrEmpty("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const configuredTableName = getEnvOrEmpty("SUPABASE_QR_TABLE") || "properties";
 if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabaseの接続設定が未設定です。管理者に環境変数（SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY）を確認してください。"
    );
  }

  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  const row = buildRow(payload);
  const restUrl = `${supabaseUrl}/rest/v1/${configuredTableName}`;
  const res = await fetch(restUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(row),
  });
    if (!res.ok) {
    const errText = await res.text();
    throw new Error(buildSupabaseErrorMessage(errText, res.status, configuredTableName));
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
      { error: "物件IDまたは物件コードが不足しています。もう一度作成してください。" },
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
      error instanceof Error ? error.message : "同期中に予期しないエラーが発生しました。";
    return Response.json({ error: message }, { status: 500 });
  }
}
