import { api } from '../apiClient';

describe('apiClient X-School-Id header policy', () => {
  const originalLocalStorage = global.localStorage;
  beforeEach(() => {
    let store = {};
    global.localStorage = {
      getItem: (k) => store[k] ?? null,
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; }
    };
  });
  afterEach(() => { global.localStorage = originalLocalStorage; });

  test('non-super users never send X-School-Id', async () => {
    localStorage.setItem('user.roles', JSON.stringify(['teacher']));
    localStorage.setItem('tenant.schoolId', '123');
    const cfg = await api.interceptors.request.handlers[0].fulfilled({ url: '/api/announcements', headers: {} });
    expect(cfg.headers['X-School-Id']).toBeUndefined();
  });

  test('super_admin includes X-School-Id except on auth endpoints', async () => {
    localStorage.setItem('user.roles', JSON.stringify(['super_admin']));
    localStorage.setItem('tenant.schoolId', '456');
    const cfg1 = await api.interceptors.request.handlers[0].fulfilled({ url: '/api/announcements', headers: {} });
    expect(cfg1.headers['X-School-Id']).toBe('456');
    const cfg2 = await api.interceptors.request.handlers[0].fulfilled({ url: '/api/auth/login', headers: {} });
    expect(cfg2.headers['X-School-Id']).toBeUndefined();
  });
});


