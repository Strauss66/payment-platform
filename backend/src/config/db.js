// backend/src/config/db.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Resolve and load the correct .env file deterministically
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvFile() {
  // Respect dotenv-cli if it's being used
  const explicitPath = process.env.DOTENV_CONFIG_PATH;
  if (explicitPath && fs.existsSync(explicitPath)) {
    dotenv.config({ path: explicitPath });
    return explicitPath;
  }

  // Fall back to NODE_ENV-based selection
  const isTest = process.env.NODE_ENV === 'test';
  const preferred = isTest ? '.env.test' : '.env.dev';

  const candidatePaths = [
    // repo root
    join(__dirname, '../../../', preferred),
    // backend root
    join(__dirname, '../../', preferred)
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p });
      return p;
    }
  }

  // As a last resort, try default resolution
  dotenv.config();
  return undefined;
}

const loadedEnvPath = loadEnvFile();
if (loadedEnvPath) {
  console.log(`🔧 Loaded environment from ${loadedEnvPath}`);
}

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'my_db',
  dialect: 'mysql'
};

if (!dbConfig.username || !dbConfig.database) {
  console.error('❌ Database configuration is incomplete:', dbConfig);
  process.exit(1);
}

export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: false,
    define: { underscored: true, freezeTableName: true },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export async function assertDb() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully as', dbConfig.username, 'to', dbConfig.database);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}