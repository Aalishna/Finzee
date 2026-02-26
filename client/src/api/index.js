import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('finzee-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('finzee-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ── Expenses ──────────────────────────────────────────────
export const expensesAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  parseNatural: (text) => api.post('/expenses/parse-natural', { text }),
};

// ── Budget ────────────────────────────────────────────────
export const budgetAPI = {
  get: () => api.get('/budget'),
  set: (data) => api.post('/budget', data),
  update: (category, data) => api.put(`/budget/${category}`, data),
};

// ── Goals ─────────────────────────────────────────────────
export const goalsAPI = {
  getAll: () => api.get('/goals'),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
};

// ── Insights ──────────────────────────────────────────────
export const insightsAPI = {
  get: () => api.get('/insights'),
};

// ── Health Score ──────────────────────────────────────────
export const healthScoreAPI = {
  get: () => api.get('/health-score'),
};

export default api;
