export async function uploadFile(
  endpoint: string,
  file: File,
  fieldName: string = "file"
) {
  const formData = new FormData();
  formData.append(fieldName, file);

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Error al subir archivo");
  }

  return response.json();
}
