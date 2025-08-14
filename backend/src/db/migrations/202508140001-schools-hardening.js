// Schools hardening: unique indexes, backfill slug, enforce NOT NULL
import { sequelize } from '../../config/db.js';

export async function up({ context }) {
  const qi = sequelize.getQueryInterface();

  // Add indexes if not exist (best-effort try/catch)
  async function addIndex(table, fields, options) {
    try { await qi.addIndex(table, { ...options, fields }); } catch (e) { /* ignore */ }
  }

  await addIndex('schools', ['slug'], { name: 'slug_unique', unique: true });
  await addIndex('schools', ['subdomain'], { name: 'subdomain_unique', unique: true });
  await addIndex('schools', ['s3_bucket'], { name: 's3_bucket_unique', unique: true });

  // Backfill slug for rows where slug is NULL or empty
  const [rows] = await sequelize.query("SELECT id, name, slug FROM schools");
  const existing = new Set(rows.map(r => (r.slug || '').trim()).filter(Boolean));

  function slugifyName(name) {
    return String(name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  for (const row of rows) {
    const current = (row.slug || '').trim();
    if (current) continue;
    let base = slugifyName(row.name) || `school-${row.id}`;
    let candidate = base;
    let n = 1;
    while (existing.has(candidate)) {
      n += 1;
      candidate = `${base}-${row.id}-${n}`;
    }
    await sequelize.query('UPDATE schools SET slug = :slug WHERE id = :id', { replacements: { slug: candidate, id: row.id } });
    existing.add(candidate);
  }

  // Enforce NOT NULL for slug
  try {
    await qi.changeColumn('schools', 'slug', { type: sequelize.Sequelize.STRING(80), allowNull: false });
  } catch (e) { /* ignore */ }
}

export async function down({ context }) {
  const qi = sequelize.getQueryInterface();
  // Relax NOT NULL back to NULLABLE
  try { await qi.changeColumn('schools', 'slug', { type: sequelize.Sequelize.STRING(80), allowNull: true }); } catch (e) { /* ignore */ }
  // Best-effort drop indexes
  async function dropIndex(table, name) { try { await qi.removeIndex(table, name); } catch (e) { /* ignore */ } }
  await dropIndex('schools', 'slug_unique');
  await dropIndex('schools', 'subdomain_unique');
  await dropIndex('schools', 's3_bucket_unique');
}


