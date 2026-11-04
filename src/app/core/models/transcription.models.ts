/** Metadatos del audio procesado — camelCase según backend */
export interface AudioMetadata {
  format:     string;
  duration:   number;
  sampleRate: number;
  bitRate:    number;
  channels:   number;
  codec:      string | null;
}

/** Respuesta de POST /api/v1/transcribe */
export interface TranscribeResponse {
  audio_id:           string;
  processed_path:     string;
  metadata:           AudioMetadata;
  transcription_id:   string | null;
  transcription_text: string | null;
}

/** Item en la lista — campo `text` completo, NO text_preview; `audio_duration`, NO duration */
export interface TranscriptionListItem {
  transcription_id: string;
  text:             string;
  audio_filename:   string;
  audio_duration:   number;
  created_at:       string;
}

/** Paginación — current_page y total_items, NO page ni total */
export interface PaginationMeta {
  current_page: number;
  page_size:    number;
  total_pages:  number;
  total_items:  number;
}

/** Respuesta de GET /api/v1/transcriptions — campo `transcriptions`, NO items */
export interface TranscriptionListResponse {
  transcriptions: TranscriptionListItem[];
  pagination:     PaginationMeta;
}

export interface WordConfidence {
  word:       string;
  confidence: number;
  start_time: number;
  end_time:   number;
}

/** Detalle completo — campo `audio_duration`, sin campo `language` */
export interface TranscriptionDetail {
  transcription_id: string;
  user_id:          string;
  audio_id:         string;
  text:             string;
  audio_filename:   string;
  audio_duration:   number;
  processing_time:  number;
  created_at:       string;
  confidence_scores: WordConfidence[];
}
