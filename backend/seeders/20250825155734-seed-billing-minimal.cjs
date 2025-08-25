'use strict';

module.exports = {
  up: async (qi, Sequelize) => {
    const [schools] = await qi.sequelize.query('SELECT id FROM schools');
    const schoolIds = schools.map(s => s.id);
    const now = new Date();

    // payment_methods
    const pmRows = [];
    const names = [
      { name: 'CASH', requires_ref: false },
      { name: 'CARD', requires_ref: true },
      { name: 'TRANSFER', requires_ref: true },
      { name: 'PORTAL', requires_ref: true }
    ];
    for (const sid of schoolIds) {
      for (const n of names) {
        pmRows.push({ school_id: sid, name: n.name, requires_ref: n.requires_ref, created_at: now, updated_at: now });
      }
    }
    if (pmRows.length) await qi.bulkInsert('payment_methods', pmRows, { ignoreDuplicates: true });

    // charge_concepts
    const ccRows = [];
    const concepts = [
      { code: 'TUITION', name: 'Tuition', type: 'tuition', taxable: false },
      { code: 'UNIFORM', name: 'Uniform', type: 'product', taxable: false },
      { code: 'TRANSPORT', name: 'Transport', type: 'fee', taxable: false }
    ];
    for (const sid of schoolIds) {
      for (const c of concepts) {
        ccRows.push({ school_id: sid, code: c.code, name: c.name, type: c.type, taxable: c.taxable, created_at: now, updated_at: now });
      }
    }
    if (ccRows.length) await qi.bulkInsert('charge_concepts', ccRows, { ignoreDuplicates: true });

    // billing_prefs
    const [existing] = await qi.sequelize.query('SELECT school_id FROM billing_prefs');
    const have = new Set(existing.map(x => x.school_id));
    const prefRows = [];
    for (const sid of schoolIds) {
      if (!have.has(sid)) {
        prefRows.push({
          school_id: sid,
          late_initial_pct: 0.10,
          late_compound_mo_pct: 0.015,
          debtor_access: 'view_only',
          dunning_json: JSON.stringify({ day1: 'soft', day7: 'soft', day15: 'final', day21: 'hold' }),
          created_at: now, updated_at: now
        });
      }
    }
    if (prefRows.length) await qi.bulkInsert('billing_prefs', prefRows);
  },

  down: async (qi) => {
    await qi.bulkDelete('payment_methods', null, {});
    await qi.bulkDelete('charge_concepts', null, {});
    await qi.bulkDelete('billing_prefs', null, {});
  }
};
