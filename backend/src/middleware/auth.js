import jwt from 'jsonwebtoken';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load configuration from config.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let jwtConfig = {};
try {
  const configPath = join(__dirname, '../../config/config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const env = process.env.NODE_ENV || 'development';
    jwtConfig = config[env] || config.development;
  }
} catch (error) {
  console.error('Could not load JWT configuration:', error.message);
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const secret = process.env.JWT_SECRET || jwtConfig.jwt_secret || 'fallback-secret';
    const payload = jwt.verify(token, secret);
    req.user = payload; // { id, school_id, defaultSchoolId, roles: [] }
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function signJwt(user) {
  const secret = process.env.JWT_SECRET || jwtConfig.jwt_secret || 'fallback-secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || jwtConfig.jwt_expires_in || '12h';
  
  return jwt.sign(
    { id: user.id, school_id: user.school_id, defaultSchoolId: user.defaultSchoolId, roles: user.roles || [] },
    secret,
    { expiresIn }
  );
}