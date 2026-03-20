import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("zumen_drafts")
    .select("id, draft_title, payload, saved_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const drafts =
    data?.map((item) => ({
      id: item.id,
      savedAt: item.updated_at ?? item.saved_at,
      payload: {
        ...(item.payload || {}),
        draftTitle: item.draft_title,
        draftSavedAt: item.updated_at ?? item.saved_at,
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
      draft_title: draftTitle,
      payload: {
        ...payload,
        draftId: id,
        draftTitle,
        draftSavedAt: now,
      },
      updated_at: now,
    };

    const { error } = await supabase
      .from("zumen_drafts")
      .upsert(row, { onConflict: "id" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
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
    return NextResponse.json({ error: "draftId is required" }, { status: 400 });
  }

  const { error } = await supabase.from("zumen_drafts").delete().eq("id", draftId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
