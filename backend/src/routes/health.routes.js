import { Router } from 'express';
import { sequelize } from '../config/db.js';
const r = Router();
r.get('/', async (_req, res) => {
  const time = new Date().toISOString();
  let db = 'unknown';
  try {
    await sequelize.query('SELECT 1+1 AS result');
    db = 'ok';
  } catch {
    db = 'down';
  }
  const version = process.env.APP_VERSION || '1.0.0';
  return res.json({ status: 'ok', time, version, db });
});
export default r;