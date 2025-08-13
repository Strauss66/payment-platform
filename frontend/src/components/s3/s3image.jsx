import React from "react";
import { mediaUrl } from "../../lib/s3";
export default function S3Image({ keyOrUrl, alt = "", className = "" }) {
  const src = mediaUrl(keyOrUrl);
  if (!src) return null;
  return <img src={src} alt={alt} className={className} loading="lazy" />;
}