import axios from 'axios';

export const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Mock endpoints for dashboard widgets
export const mockApi = {
  getPaymentsDue: async () => ({ data: { dueCount: 0, total: 0 } }),
  getCourses: async () => ({ data: { courses: [] } }),
  getTasks: async () => ({ data: { tasks: [] } }),
  // Admin dashboard mocks
  getAdminKPIs: async () => ({
    data: {
      totalStudents: 1240,
      arBalance: 183450.75,
      overdueInvoices: 312,
      activeUsers: 187,
      trend: { arBalancePct: -4.2, overduePct: 1.3 }
    }
  }),
  getOverdueCollections: async () => ({
    data: {
      rows: Array.from({ length: 10 }).map((_, i) => ({
        studentId: 1000 + i,
        name: `Student ${i + 1}`,
        grade: ['K', '1', '2', '3', '4', '5'][i % 6],
        daysLate: 5 + i * 3,
        amount: 50 * (i + 1)
      }))
    }
  }),
  getApprovalsQueue: async () => ({
    data: {
      items: [
        { id: 'a1', type: 'discount', requester: 'Registrar', submittedAt: new Date(Date.now() - 3600e3).toISOString(), status: 'pending' },
        { id: 'a2', type: 'refund', requester: 'Cashier #2', submittedAt: new Date(Date.now() - 7200e3).toISOString(), status: 'pending' },
        { id: 'a3', type: 'role_change', requester: 'IT Support', submittedAt: new Date(Date.now() - 14400e3).toISOString(), status: 'approved' },
        { id: 'a4', type: 'discount', requester: 'Admissions', submittedAt: new Date(Date.now() - 5400e3).toISOString(), status: 'pending' }
      ]
    }
  }),
  getExperiments: async () => ({
    data: {
      experiments: [
        { id: 'e1', name: '15-day reminder subject lines', variantA: 'Reminder: Payment due', variantB: 'Action needed: Payment due', upliftPct: 3.2, status: 'running' },
        { id: 'e2', name: 'Portal CTA placement', variantA: 'Top banner', variantB: 'Inline card', status: 'planned' }
      ]
    }
  }),
  getSystemHealth: async () => ({
    data: {
      services: [
        { name: 'Auth Service', status: 'up', p99ms: 120, lastDeploy: new Date(Date.now() - 86400e3).toISOString() },
        { name: 'Payments API', status: 'degraded', p99ms: 480, lastDeploy: new Date(Date.now() - 43200e3).toISOString() },
        { name: 'Invoices', status: 'up', p99ms: 95, lastDeploy: new Date(Date.now() - 172800e3).toISOString() },
        { name: 'Notifications', status: 'down', p99ms: 0, lastDeploy: new Date(Date.now() - 7200e3).toISOString() }
      ]
    }
  }),
  getAuditLog: async () => ({
    data: {
      events: Array.from({ length: 20 }).map((_, i) => ({
        id: `ev${i + 1}`,
        actor: ['admin@school.org', 'cashier@school.org', 'it@school.org'][i % 3],
        action: ['updated role', 'created discount', 'deleted user'][i % 3],
        target: ['user:123', 'discount:456', 'user:789'][i % 3],
        at: new Date(Date.now() - i * 3600e3).toISOString()
      }))
    }
  })
};


