/** Solo usar con GET /api/v1/dashboard — los demás endpoints no envuelven en envelope */
export interface ApiEnvelope<T> {
  status:    'success' | 'error';
  data?:     T;
  message?:  string;
  timestamp: string;
}
