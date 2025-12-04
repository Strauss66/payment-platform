import express from 'express';
import { sequelize } from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const time = new Date().toISOString();
  const version = process.env.APP_VERSION || 'dev';
  try {
    await sequelize.authenticate();
    return res.json({
      status: 'ok',
      time,
      version,
      db: 'ok'
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      time,
      version,
      db: 'error',
      error: 'Database check failed'
    });
  }
});

export default router;