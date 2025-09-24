// backend/src/mappers/announcementMapper.js
// Centralized mappers for Announcement payloads (API DTO ↔ DB model)
// Note: Clients should render dates with Intl and their chosen timezone.
// This mapper normalizes outbound dates to ISO 8601 (UTC) strings.

function isNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

function ensureArrayOrNull(value) {
  if (!value) return null;
  return Array.isArray(value) ? (value.length ? value : null) : null;
}

function anyLooksLikeUrl(arr){
  return Array.isArray(arr) && arr.some(x => typeof x === 'string' && /^https?:\/\//i.test(x));
}

// Accept either roleKeys or audienceRoles (alias). Prefer roleKeys if both provided.
function normalizeRoleKeys(dto){
  const roleKeys = Array.isArray(dto?.roleKeys) ? dto.roleKeys
    : (Array.isArray(dto?.audienceRoles) ? dto.audienceRoles : null);
  return ensureArrayOrNull(roleKeys);
}

// Images precedence: imageKeys > (imageUrls + optional imageAlts)
function normalizeImages(dto){
  const imageKeys = Array.isArray(dto?.imageKeys) ? dto.imageKeys : null;
  if (isNonEmptyArray(imageKeys)) {
    if (anyLooksLikeUrl(imageKeys)) {
      const error = new Error('imageKeys must be S3 object keys');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
    return { image_keys: imageKeys, image_urls: null, image_alts: null };
  }

  const imageUrls = Array.isArray(dto?.imageUrls) ? dto.imageUrls : null;
  const imageAlts = Array.isArray(dto?.imageAlts) ? dto.imageAlts : null;
  if (isNonEmptyArray(imageUrls)) {
    // Keep alts only if provided and same length; otherwise drop
    const alts = Array.isArray(imageAlts) && imageAlts.length === imageUrls.length ? imageAlts : null;
    return { image_keys: null, image_urls: imageUrls, image_alts: alts };
  }

  return { image_keys: null, image_urls: null, image_alts: null };
}

export function inboundDtoToModel(dto){
  const payload = dto || {};

  const audienceType = payload.entireSchool ? 'school' : payload.audience_type;

  const sections = ensureArrayOrNull(payload.sections);
  const classIds = ensureArrayOrNull(payload.classIds);
  const studentIds = ensureArrayOrNull(payload.studentIds);
  const roleKeys = normalizeRoleKeys(payload);
  const images = normalizeImages(payload);

  const startsAt = normalizeToUtcDate(payload.startsAt);
  const endsAt = normalizeToUtcDate(payload.endsAt);

  return {
    title: payload.title,
    body: payload.body,
    category: payload.category,
    audience_type: audienceType,
    sections,
    class_ids: classIds,
    student_ids: studentIds,
    role_keys: roleKeys,
    image_keys: images.image_keys,
    image_urls: images.image_urls,
    image_alts: images.image_alts,
    starts_at: startsAt,
    ends_at: endsAt
  };
}

export function modelToOutboundDto(model){
  const json = model?.get ? model.get({ plain: true }) : (model?.toJSON ? model.toJSON() : (model || {}));
  // Prefer camelCase props if already present, else map from snake_case
  const id = json.id;
  const schoolId = json.schoolId ?? json.school_id ?? null;
  const title = json.title;
  const body = json.body;
  const category = json.category;
  const audience_type = json.audience_type;
  const sections = json.sections ?? null;
  const classIds = json.classIds ?? json.class_ids ?? null;
  const studentIds = json.studentIds ?? json.student_ids ?? null;
  const roleKeys = json.roleKeys ?? json.role_keys ?? null;
  const imageKeysRaw = json.imageKeys ?? json.image_keys ?? [];
  const imageKeys = Array.isArray(imageKeysRaw) ? imageKeysRaw : [];
  const imageUrls = json.imageUrls ?? json.image_urls ?? null;
  const imageAlts = json.imageAlts ?? json.image_alts ?? null;
  const startsAtRaw = json.startsAt ?? json.starts_at ?? null;
  const endsAtRaw = json.endsAt ?? json.ends_at ?? null;
  const startsAt = startsAtRaw instanceof Date ? startsAtRaw.toISOString() : (typeof startsAtRaw === 'string' ? startsAtRaw : null);
  const endsAt = endsAtRaw instanceof Date ? endsAtRaw.toISOString() : (typeof endsAtRaw === 'string' ? endsAtRaw : (endsAtRaw == null ? null : null));
  const createdAt = json.createdAt ?? json.created_at ?? null;
  const updatedAt = json.updatedAt ?? json.updated_at ?? null;

  return {
    id,
    schoolId,
    title,
    body,
    category,
    audience_type,
    sections,
    classIds,
    studentIds,
    roleKeys,
    imageKeys,
    imageUrls,
    imageAlts,
    startsAt,
    endsAt,
    createdAt,
    updatedAt
  };
}

export default { inboundDtoToModel, modelToOutboundDto };

// --- helpers ---
function normalizeToUtcDate(value){
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    // If string lacks timezone, treat as UTC by appending 'Z' to avoid server-local interpretation
    const hasTz = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
    const normalized = hasTz ? value : `${value}Z`;
    const d = new Date(normalized);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}


