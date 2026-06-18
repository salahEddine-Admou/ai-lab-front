const API = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const headers = { ...options.headers };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Erreur réseau');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const standApi = {
  createSession: (body) =>
    request('/stand/session', { method: 'POST', body: JSON.stringify(body) }),
  updateProfile: (token, body) =>
    request(`/stand/session/${token}/profile`, { method: 'PATCH', body: JSON.stringify(body) }),
  analyzeCv: async (token, file) => {
    const formData = new FormData();
    formData.append('cv', file);
    return request(`/stand/session/${token}/cv`, { method: 'POST', body: formData });
  },
  getMatches: (token) =>
    request(`/stand/session/${token}/matches`, { method: 'POST', body: '{}' }),
  startInterview: (token, companyId) =>
    request(`/stand/session/${token}/interview/start`, { method: 'POST', body: JSON.stringify({ companyId }) }),
  submitAnswer: (token, body) =>
    request(`/stand/session/${token}/interview/answer`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  finalize: (token) =>
    request(`/stand/session/${token}/finalize`, { method: 'POST', body: '{}' }),
  getReport: (token) => request(`/stand/report/${token}`),
  getStats: () => request('/stand/session/stats', { method: 'GET' }),
  purgeSession: (token) => request(`/stand/session/${token}`, { method: 'DELETE' }),
};
