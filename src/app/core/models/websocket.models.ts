/** Mensaje parcial (en proceso) del WebSocket ASR */
export interface WsPartialMessage {
  type: 'partial';
  text: string;
}

/** Transcripción final confirmada */
export interface WsFinalMessage {
  type:             'final';
  text:             string;
  transcription_id: string;
}

/** Error del servidor ASR */
export interface WsErrorMessage {
  type:    'error';
  message: string;
  code?:   number;
}

export type WsMessage = WsPartialMessage | WsFinalMessage | WsErrorMessage;
