// backend/sequelize.config.cjs
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function loadEnv() {
  const explicit = process.env.DOTENV_CONFIG_PATH;
  if (explicit && fs.existsSync(explicit)) {
    dotenv.config({ path: explicit });
    return;
  }
  const isTest = process.env.NODE_ENV === 'test';
  const envFile = isTest ? '.env.test' : '.env.dev';
  const candidates = [
    path.resolve(process.cwd(), envFile),
    path.resolve(__dirname, envFile),
    path.resolve(__dirname, '..', envFile)
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) { dotenv.config({ path: p }); return; }
  }
  dotenv.config();
}

loadEnv();

const common = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  dialect: 'mysql',
  logging: false
};

module.exports = {
  development: { ...common },
  test: { ...common },
  production: { ...common }
};


