// backend/src/utils/safety.js
export function assertSafeDb() {
  const db = process.env.DB_NAME || '';
  const env = process.env.NODE_ENV || 'development';

  if (env === 'test' && db !== 'school_platform') {
    throw new Error(`Refusing to run tests on non-test DB: ${db}`);
  }
  if (env === 'development' && db !== 'school_platform_dev') {
    throw new Error(`Refusing to run dev on non-dev DB: ${db}`);
  }
  if (/prod/i.test(db)) {
    throw new Error(`Prod-like DB name detected: ${db}. Aborting.`);
  }
}


