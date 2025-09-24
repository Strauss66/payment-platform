import { api } from './apiClient';

export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function presignImageUpload(mimeType, sizeBytes){
  const { data } = await api.post('/api/uploads/presign', { mimeType, size: sizeBytes });
  return data; // { key, uploadUrl }
}

export async function putFile(uploadUrl, file, mimeType){
  const res = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': mimeType } });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return true;
}


