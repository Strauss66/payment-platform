'use strict';

module.exports = {
  up: async (qi, Sequelize) => {
    const [schools] = await qi.sequelize.query('SELECT id, name FROM schools');
    const [existing] = await qi.sequelize.query('SELECT school_id FROM invoicing_entities');
    const have = new Set(existing.map(x => x.school_id));
    const now = new Date();

    const rows = [];
    for (const s of schools) {
      if (have.has(s.id)) continue;
      rows.push({
        school_id: s.id,
        name: `${s.name} Emitter`,
        tax_id: null,
        tax_system_code: null,
        email: null,
        phone: null,
        address_json: null,
        is_default: 1,
        created_at: now,
        updated_at: now
      });
    }
    if (rows.length) await qi.bulkInsert('invoicing_entities', rows);
  },

  down: async (qi) => {
    await qi.bulkDelete('invoicing_entities', null, {});
  }
};
