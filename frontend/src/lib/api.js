const configuredApiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

function getApiBaseUrl() {
  if (configuredApiBaseUrl) {
    return configuredApiBaseUrl;
  }

  if (typeof window !== 'undefined') {
    const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (isLocalHost) {
      return '';
    }
  }

  throw new Error('Missing VITE_API_URL. Set it in the hosted frontend to your Render backend URL and redeploy.');
}

function buildApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const apiBaseUrl = getApiBaseUrl();
  return apiBaseUrl ? `${apiBaseUrl}/api${normalizedPath}` : `/api${normalizedPath}`;
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || 'API request failed');
  }

  return data;
}