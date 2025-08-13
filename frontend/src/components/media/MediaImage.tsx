import React from "react";
import { MEDIA_BASE_URL } from "../../";

type Props = { keyName: string; alt: string; widths?: number[]; className?: string };
export default function MediaImage({ keyName, alt, widths = [480, 768, 1280], className }: Props) {
  const src = `${MEDIA_BASE_URL}/${keyName}`.replace(/\/+/g, "/");
  const srcSet = widths.map((w) => `${src}?w=${w} ${w}w`).join(", ");
  return <img src={src} srcSet={srcSet} sizes="(max-width: 768px) 100vw, 50vw" alt={alt} loading="lazy" className={className} />;
}