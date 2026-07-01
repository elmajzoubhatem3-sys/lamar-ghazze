import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("fileName", file.name);
    uploadForm.append("folder", "/lamar-ghazze");

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY?.trim();

if (!privateKey || !privateKey.startsWith("private_")) {
  console.error("Invalid IMAGEKIT_PRIVATE_KEY");
  return NextResponse.json(
    { error: "Invalid ImageKit private key" },
    { status: 500 }
  );
}

    const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`,
      },
      body: uploadForm,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ImageKit upload error:", errorText);
      return NextResponse.json({ error: "ImageKit upload failed" }, { status: 500 });
    }

    const uploaded = await response.json();

    return NextResponse.json({ url: uploaded.url });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
