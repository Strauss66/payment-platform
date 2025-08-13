// backend/src/config/db.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Resolve a .env even when called from different CWDs
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const candidateEnvs = [
  join(__dirname, '../../.env'),          // backend/.env (preferred)
  join(__dirname, '../../../.env'),       // repo root/.env
  join(process.cwd(), '.env')             // current working dir
];
for (const p of candidateEnvs) {
  if (fs.existsSync(p)) { dotenv.config({ path: p }); break; }
}

// Load configuration from config.json
let dbConfig = {};
try {
  const configPath = join(__dirname, '../../config/config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const env = process.env.NODE_ENV || 'development';
    if (config[env]) {
      dbConfig = {
        host: config[env].host || '127.0.0.1',
        port: config[env].port || 3306,
        username: config[env].username || 'root',
        password: config[env].password || '',
        database: config[env].database || 'my_db',
        dialect: config[env].dialect || 'mysql'
      };
      console.log('✅ Loaded database configuration from config.json for environment:', env);
    }
  }
} catch (error) {
  console.error('❌ Could not load config.json:', error.message);
  process.exit(1);
}

// Fallback to environment variables if config.json fails
if (!dbConfig.username || !dbConfig.database) {
  dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'my_db',
    dialect: 'mysql'
  };
  console.log('⚠️  Using fallback environment variables for database configuration');
}

// Validate configuration
if (!dbConfig.username || !dbConfig.database) {
  console.error('❌ Database configuration is incomplete:', dbConfig);
  process.exit(1);
}

console.log('🔧 Database configuration:', {
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  database: dbConfig.database,
  dialect: dbConfig.dialect
});

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