import { NextResponse } from "next/server";

/**
 * Parses JSON bodies for public AI routes with an upper bound on decoded UTF-8 size.
 */

export async function parsePublicAiJsonBody(
  request: Request,
  maxUtf8Bytes: number,
): Promise<{ ok: true; data: unknown } | { ok: false; response: NextResponse }> {
  const cl = request.headers.get("content-length");
  if (cl !== null && cl.trim() !== "") {
    const n = Number.parseInt(cl, 10);
    if (Number.isFinite(n) && n >= 0 && n > maxUtf8Bytes) {
      return {
        ok: false,
        response: NextResponse.json(
          {
            error: "Request body is too large.",
            code: "REQUEST_BODY_TOO_LARGE",
            maxUtf8Bytes,
          },
          { status: 413 },
        ),
      };
    }
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Could not read request body.", code: "BODY_READ_ERROR" },
        { status: 400 },
      ),
    };
  }

  if (Buffer.byteLength(raw, "utf8") > maxUtf8Bytes) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Request body exceeds the allowed UTF-8 size.",
          code: "REQUEST_BODY_TOO_LARGE",
          maxUtf8Bytes,
        },
        { status: 413 },
      ),
    };
  }

  try {
    return { ok: true, data: JSON.parse(raw) };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid JSON body.", code: "INVALID_JSON" },
        { status: 400 },
      ),
    };
  }
}
