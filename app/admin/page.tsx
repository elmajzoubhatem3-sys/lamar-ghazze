async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const uploadRes = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const uploadData = await uploadRes.json();

  if (!uploadRes.ok) {
    throw new Error(uploadData.error || "Upload failed");
  }

  return uploadData.url || "";
}