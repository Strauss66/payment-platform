module.exports = {
  up: async (queryInterface, Sequelize) => {
    const qi = queryInterface;
    const sequelize = qi.sequelize;

    async function addIndex(table, fields, options) {
      try { await qi.addIndex(table, { ...options, fields }); } catch (e) {}
    }

    await addIndex('schools', ['slug'], { name: 'slug_unique', unique: true });
    await addIndex('schools', ['subdomain'], { name: 'subdomain_unique', unique: true });
    await addIndex('schools', ['s3_bucket'], { name: 's3_bucket_unique', unique: true });

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

    try {
      await qi.changeColumn('schools', 'slug', { type: Sequelize.STRING(80), allowNull: false });
    } catch (e) {}
  },

  down: async (queryInterface, Sequelize) => {
    const qi = queryInterface;
    try { await qi.changeColumn('schools', 'slug', { type: Sequelize.STRING(80), allowNull: true }); } catch (e) {}
    async function dropIndex(table, name) { try { await qi.removeIndex(table, name); } catch (e) {} }
    await dropIndex('schools', 'slug_unique');
    await dropIndex('schools', 'subdomain_unique');
    await dropIndex('schools', 's3_bucket_unique');
  }
};


