/**
 * Contrato único de trazabilidad frontend ↔ backend.
 * Cada entrada mapea a un endpoint documentado en backend-api-reference.md.
 * Modificar aquí cuando cambie el backend.
 */
export const API = {
  auth: {
    register: { path: '/api/v1/auth/register',          timeout: 30_000 }, // E1-HU01
    login:    { path: '/api/v1/auth/login',             timeout: 30_000 }, // E1-HU02
    logout:   { path: '/api/v1/auth/logout',            timeout: 10_000 }, // E1-HU05
    recovery: { path: '/api/v1/auth/password-recovery', timeout: 10_000 },
    reset:    { path: '/api/v1/auth/password-reset',    timeout: 10_000 },
  },
  transcription: {
    upload:   { path: '/api/v1/transcribe',                       timeout: 300_000 }, // E2-HU01 — 5 min
    list:     { path: '/api/v1/transcriptions',                   timeout: 15_000  }, // E2-HU05
    detail:   { path: '/api/v1/transcriptions/:id',               timeout: 15_000  }, // E2-HU06
    download: { path: '/api/v1/transcriptions/:id/download',      timeout: 30_000  }, // E2-HU04
    delete:   { path: '/api/v1/transcriptions/:id',               timeout: 15_000  },
    rename:   { path: '/api/v1/transcriptions/:id',               timeout: 15_000  }, // PATCH — actualiza audio_filename
  },
  streaming: {
    ws: { path: '/ws/stream', timeout: 0 }, // E2-HU03 — WebSocket, token en query param ?token=<jwt>
  },
  dashboard: {
    summary: { path: '/api/v1/dashboard', timeout: 15_000 }, // E1-HU06 — responde ApiEnvelope<DashboardData>
    services: { path: '/api/v1/dashboard/services', timeout: 10_000 }, // solo estado de servicios
    status:  { path: '/api/v1/status',    timeout: 10_000 }, // health check de microservicios
  },
  users: {
    profile:       { path: '/api/v1/users/profile',          timeout: 15_000 }, // E1-HU03
    updateProfile: { path: '/api/v1/users/profile',          timeout: 15_000 }, // E1-HU03 — PUT
    changePassword:{ path: '/api/v1/users/change-password',  timeout: 15_000 }, // E1-HU04
  },
} as const;

export type ApiPath = string;

/** Reemplaza :id (u otro param) en el path del endpoint */
export function apiPath(path: ApiPath, params: Record<string, string> = {}): string {
  return Object.entries(params).reduce(
    (p, [k, v]) => p.replace(`:${k}`, v),
    path,
  );
}
