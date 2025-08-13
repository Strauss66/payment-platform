import { useEffect, useState } from "react";
import { api } from "../lib/apiClient";

export function useApi(path, { enabled = true } = {}) {
  const [data, setData] = useState(null), [loading, setLoading] = useState(!!enabled), [error, setError] = useState(null);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    setLoading(true);
    api.get(path)
      .then(({ data }) => { if (alive) setData(data); })
      .catch((e) => { if (alive) setError(e); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [path, enabled]);
  return { data, loading, error };
}