import { getSession } from 'next-auth/react'

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

class ApiError extends Error {
  constructor(public statusCode: number, message: string, public upgradeUrl?: string) {
    super(message)
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const session = await getSession()
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      ...init?.headers,
    }
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const errorMsg = err.error || 'Request failed'
    
    // Dispatch global event for Upgrade Modal on 402
    if (res.status === 402 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('upgrade_required', { detail: errorMsg }))
    }
    
    throw new ApiError(res.status, errorMsg, err.upgrade_url)
  }
  return res.json()
}

export const api = {
  analyze: (videoUrl: string) =>
    apiFetch<{analysis_id: string}>('/api/analyze', {method:'POST', body: JSON.stringify({video_url: videoUrl})}),
  getAnalysis: (id: string) =>
    apiFetch<any>(`/api/analysis/${id}`),
  getHistory: (page = 1) =>
    apiFetch<any>(`/api/history?page=${page}`),
  createSubscription: (tier: string) =>
    apiFetch<any>('/api/payments/create-subscription', {method:'POST', body: JSON.stringify({tier})}),
  verifyPayment: (data: any) =>
    apiFetch<any>('/api/payments/verify', {method:'POST', body: JSON.stringify(data)}),
  getSubscription: () =>
    apiFetch<any>('/api/payments/subscription'),
  getMe: () =>
    apiFetch<any>('/api/me'),
  deleteAnalysis: (id: string) =>
    apiFetch<{deleted: boolean}>(`/api/history/${id}`, {method:'DELETE'}),
  createExport: (analysisId: string, format: string) =>
    apiFetch<{job_id: string, status: string, download_url?: string}>('/api/exports', {method:'POST', body: JSON.stringify({analysis_id: analysisId, format})}),
}

export const carouselApi = {
  uploadLogo: async (file: File): Promise<{
    logo_url: string;
    brand_color_hex: string;
    brand_color_dark: string;
    brand_color_light: string;
    text_on_brand: string;
  }> => {
    const session = await getSession();
    const formData = new FormData();
    formData.append('logo', file);

    const res = await fetch(`${API}/api/carousel/upload-logo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${(session as any)?.accessToken}`,
        // Note: DO NOT set Content-Type — browser sets it with boundary for multipart
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(res.status, err.error || 'Upload failed');
    }
    return res.json();
  },

  getBrandSettings: () =>
    apiFetch<{
      has_logo: boolean;
      logo_url?: string;
      brand_color_hex?: string;
      preferred_theme: string;
    }>('/api/carousel/brand-settings'),

  setTheme: (theme: string) =>
    apiFetch<{success: boolean}>('/api/carousel/set-theme', {
      method: 'POST',
      body: JSON.stringify({ theme }),
    }),

  deleteLogo: () =>
    apiFetch<{success: boolean}>('/api/carousel/logo', { method: 'DELETE' }),
};
