import { useEffect, useState } from 'react';
import { getOverview, getPaymentMethodMix, getAttentionNeeded } from '../lib/api.metrics';

export function useMetricsOverview(opts = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true); setError(null);
    getOverview({ ...(opts.params || {}), signal: controller.signal })
      .then((d) => setData(d))
      .catch((e) => { if (!controller.signal.aborted) setError(e); })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(opts.params || {})]);
  return { data, isLoading, error };
}

export function usePaymentMethodMix(opts = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true); setError(null);
    getPaymentMethodMix({ ...(opts.params || {}), signal: controller.signal })
      .then((d) => setData(Array.isArray(d) ? d : []))
      .catch((e) => { if (!controller.signal.aborted) setError(e); })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(opts.params || {})]);
  return { data, isLoading, error };
}

export function useAttentionNeeded(opts = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true); setError(null);
    getAttentionNeeded({ ...(opts.params || {}), signal: controller.signal })
      .then((d) => setData(Array.isArray(d) ? d : []))
      .catch((e) => { if (!controller.signal.aborted) setError(e); })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(opts.params || {})]);
  return { data, isLoading, error };
}


