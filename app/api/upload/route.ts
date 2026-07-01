if (!response.ok) {
  const errorText = await response.text();
  console.error("ImageKit upload error:", errorText);
  return NextResponse.json({ error: "ImageKit upload failed" }, { status: 500 });
}

