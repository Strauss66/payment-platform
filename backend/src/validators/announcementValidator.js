import { z } from 'zod';

export const announcementSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  category: z.enum(['payments','events','activities','other']),
  audience_type: z.enum(['school','section','class','student']),
  entireSchool: z.boolean().optional(),
  sections: z.array(z.enum(['preschool','elementary','middle','high'])).optional(),
  classIds: z.array(z.number().int().positive()).optional(),
  studentIds: z.array(z.number().int().positive()).optional(),
  roleKeys: z.array(z.enum(['teachers','parents'])).optional(),
  imageKeys: z.array(z.string().min(1)).max(3).optional(),
  imageUrls: z.array(z.string().url().refine(u => u.startsWith('https://'), 'must be https')).max(3).optional(),
  imageAlts: z.array(z.string().max(200)).optional(),
  startsAt: z.string(),
  endsAt: z.string().nullable().optional()
}).superRefine((val, ctx) => {
  // StartsAt must be a valid date
  const s = new Date(val.startsAt);
  if (!(s instanceof Date) || Number.isNaN(s.getTime())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['startsAt'], message: 'startsAt must be a valid date' });
  }

  // endsAt validity and strictly greater than startsAt
  if (val.endsAt != null) {
    const e = new Date(val.endsAt);
    if (!(e instanceof Date) || Number.isNaN(e.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['endsAt'], message: 'endsAt must be a valid date or null' });
    } else if (!Number.isNaN(s.getTime()) && e <= s) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['endsAt'], message: 'endsAt must be after startsAt' });
    }
  }

  // Audience-specific requirements
  if (val.audience_type === 'section' && (!Array.isArray(val.sections) || val.sections.length === 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['sections'], message: 'sections must be a non-empty array' });
  }
  if (val.audience_type === 'class' && (!Array.isArray(val.classIds) || val.classIds.length === 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['classIds'], message: 'classIds must be a non-empty array' });
  }
  if (val.audience_type === 'student' && (!Array.isArray(val.studentIds) || val.studentIds.length === 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['studentIds'], message: 'studentIds must be a non-empty array' });
  }

  // At least one audience dimension selected
  if (!hasAnyAudienceSelection(val)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['audience_type'], message: 'Select at least one audience dimension' });
  }

  // Image alts length match with imageUrls
  if (Array.isArray(val.imageAlts) && Array.isArray(val.imageUrls) && val.imageAlts.length !== val.imageUrls.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['imageAlts'], message: 'imageAlts must match imageUrls length' });
  }
});

export function hasAnyAudienceSelection(val){
  const entireSchool = !!val.entireSchool;
  const sections = Array.isArray(val.sections) ? val.sections : [];
  const classIds = Array.isArray(val.classIds) ? val.classIds : [];
  const studentIds = Array.isArray(val.studentIds) ? val.studentIds : [];
  const roleKeys = Array.isArray(val.roleKeys) ? val.roleKeys : [];
  return !!entireSchool || sections.length > 0 || classIds.length > 0 || studentIds.length > 0 || roleKeys.length > 0;
}

export function validateAnnouncement(payload){
  // All cross-field rules handled in superRefine to provide path hints
  return announcementSchema.parse(payload);
}

export function computeStatus(now, startsAt, endsAt){
  const s = new Date(startsAt);
  const e = endsAt ? new Date(endsAt) : null;
  if (now < s) return 'upcoming';
  if (!e || (now >= s && now <= e)) return 'active';
  return 'expired';
}

export function audienceSummary(row){
  const audienceType = row.audience_type;
  const sections = row.sections || [];
  const classIds = row.classIds ?? row.class_ids ?? [];
  const studentIds = row.studentIds ?? row.student_ids ?? [];
  const roleKeys = row.roleKeys ?? row.role_keys ?? [];

  switch(audienceType){
    case 'school': return 'Entire school';
    case 'section': return `Sections: ${sections.map(capitalize).join(', ')}`;
    case 'class': return `Classes: ${Array.isArray(classIds)?classIds.length:0} selected`;
    case 'student': return `Students: ${Array.isArray(studentIds)?studentIds.length:0} selected`;
    default: break;
  }
  if (Array.isArray(roleKeys) && roleKeys.length) {
    const labels = roleKeys.map(k => k.charAt(0).toUpperCase()+k.slice(1));
    return `Roles: ${labels.join(', ')}`;
  }
  return '';
}

function capitalize(s){ return String(s||'').charAt(0).toUpperCase()+String(s||'').slice(1); }
