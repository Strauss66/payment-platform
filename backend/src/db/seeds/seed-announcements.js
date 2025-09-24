import { sequelize, assertDb } from '../../config/db.js';

export default async function seedAnnouncements(){
  await assertDb();
  const t = await sequelize.transaction();
  try {
    const [[school]] = await sequelize.query("SELECT id FROM schools WHERE slug='weglon-test-school'", { transaction: t });
    if (!school) throw new Error('School not found');

    const now = new Date();
    const starts = new Date(now.getTime() + 60*60*1000); // +1h

    async function upsert(row){
      await sequelize.query(
        'INSERT INTO announcements (school_id,title,body,category,audience_type,sections,class_ids,student_ids,starts_at,ends_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,NOW(),NOW())\n ON DUPLICATE KEY UPDATE body=VALUES(body), category=VALUES(category), audience_type=VALUES(audience_type), sections=VALUES(sections), class_ids=VALUES(class_ids), student_ids=VALUES(student_ids), starts_at=VALUES(starts_at), ends_at=VALUES(ends_at), updated_at=NOW()',
        { replacements: [row.school_id,row.title,row.body,row.category,row.audience_type, JSON.stringify(row.sections||null), JSON.stringify(row.class_ids||null), JSON.stringify(row.student_ids||null), row.starts_at, row.ends_at], transaction: t }
      );
    }

    await upsert({ school_id: school.id, title: 'Tuition due reminder', body: 'Please pay by the 10th.', category: 'payments', audience_type: 'school', starts_at: starts, ends_at: null });
    await upsert({ school_id: school.id, title: 'High School Science Fair', body: 'Join us next week!', category: 'events', audience_type: 'section', sections: ['high'], starts_at: starts, ends_at: null });
    await upsert({ school_id: school.id, title: 'Classroom materials', body: 'Bring notebooks', category: 'activities', audience_type: 'class', class_ids: [1,2], starts_at: starts, ends_at: null });

    await t.commit();
    console.log('✅ Seeded sample announcements');
  } catch (e) {
    await t.rollback();
    console.error('❌ seed announcements failed:', e.message);
    throw e;
  }
}

export async function up(){ return seedAnnouncements(); }
export async function down(){ /* no-op */ }
