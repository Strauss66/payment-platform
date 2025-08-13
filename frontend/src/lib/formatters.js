export const fmtMoney = (n) => `$${Number(n || 0).toFixed(2)}`;
export const cls = (...xs) => xs.filter(Boolean).join(" ");