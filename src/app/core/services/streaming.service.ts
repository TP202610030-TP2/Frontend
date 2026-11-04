import { Injectable, signal } from '@angular/core';

import { environment as env } from '@env/environment';
import { API } from '@core/api/endpoints.registry';
import { WsMessage } from '@core/models/websocket.models';

export type StreamingStatus = 'idle' | 'connecting' | 'live' | 'processing' | 'done' | 'error';

/** Backend espera PCM crudo 16-bit signed, mono, a esta tasa de muestreo */
const TARGET_SAMPLE_RATE = 16000;
/** Tamaño de buffer del ScriptProcessor — potencia de 2 entre 256 y 16384 */
const PROCESSOR_BUFFER_SIZE = 4096;

@Injectable({ providedIn: 'root' })
export class StreamingService {
  private ws:            WebSocket | null               = null;
  private mediaStream:   MediaStream | null             = null;
  private audioContext:  AudioContext | null             = null;
  private sourceNode:    MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null      = null;
  private silentGain:    GainNode | null                 = null;

  readonly status               = signal<StreamingStatus>('idle');
  readonly partialText          = signal<string>('');
  readonly finalText            = signal<string>('');
  readonly errorMessage         = signal<string>('');
  readonly finalTranscriptionId = signal<string | null>(null);

  /** Abre WebSocket y solicita acceso al micrófono — token va en query param */
  start(token: string): void {
    this.status.set('connecting');
    const url = `${env.wsUrl}${API.streaming.ws.path}?token=${encodeURIComponent(token)}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.status.set('live');
      this.startMicCapture();
    };

    this.ws.onmessage = (event: MessageEvent) => {
      const msg = JSON.parse(event.data as string) as WsMessage;
      if (msg.type === 'partial') {
        this.partialText.set(msg.text);
      } else if (msg.type === 'final') {
        this.finalText.set(msg.text);
        this.finalTranscriptionId.set(msg.transcription_id);
        this.status.set('done');
        this.ws?.close(1000, 'final_received');
        this.ws = null;
      } else if (msg.type === 'error') {
        this.errorMessage.set(msg.message);
        this.status.set('error');
      }
    };

    this.ws.onclose = (event: CloseEvent) => {
      if (event.code === 1008) {
        localStorage.removeItem('asr_token');
        this.errorMessage.set('Sesión expirada. Por favor, inicia sesión nuevamente.');
        this.status.set('error');
      }
    };

    this.ws.onerror = () => {
      this.errorMessage.set('Error de conexión con el servidor de streaming.');
      this.status.set('error');
    };
  }

  stop(): void {
    this.stopMicCapture();
    this.status.set('processing');
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send('stop');
    }
  }

  cleanup(): void {
    this.stopMicCapture();
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      this.ws.close(1000, 'cleanup');
    }
    this.ws = null;
    this.reset();
  }

  reset(): void {
    this.status.set('idle');
    this.partialText.set('');
    this.finalText.set('');
    this.errorMessage.set('');
    this.finalTranscriptionId.set(null);
  }

  /**
   * Captura PCM crudo vía AudioContext + ScriptProcessorNode en vez de MediaRecorder.
   * MediaRecorder comprime con el codec por defecto del navegador (WebM/Opus), y el
   * backend espera PCM 16-bit/16kHz/mono sin contenedor — enviar el Blob comprimido
   * tal cual produce ruido para el modelo ASR.
   */
  private startMicCapture(): void {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(stream => {
        this.mediaStream = stream;

        this.audioContext = new AudioContext();
        this.sourceNode    = this.audioContext.createMediaStreamSource(stream);
        this.processorNode = this.audioContext.createScriptProcessor(PROCESSOR_BUFFER_SIZE, 1, 1);

        // El processor solo procesa si está conectado al grafo de audio; lo enrutamos
        // a destination a través de una ganancia 0 para no reproducir el mic por los parlantes.
        this.silentGain = this.audioContext.createGain();
        this.silentGain.gain.value = 0;

        this.processorNode.onaudioprocess = (event: AudioProcessingEvent) => {
          if (this.ws?.readyState !== WebSocket.OPEN) return;
          const input = event.inputBuffer.getChannelData(0);
          const pcm16 = this.downsampleToPcm16(input, this.audioContext!.sampleRate, TARGET_SAMPLE_RATE);
          this.ws.send(pcm16.buffer);
        };

        this.sourceNode.connect(this.processorNode);
        this.processorNode.connect(this.silentGain);
        this.silentGain.connect(this.audioContext.destination);
      })
      .catch(() => {
        this.errorMessage.set('No se pudo acceder al micrófono.');
        this.status.set('error');
        // El WS ya está abierto (onopen disparó este método) pero sin audio nunca
        // hará nada útil — cerrarlo libera el slot de conexión en el backend.
        this.ws?.close(1000, 'mic_unavailable');
        this.ws = null;
      });
  }

  private stopMicCapture(): void {
    this.processorNode?.disconnect();
    this.sourceNode?.disconnect();
    this.silentGain?.disconnect();
    this.audioContext?.close();
    this.mediaStream?.getTracks().forEach(t => t.stop());
    this.processorNode = null;
    this.sourceNode    = null;
    this.silentGain    = null;
    this.audioContext  = null;
    this.mediaStream   = null;
  }

  /** Resamplea por interpolación lineal a outputRate y convierte a PCM 16-bit signed */
  private downsampleToPcm16(input: Float32Array, inputRate: number, outputRate: number): Int16Array {
    if (outputRate === inputRate) {
      return this.floatTo16BitPcm(input);
    }
    const ratio      = inputRate / outputRate;
    const outLength  = Math.round(input.length / ratio);
    const resampled  = new Float32Array(outLength);
    for (let i = 0; i < outLength; i++) {
      const srcIndex      = i * ratio;
      const srcIndexFloor = Math.floor(srcIndex);
      const srcIndexCeil  = Math.min(srcIndexFloor + 1, input.length - 1);
      const frac          = srcIndex - srcIndexFloor;
      resampled[i] = input[srcIndexFloor] + (input[srcIndexCeil] - input[srcIndexFloor]) * frac;
    }
    return this.floatTo16BitPcm(resampled);
  }

  private floatTo16BitPcm(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return output;
  }
}
