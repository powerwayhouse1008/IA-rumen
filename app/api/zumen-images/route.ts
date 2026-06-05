import { NextResponse } from "next/server";

function getEnvOrEmpty(name: string) {
  return process.env[name]?.trim() ?? "";
}

const supabaseUrl =
  getEnvOrEmpty("SUPABASE_URL") || getEnvOrEmpty("NEXT_PUBLIC_SUPABASE_URL");
const supabaseKey =
  getEnvOrEmpty("SUPABASE_SERVICE_ROLE_KEY") ||
  getEnvOrEmpty("SUPABASE_ANON_KEY") ||
  getEnvOrEmpty("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const storageBucket =
  getEnvOrEmpty("SUPABASE_STORAGE_BUCKET") || getEnvOrEmpty("NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET") || "zumen-images";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

function ensureSupabaseConfig() {
  if (!supabaseUrl || !supabaseKey) {
    return "Supabaseの接続設定が未設定です。管理者に環境変数を確認してください。";
  }
  return null;
}

function toFriendlyStorageError(errorText: string, status?: number) {
  const message = errorText.trim();

  if (/bucket|not found/i.test(message)) {
    return "Supabase Storageの保存先バケットが見つかりません。管理者にバケット設定を確認してください。";
  }

  if (/payload too large|too large|413/i.test(message) || status === 413) {
    return "画像サイズが大きすぎます。画像を小さくしてからもう一度アップロードしてください。";
  }

  if (/permission|jwt|not authorized|unauthorized/i.test(message) || status === 401 || status === 403) {
    return "Supabase Storageへの保存権限がありません。管理者にAPIキーまたはStorage権限を確認してください。";
  }

  return status
    ? `画像のアップロードに失敗しました。時間をおいて再度お試しください。（ステータス: ${status}）`
    : "画像のアップロードに失敗しました。時間をおいて再度お試しください。";
}

function normalizeExtension(extension: string, mimeType: string) {
  const ext = extension.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (ext) return ext;

  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  if (mimeType === "image/svg+xml") return "svg";
  return "jpg";
}

export async function POST(req: Request) {
  const configError = ensureSupabaseConfig();
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const rawExtension = String(formData.get("extension") ?? "");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "アップロードする画像ファイルを選択してください。" }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: "対応していない画像形式です。JPEG、PNG、WebP、GIF、SVGを使用してください。" }, { status: 400 });
    }

    const extension = normalizeExtension(rawExtension, file.type);
    const filePath = `drafts/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;

    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/${storageBucket}/${filePath}`, {
      method: "POST",
      headers: {
        apikey: supabaseKey!,
        Authorization: `Bearer ${supabaseKey!}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "true",
      },
      body: file,
    });

    if (!uploadRes.ok) {
      const message = await uploadRes.text();
      return NextResponse.json(
        { error: toFriendlyStorageError(message, uploadRes.status) },
        { status: 500 }
      );
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${storageBucket}/${filePath}`;
    return NextResponse.json({ publicUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "画像のアップロード中に予期しないエラーが発生しました。" },
      { status: 500 }
    );
  }
}
