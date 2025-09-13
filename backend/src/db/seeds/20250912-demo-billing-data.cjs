'use strict';

module.exports = {
  async up (queryInterface) {
    // Find an existing school (Monte Albán tenant)
    const [schools] = await queryInterface.sequelize.query("SELECT id FROM schools WHERE name LIKE '%Monte%' LIMIT 1");
    if (!schools || !schools.length) { console.log('No Monte school found; skipping demo seed'); return; }
    const schoolId = schools[0].id;

    // Reuse existing students if present; otherwise create a few demo students
    const [students] = await queryInterface.sequelize.query(`SELECT id FROM students WHERE school_id = ${schoolId} LIMIT 10`);
    let studentIds = students.map(s => s.id);
    if (studentIds.length < 5) {
      for (let i = 0; i < 10; i++) {
        const [res] = await queryInterface.sequelize.query(`INSERT INTO students(school_id, first_name, last_name) VALUES(${schoolId}, 'Demo${i+1}', 'Student')`);
      }
      const [fresh] = await queryInterface.sequelize.query(`SELECT id FROM students WHERE school_id = ${schoolId} ORDER BY id DESC LIMIT 10`);
      studentIds = fresh.map(s => s.id);
    }

    // Payment methods (assume 1=cash, 2=card, 3=transfer)
    const methods = [1,2,3];

    // Create ~40 invoices across the last 120 days
    const now = new Date();
    function dateAddDays(d, delta){ const x = new Date(d); x.setDate(x.getDate()+delta); return x; }
    const statuses = ['open','partial','paid','void'];
    const rand = (min,max) => Math.floor(Math.random()*(max-min+1))+min;

    for (let i = 0; i < 40; i++) {
      const studentId = studentIds[i % studentIds.length];
      const due = dateAddDays(now, -rand(0,120));
      const total = rand(500, 5000);
      const status = statuses[i % statuses.length];
      const [invRes] = await queryInterface.sequelize.query(
        `INSERT INTO invoices(school_id, student_id, charge_concept_id, due_date, subtotal, discount_total, tax_total, total, paid_total, balance, status, created_at, updated_at)
         VALUES(${schoolId}, ${studentId}, NULL, '${due.toISOString().slice(0,10)}', ${total}, 0, 0, ${total}, 0, ${total}, '${status}', NOW(), NOW())`
      );
      const [invIdRow] = await queryInterface.sequelize.query('SELECT LAST_INSERT_ID() AS id');
      const invoiceId = invIdRow[0].id;

      // Random payments for paid/partial
      if (status === 'paid' || status === 'partial') {
        const count = status === 'paid' ? rand(1,2) : 1;
        let paid = 0;
        for (let j = 0; j < count; j++) {
          const amt = status === 'paid' ? Math.round(total / count) : Math.round(total * 0.4);
          paid += amt;
          const method = methods[rand(0, methods.length-1)];
          await queryInterface.sequelize.query(
            `INSERT INTO payments(school_id, invoice_id, payment_method_id, amount, paid_at, ref, cashier_user_id, note, created_at, updated_at)
             VALUES(${schoolId}, ${invoiceId}, ${method}, ${amt}, NOW(), NULL, 1, NULL, NOW(), NOW())`
          );
        }
        const newStatus = paid >= total ? 'paid' : 'partial';
        const bal = Math.max(0, total - paid);
        await queryInterface.sequelize.query(`UPDATE invoices SET paid_total=${paid}, balance=${bal}, status='${newStatus}' WHERE id=${invoiceId}`);
      }
      if (status === 'void') {
        await queryInterface.sequelize.query(`UPDATE invoices SET balance=0 WHERE id=${invoiceId}`);
      }
    }
  },

  async down () {}
};


