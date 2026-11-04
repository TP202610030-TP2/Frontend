import { TestBed } from '@angular/core/testing';
import { StreamingService } from './streaming.service';

class MockWebSocket {
  static lastInstance: MockWebSocket;
  onopen:    ((e: Event) => void) | null = null;
  onmessage: ((e: MessageEvent) => void) | null = null;
  onclose:   ((e: CloseEvent) => void) | null = null;
  onerror:   ((e: Event) => void) | null = null;
  readyState = WebSocket.OPEN;
  send  = jest.fn();
  close = jest.fn();
  constructor() { MockWebSocket.lastInstance = this; }
}

describe('StreamingService', () => {
  let service: StreamingService;

  const mockTrack = { stop: jest.fn() };
  const mockStream: Partial<MediaStream> = {
    getTracks: () => [mockTrack as unknown as MediaStreamTrack],
  };
  const mockProcessorNode = { connect: jest.fn(), disconnect: jest.fn(), onaudioprocess: null as unknown };
  const mockSourceNode    = { connect: jest.fn(), disconnect: jest.fn() };
  const mockGainNode      = { connect: jest.fn(), disconnect: jest.fn(), gain: { value: 1 } };
  const mockAudioContext  = {
    sampleRate: 48000,
    createMediaStreamSource: jest.fn(() => mockSourceNode),
    createScriptProcessor:   jest.fn(() => mockProcessorNode),
    createGain:              jest.fn(() => mockGainNode),
    destination: {},
    close: jest.fn(),
  };

  beforeEach(() => {
    jest.spyOn(global, 'WebSocket').mockImplementation(() => new MockWebSocket() as unknown as WebSocket);

    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: { getUserMedia: jest.fn().mockResolvedValue(mockStream) },
      configurable: true,
    });

    (global as Record<string, unknown>)['AudioContext'] = jest.fn(() => mockAudioContext);

    TestBed.configureTestingModule({});
    service = TestBed.inject(StreamingService);

    // reset mocks between tests
    mockTrack.stop.mockClear();
    mockProcessorNode.connect.mockClear();
    mockProcessorNode.disconnect.mockClear();
    mockSourceNode.connect.mockClear();
    mockSourceNode.disconnect.mockClear();
    mockAudioContext.close.mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it('status inicia en idle', () => {
    expect(service.status()).toBe('idle');
  });

  it('mensaje partial actualiza partialText — E2-HU03-S02', () => {
    service.start('tok');
    MockWebSocket.lastInstance.onopen!(new Event('open'));
    MockWebSocket.lastInstance.onmessage!(
      new MessageEvent('message', { data: JSON.stringify({ type: 'partial', text: 'Hola' }) }),
    );
    expect(service.partialText()).toBe('Hola');
  });

  it('mensaje final actualiza finalText y status done — E2-HU03-S03', () => {
    service.start('tok');
    MockWebSocket.lastInstance.onopen!(new Event('open'));
    MockWebSocket.lastInstance.onmessage!(
      new MessageEvent('message', { data: JSON.stringify({ type: 'final', text: 'Fin', transcription_id: 'tr1' }) }),
    );
    expect(service.finalText()).toBe('Fin');
    expect(service.status()).toBe('done');
  });

  it('mensaje error actualiza status error', () => {
    service.start('tok');
    MockWebSocket.lastInstance.onopen!(new Event('open'));
    MockWebSocket.lastInstance.onmessage!(
      new MessageEvent('message', { data: JSON.stringify({ type: 'error', message: 'ASR error' }) }),
    );
    expect(service.status()).toBe('error');
  });

  it('cierre con código 1008 indica sesión expirada — E1-HU05-S02', () => {
    service.start('tok');
    MockWebSocket.lastInstance.onclose!({ code: 1008 } as CloseEvent);
    expect(service.errorMessage()).toContain('Sesión expirada');
    expect(service.status()).toBe('error');
  });

  it('cleanup detiene MediaStream tracks', async () => {
    service.start('tok');
    MockWebSocket.lastInstance.onopen!(new Event('open'));
    await Promise.resolve(); // let startMicCapture promise proceed
    await Promise.resolve();

    service.cleanup();
    expect(mockTrack.stop).toHaveBeenCalled();
  });
});
