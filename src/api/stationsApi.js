const API = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const headers = { ...options.headers };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Erreur réseau');
  }
  return data;
}

export const stationsApi = {
  station1: {
    generate: (idea) => request('/station1/generate', { method: 'POST', body: JSON.stringify({ idea }) })
  },
  station2: {
    itinerary: (data) => request('/station2/itinerary', { method: 'POST', body: JSON.stringify(data) })
  },
  station3: {
    analyze: async (file) => {
      const formData = new FormData();
      formData.append('leaf', file);
      return request('/station3/analyze', { method: 'POST', body: formData });
    }
  },
  station5: {
    campaign: async (prompt, file) => {
      const formData = new FormData();
      formData.append('prompt', prompt);
      if (file) formData.append('photo', file);
      return request('/station5/campaign', { method: 'POST', body: formData });
    }
  },
  station6: {
    analyze: async (data) => {
      if (data.file) {
        const formData = new FormData();
        formData.append('csv', data.file);
        return request('/station6/analyze-batch', { method: 'POST', body: formData });
      } else {
        return request('/station6/analyze-batch', { method: 'POST', body: JSON.stringify({ text: data.text }) });
      }
    }
  }
};
