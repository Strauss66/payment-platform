// Frontend environment configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/api/auth`,
  HEALTH: `${API_BASE_URL}/api/health`,
  INVOICES: `${API_BASE_URL}/api/invoices`,
  PAYMENTS: `${API_BASE_URL}/api/payments`,
  USERS: `${API_BASE_URL}/api/users`,
  ROLES: `${API_BASE_URL}/api/roles`
};

// App configuration
export const APP_CONFIG = {
  APP_NAME: 'School Platform',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@schoolplatform.com'
};

console.log('🔧 Frontend configuration loaded:', {
  API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV
});
