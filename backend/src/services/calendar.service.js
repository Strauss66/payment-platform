// backend/src/services/calendar.service.js
import { Calendar, Event } from '../models/index.js';
import { sequelize } from '../config/db.js';

export async function getOrCreateDefaultCalendar(schoolId, { createdBy } = {}){
  const name = 'School Calendar';
  const existing = await Calendar.findOne({ where: { school_id: schoolId, name, visibility: 'school' } });
  if (existing) return existing;
  return await Calendar.create({ school_id: schoolId, name, visibility: 'school', color: '#2563EB', created_by: createdBy, updated_by: createdBy });
}

function coerceBool(val){ return !!(val === true || val === 1 || val === '1' || val === 'true'); }

export async function upsertEventFromAnnouncement(announcement){
  const a = announcement?.get ? announcement.get({ plain: true }) : announcement;
  const schoolId = a.school_id ?? a.schoolId;
  if (!schoolId) throw new Error('schoolId required');

  const shouldHaveEvent = (a.category === 'events') || coerceBool(a.addToCalendar);
  const existing = await Event.findOne({ where: { school_id: schoolId, source_type: 'announcement', announcement_id: a.id } });

  if (!shouldHaveEvent) {
    if (existing) await existing.destroy();
    return null;
  }

  const calendar = await getOrCreateDefaultCalendar(schoolId, { createdBy: a.updated_by || a.created_by });

  const payload = {
    school_id: schoolId,
    calendar_id: calendar.id,
    title: a.title,
    description: a.body || null,
    starts_at: a.starts_at ?? a.startsAt,
    ends_at: a.ends_at ?? a.endsAt,
    all_day: 0,
    source_type: 'announcement',
    announcement_id: a.id
  };

  if (existing) {
    await existing.update(payload);
    return existing;
  }
  return await Event.create(payload);
}

export async function deleteEventByAnnouncementId(announcementId, schoolId){
  await Event.destroy({ where: { school_id: schoolId, source_type: 'announcement', announcement_id: announcementId } });
}

export default { getOrCreateDefaultCalendar, upsertEventFromAnnouncement, deleteEventByAnnouncementId };


