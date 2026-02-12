import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { getDb } from "@/lib/db";
import { snippets } from "@/lib/db/schema";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  10,
);

const MAX_CODE_SIZE = 100 * 1024;

export async function POST(request: Request) {
  const body = await request.json();
  const code = body?.code;

  if (typeof code !== "string" || code.trim().length === 0) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  if (code.length > MAX_CODE_SIZE) {
    return NextResponse.json(
      { error: "Code exceeds 100KB limit" },
      { status: 413 },
    );
  }

  const id = nanoid();

  await getDb().insert(snippets).values({ id, code });

  return NextResponse.json({ id }, { status: 201 });
}
