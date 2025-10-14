import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const Ctx = createContext(null);

export function TenantFilterProvider({ children }){
  const [params, setParams] = useSearchParams();
  const [schoolIds, setSchoolIds] = useState(() => parseIds(params.get('schools')));
  const [from, setFrom] = useState(() => params.get('from') || defaultFrom());
  const [to, setTo] = useState(() => params.get('to') || new Date().toISOString());

  useEffect(() => {
    const next = new URLSearchParams(params.toString());
    writeIds(next, 'schools', schoolIds);
    next.set('from', from);
    next.set('to', to);
    setParams(next, { replace: true });
  }, [schoolIds, from, to]);

  const value = useMemo(() => ({
    schoolIds,
    setSchoolIds,
    from,
    to,
    setFrom,
    setTo
  }), [schoolIds, from, to]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTenantFilter(){
  return useContext(Ctx);
}

function parseIds(v){
  if (!v) return null; // null signifies All
  const parts = String(v).split(',').map(s => Number(s)).filter(n => Number.isFinite(n));
  return parts.length ? parts : null;
}

function writeIds(sp, key, ids){
  if (!ids || !ids.length) sp.delete(key); else sp.set(key, ids.join(','));
}

function defaultFrom(){
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString();
}


