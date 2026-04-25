import { NextResponse } from "next/server";
import { getAIProvider, improveBullet } from "@/lib/ai/service";
import { MAX_BULLET_CHARS } from "@/lib/ai/limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { text?: string };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const text = String(body.text ?? "");
  if (!text.trim()) {
    return NextResponse.json({ error: "Bullet text is required" }, { status: 400 });
  }
  if (text.length > MAX_BULLET_CHARS) {
    return NextResponse.json(
      { error: "Text is too long. Shorten the bullet and try again." },
      { status: 400 },
    );
  }
  try {
    const provider = getAIProvider();
    const suggestion = await improveBullet(provider, text);
    return NextResponse.json({ suggestion });
  } catch (err) {
    console.error(
      "[api/builder/improve-bullet]",
      err instanceof Error ? err.message : String(err),
    );
    return NextResponse.json(
      { error: "Could not improve this bullet. Try again." },
      { status: 502 },
    );
  }
}
