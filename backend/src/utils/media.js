// backend/src/utils/media.js
import { signCdnUrlForKey } from '../services/cf.js';

export function mapSignedMedia(dto){
  const imageKeys = Array.isArray(dto?.imageKeys) ? dto.imageKeys : [];
  if (!imageKeys.length) return dto;
  try {
    const imageSignedUrls = imageKeys.map(k => signCdnUrlForKey(k));
    return { ...dto, imageSignedUrls };
  } catch {
    return dto;
  }
}

export default { mapSignedMedia };


