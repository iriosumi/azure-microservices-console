import type { MicroService, MetricsResponse, InstanceSummary } from '../types'

const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  return res.json()
}

export const api = {
  getServices: () =>
    request<MicroService[]>(`${BASE}/services`),

  createService: (data: Partial<MicroService>) =>
    request<MicroService>(`${BASE}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  updateService: (id: string, data: Partial<MicroService>) =>
    request<MicroService>(`${BASE}/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  deleteService: (id: string) =>
    fetch(`${BASE}/services/${id}`, { method: 'DELETE' }),

  serviceAction: (id: string, action: string) =>
    request<MicroService>(`${BASE}/services/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    }),

  getMetrics: (id: string) =>
    request<MetricsResponse>(`${BASE}/services/${id}/metrics`),

  // ── Instance management ──────────────────────────────────
  runService: (id: string) =>
    request<InstanceSummary>(`${BASE}/services/${id}/run`, { method: 'POST' }),

  getInstances: () =>
    request<InstanceSummary[]>(`${BASE}/instances`),

  stopInstance: (instanceId: string) =>
    fetch(`${BASE}/instances/${instanceId}/stop`, { method: 'POST' }),

  getInstanceMetrics: (instanceId: string) =>
    request<MetricsResponse>(`${BASE}/instances/${instanceId}/metrics`),
}
