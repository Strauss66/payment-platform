import React, { useRef, useState } from "react";
import { api } from "../../lib/apiClient";

export default function FileUploader({ onUploaded }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const onChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const { data } = await api.post("/api/media/upload", { filename: file.name, type: file.type });
      const form = new FormData();
      Object.entries(data.fields).forEach(([k, v]) => form.append(k, v));
      form.append("file", file);
      const res = await fetch(data.url, { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      onUploaded?.(data.fields.key);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return <input ref={inputRef} type="file" onChange={onChange} disabled={busy} />;
}