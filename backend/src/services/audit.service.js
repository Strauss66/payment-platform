import { sequelize } from '../config/db.js';

// Option B: compose recent events from invoices, payments, cash sessions
export async function listEvents({ schoolId, limit = 20, from, to, types }) {
  const allowed = ['invoices', 'payments', 'cash_sessions'];
  const typeList = (types && types.length ? types : allowed).filter((t) => allowed.includes(t));
  if (!typeList.length) return [];

  const whereClauses = [];
  const replacements = { schoolId, limit };
  if (from) { whereClauses.push('ts >= :from'); replacements.from = new Date(from); }
  if (to) { whereClauses.push('ts <= :to'); replacements.to = new Date(to); }
  const where = whereClauses.length ? `AND ${whereClauses.join(' AND ')}` : '';

  const unions = [];
  if (typeList.includes('invoices')) {
    unions.push(`
      SELECT id, school_id, student_id AS subject_id, total AS amount, status AS detail,
             created_at AS ts, 'invoice_issued' AS type, CONCAT('Invoice #', id) AS title
      FROM invoices
      WHERE school_id = :schoolId ${where}
    `);
  }
  if (typeList.includes('payments')) {
    unions.push(`
      SELECT id, school_id, cashier_user_id AS subject_id, amount, NULL AS detail,
             paid_at AS ts, 'payment_recorded' AS type, CONCAT('Payment #', id) AS title
      FROM payments
      WHERE school_id = :schoolId ${where}
    `);
  }
  if (typeList.includes('cash_sessions')) {
    unions.push(`
      SELECT id, school_id, opened_by AS subject_id, NULL AS amount, NULL AS detail,
             opened_at AS ts, 'cash_session_opened' AS type, CONCAT('Cash session #', id, ' opened') AS title
      FROM cash_sessions
      WHERE school_id = :schoolId ${where}
    `);
  }

  const sql = `
    SELECT * FROM (
      ${unions.join('\nUNION ALL\n')}
    ) AS audit
    ORDER BY ts DESC
    LIMIT :limit
  `;

  const [rows] = await sequelize.query(sql, { replacements });
  return (rows || []).map((r) => ({
    type: mapType(r.type),
    id: r.id,
    at: r.ts,
    byUserId: r.subject_id ?? undefined,
    message: r.title,
    entityRef: inferEntityRef(r),
    meta: buildMeta(r)
  }));
}

function mapType(dbType) {
  if (dbType === 'payment_recorded') return 'payment';
  if (dbType === 'cash_session_opened' || dbType === 'cash_session_closed') return 'cash_session';
  return 'invoice';
}

function inferEntityRef(row) {
  const t = mapType(row.type);
  if (t === 'invoice') return { kind: 'invoice', id: row.id };
  if (t === 'payment') return { kind: 'payment', id: row.id };
  return { kind: 'cash_session', id: row.id };
}

function buildMeta(row) {
  const out = {};
  if (row.amount != null) out.amount = row.amount;
  if (row.detail != null) out.detail = row.detail;
  return out;
}

export default { listEvents };


