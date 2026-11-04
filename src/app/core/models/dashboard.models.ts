import { ApiEnvelope } from './api-envelope.model';
import { DashboardUser } from './user.models';

/** Solo dos estados posibles — NO 'unhealthy' ni 'unknown' */
export type ServiceStatus = 'healthy' | 'unavailable';

/**
 * Claves exactas que devuelve el backend en data.services:
 *   auth, audio-processor, asr, transcription-manager
 */
export interface ServiceStatusMap {
  'auth':                  ServiceStatus;
  'audio-processor':       ServiceStatus;
  'asr':                   ServiceStatus;
  'transcription-manager': ServiceStatus;
}

export interface DashboardData {
  user:                 DashboardUser;
  transcription_summary: {
    total:     number;
    latest_at: string | null;
  };
  services: ServiceStatusMap;
}

/** GET /api/v1/dashboard devuelve ApiEnvelope<DashboardData> */
export type DashboardResponse = ApiEnvelope<DashboardData>;
