import { MEDIA_BASE_URL } from "./env";
export const mediaUrl = (keyOrUrl) => {
  if (!keyOrUrl) return "";
  if (/^https?:\/\//.test(keyOrUrl)) return keyOrUrl;
  return `${MEDIA_BASE_URL.replace(/\/$/, "")}/${String(keyOrUrl).replace(/^\//, "")}`;
};