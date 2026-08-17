import crypto from "crypto";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  allowedExtension,
  blobConfigured,
  MAX_UPLOAD_BYTES,
  UPLOAD_DIR,
} from "@/lib/uploads";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!allowedExtension(ext)) {
    return NextResponse.json(
      { error: "Unsupported file type. Use JPG, PNG, WebP, AVIF or SVG." },
      { status: 400 }
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File too large (max 5 MB)." }, { status: 400 });
  }

  const name = `${crypto.randomBytes(8).toString("hex")}${ext}`;
  const body = Buffer.from(await file.arrayBuffer());

  if (blobConfigured()) {
    // `addRandomSuffix: false` keeps the server-generated name we already
    // validated, so the stored URL stays predictable.
    const { put } = await import("@vercel/blob");
    const blob = await put(`products/${name}`, body, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type || undefined,
    });
    return NextResponse.json({ url: blob.url });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), body);

  return NextResponse.json({ url: `/api/uploads/${name}` });
}
