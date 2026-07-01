import { NextResponse } from "next/server";

export async function GET() {
  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 60 * 10;

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY!;

  const signature = await crypto.subtle.sign(
    "HMAC",
    await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(privateKey),
      { name: "HMAC", hash: "SHA-1" },
      false,
      ["sign"]
    ),
    new TextEncoder().encode(token + expire)
  );

  const hexSignature = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return NextResponse.json({
    token,
    expire,
    signature: hexSignature,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  });
}
