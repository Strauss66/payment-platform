import React from "react";
import { mediaUrl } from "../../lib/s3";
export default function S3Video({ keyOrUrl, className = "", autoPlay=false, loop=false, muted=false, controls=true }) {
  const src = mediaUrl(keyOrUrl);
  if (!src) return null;
  return <video className={className} src={src} autoPlay={autoPlay} loop={loop} muted={muted} controls={controls} />;
}