import { validateAnnouncement, computeStatus } from '../../../src/validators/announcementValidator.js';

describe('validateAnnouncement', () => {
  test('valid school audience', () => {
    const ok = validateAnnouncement({
      title: 'T', body: 'B', category: 'payments', audience_type: 'school', startsAt: new Date().toISOString(), endsAt: null
    });
    expect(ok.title).toBe('T');
  });

  test('section requires sections', () => {
    expect(() => validateAnnouncement({ title:'T', body:'B', category:'events', audience_type:'section', startsAt: new Date().toISOString() })).toThrow('sections');
  });

  test('class requires classIds', () => {
    expect(() => validateAnnouncement({ title:'T', body:'B', category:'activities', audience_type:'class', startsAt: new Date().toISOString() })).toThrow('classIds');
  });

  test('student requires studentIds', () => {
    expect(() => validateAnnouncement({ title:'T', body:'B', category:'other', audience_type:'student', startsAt: new Date().toISOString() })).toThrow('studentIds');
  });

  test('endsAt after startsAt', () => {
    const s = new Date();
    const e = new Date(s.getTime() - 1000);
    expect(() => validateAnnouncement({ title:'T', body:'B', category:'other', audience_type:'school', startsAt: s.toISOString(), endsAt: e.toISOString() })).toThrow('after');
  });

  test('rejects more than 3 imageKeys', () => {
    const s = new Date().toISOString();
    expect(() => validateAnnouncement({
      title:'T', body:'B', category:'other', audience_type:'school', startsAt: s, endsAt: null,
      imageKeys: ['a','b','c','d']
    })).toThrow();
  });

  test('rejects missing audience selection when not entireSchool', () => {
    const s = new Date().toISOString();
    expect(() => validateAnnouncement({
      title:'T', body:'B', category:'other', audience_type:'class', entireSchool:false, startsAt: s
    })).toThrow('Select at least one audience dimension');
  });

  test('computeStatus windows: upcoming, active, expired, null end', () => {
    const now = new Date('2025-01-01T12:00:00Z');
    const before = new Date('2025-01-01T10:00:00Z');
    const after = new Date('2025-01-01T14:00:00Z');
    expect(computeStatus(now, after.toISOString(), null)).toBe('upcoming');
    expect(computeStatus(now, before.toISOString(), after.toISOString())).toBe('active');
    expect(computeStatus(now, before.toISOString(), before.toISOString())).toBe('expired');
    expect(computeStatus(now, before.toISOString(), null)).toBe('active');
  });
});
