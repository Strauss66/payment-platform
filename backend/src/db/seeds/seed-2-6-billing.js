import { sequelize } from '../../config/db.js';

export default async function seedBilling() {
  const t = await sequelize.transaction();
  try {
    const [[ma]] = await sequelize.query('SELECT id FROM schools WHERE subdomain = "monte"', { transaction: t });
    const [[hs]] = await sequelize.query('SELECT id FROM levels WHERE school_id=? AND code="HS"', { replacements: [ma.id], transaction: t });
    const [[sy]] = await sequelize.query('SELECT id, start_date, end_date FROM school_years WHERE school_id=? AND is_default=1', { replacements: [ma.id], transaction: t });
    if (!ma || !hs || !sy) throw new Error('Missing Monte/HS/default year');

    // charge concepts
    const concepts = [
      ['TUITION', 'Tuition', 'tuition', 0],
      ['UNIFORM', 'Uniform', 'product', 0],
      ['TRANSPORT', 'Transport', 'fee', 0]
    ];
    for (const [code, name, type, taxable] of concepts) {
      await sequelize.query(
        'INSERT INTO charge_concepts (school_id, code, name, type, taxable, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())\n         ON DUPLICATE KEY UPDATE name=VALUES(name), type=VALUES(type), taxable=VALUES(taxable), updated_at=NOW()',
        { replacements: [ma.id, code, name, type, taxable], transaction: t }
      );
    }

    // payment methods
    const pms = [
      ['CASH', 0], ['CARD', 1], ['TRANSFER', 1], ['PORTAL', 1]
    ];
    for (const [name, requiresRef] of pms) {
      await sequelize.query(
        'INSERT INTO payment_methods (school_id, name, requires_ref, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())\n         ON DUPLICATE KEY UPDATE requires_ref=VALUES(requires_ref), updated_at=NOW()',
        { replacements: [ma.id, name, requiresRef], transaction: t }
      );
    }

    // tuition plan
    await sequelize.query(
      'INSERT INTO tuition_plans (school_id, level_id, name, currency, amount, schedule, penalties_json, is_active, created_at, updated_at)\n       VALUES (?, ?, "Standard HS", "MXN", 4000.00, "monthly", JSON_OBJECT("initialPct",0.10,"monthlyCompPct",0.015), 1, NOW(), NOW())\n       ON DUPLICATE KEY UPDATE amount=VALUES(amount), is_active=VALUES(is_active), updated_at=NOW()',
      { replacements: [ma.id, hs.id], transaction: t }
    );

    // generate monthly invoices for default year
    const start = new Date(sy.start_date);
    const end = new Date(sy.end_date);
    const months = [];
    const d = new Date(start.getFullYear(), start.getMonth(), 1);
    while (d <= end) {
      months.push({ month: d.getMonth() + 1, year: d.getFullYear() });
      d.setMonth(d.getMonth() + 1);
    }
    const [[tuition]] = await sequelize.query('SELECT id FROM charge_concepts WHERE school_id=? AND code="TUITION"', { replacements: [ma.id], transaction: t });
    const [students] = await sequelize.query('SELECT id FROM students WHERE school_id=?', { replacements: [ma.id], transaction: t });

    for (const s of students) {
      for (const m of months) {
        await sequelize.query(
          'INSERT INTO invoices (school_id, student_id, charge_concept_id, period_month, period_year, due_date, subtotal, discount_total, tax_total, late_fee_accrued, total, paid_total, status, created_at, updated_at)\n           VALUES (?, ?, ?, ?, ?, DATE_FORMAT(CONCAT(?,"-",?,"-05"), "%Y-%m-%d"), 4000.00, 0.00, 0.00, 0.00, 4000.00, 0.00, "open", NOW(), NOW())\n           ON DUPLICATE KEY UPDATE updated_at=NOW()',
          { replacements: [ma.id, s.id, tuition.id, m.month, m.year, m.year, String(m.month).padStart(2,'0')], transaction: t }
        );
      }
    }

    await t.commit();
    console.log('✅ Seeded billing (concepts, methods, plan, invoices)');
  } catch (err) {
    await t.rollback();
    console.error('❌ seed billing failed:', err.message);
    throw err;
  }
}


