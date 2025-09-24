export const IS_DEBUG = String(process.env.REACT_APP_DEBUG || '').toLowerCase() === 'true';
export function safeUrl(u){
  try{ const { origin, pathname } = new URL(u); return `${origin}${pathname}`; }
  catch { return (u||'').split('?')[0]; }
}
export function dlog(tag, payload){
  if (!IS_DEBUG) return;
  const scrub = (o) => Array.isArray(o?.imageSignedUrls)
    ? { ...o, imageSignedUrls: o.imageSignedUrls.map(safeUrl) }
    : o;
  // eslint-disable-next-line no-console
  console.debug(tag, scrub(payload));
}


