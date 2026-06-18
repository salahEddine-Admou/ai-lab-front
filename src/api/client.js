const API = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || 'Erreur réseau');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  analyzeCVUpload: async (file) => {
    const formData = new FormData();
    formData.append('cv', file);
    const headers = {};
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API}/users/cv/analyze`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || 'Erreur réseau');
      err.status = res.status;
      throw err;
    }
    return data;
  },
  onboarding: (body) =>
    request('/users/onboarding', { method: 'PATCH', body: JSON.stringify(body) }),
  updateProfile: (body) =>
    request('/users/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  getCompanies: (params) => {
    const q = new URLSearchParams(params).toString();
    return request(`/companies?${q}`);
  },
  getSectors: () => request('/companies/sectors'),
  syncJobs: () => request('/companies/sync', { method: 'POST' }),
  getCompany: (id) => request(`/companies/${id}`),
  getApplications: () => request('/applications'),
  getStats: () => request('/applications/stats'),
  createApplication: (companyId) =>
    request('/applications', { method: 'POST', body: JSON.stringify({ companyId }) }),
  batchApplications: (companyIds) =>
    request('/applications/batch', { method: 'POST', body: JSON.stringify({ companyIds }) }),
  updateApplication: (id, body) =>
    request(`/applications/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  regenerateLetter: (id) => request(`/applications/${id}/regenerate`, { method: 'POST' }),
  deleteApplication: (id) => request(`/applications/${id}`, { method: 'DELETE' }),
  getInterviewDashboard: () => request('/interviews/dashboard'),
  getInterviews: () => request('/interviews'),
  getInterview: (id) => request(`/interviews/${id}`),
  syncInterviews: (limit = 3) =>
    request('/interviews/sync', { method: 'POST', body: JSON.stringify({ limit }) }),
  createInterviewForCompany: (companyId) =>
    request(`/interviews/company/${companyId}`, { method: 'POST' }),
  getCvAdaptation: () => request('/users/cv/adaptation'),
  adaptCv: () => request('/users/cv/adapt', { method: 'POST' }),
  saveAdaptedCv: (adaptedCvText) =>
    request('/users/cv/adapted', { method: 'PATCH', body: JSON.stringify({ adaptedCvText }) }),
  downloadCv: async (format = 'txt') => {
    const token = getToken();
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API}/users/cv/download?format=${format}`, { headers });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const err = new Error(data.message || 'Téléchargement impossible');
      err.status = res.status;
      throw err;
    }
    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename = match?.[1] || `CV-adapte.${format}`;
    return { blob, filename };
  },
};
