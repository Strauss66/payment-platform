import { Router } from 'express';
import bcrypt from 'bcrypt';
import { User, Role, UserRole } from '../models/index.js';
import { signJwt, requireAuth } from '../middleware/auth.js';

const r = Router();

// GET /api/auth - Show available auth endpoints
r.get('/', (req, res) => {
  res.json({
    message: 'Authentication endpoints',
    endpoints: {
      login: 'POST /api/auth/login',
      register: 'POST /api/auth/register',
      me: 'GET /api/auth/me',
      info: 'GET /api/auth'
    },
    status: 'available'
  });
});

// GET /api/auth/me - Get current user info (protected)
r.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const roles = await UserRole.findAll({ where: { user_id: user.id }, include: [{ model: Role, as: 'role' }] });
    const roleKeys = roles.map(ur => ur.role?.key_name).filter(Boolean);
    
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      school_id: user.school_id,
      status: user.status,
      roles: roleKeys
    });
  } catch (error) {
    console.error('Error in /me endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/login
r.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const roles = await UserRole.findAll({ where: { user_id: user.id }, include: [{ model: Role, as: 'role' }] });
    const roleKeys = roles.map(ur => ur.role?.key_name).filter(Boolean);
    const token = signJwt({ id: user.id, school_id: user.school_id, roles: roleKeys });
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        username: user.username,
        school_id: user.school_id, 
        roles: roleKeys 
      } 
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/register - For testing purposes
r.post('/register', async (req, res) => {
  try {
    const { email, password, username, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Create user (assuming school_id = 1 for now)
    const user = await User.create({
      email,
      username,
      password_hash,
      school_id: 1
    });
    
    // Assign role
    const roleRecord = await Role.findOne({ where: { key_name: role } });
    if (roleRecord) {
      await UserRole.create({
        user_id: user.id,
        role_id: roleRecord.id
      });
    }
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: { id: user.id, email: user.email, username: user.username, role }
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default r;