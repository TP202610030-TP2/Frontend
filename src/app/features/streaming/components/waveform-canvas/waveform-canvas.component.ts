import { Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-waveform-canvas',
  standalone: true,
  template: `
    <div class="w-full h-24 rounded-lg overflow-hidden bg-gray-900">
      <canvas #canvas class="w-full h-full"></canvas>
    </div>
  `,
})
export class WaveformCanvasComponent implements OnChanges, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() mediaStream: MediaStream | null = null;

  private audioCtx:   AudioContext | null                      = null;
  private analyser:   AnalyserNode | null                      = null;
  private source:     MediaStreamAudioSourceNode | null        = null;
  private animId:     number | null                            = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['mediaStream']) return;
    if (this.mediaStream && typeof AudioContext !== 'undefined') {
      this.stopAudio();
      this.initAudio();
    } else {
      this.stopAudio();
      this.drawFlat();
    }
  }

  ngOnDestroy(): void {
    this.stopAudio();
  }

  private initAudio(): void {
    this.audioCtx = new AudioContext();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 256;
    this.source   = this.audioCtx.createMediaStreamSource(this.mediaStream!);
    this.source.connect(this.analyser);
    this.drawLoop();
  }

  private drawLoop(): void {
    if (!this.analyser || !this.canvasRef) return;
    const canvas      = this.canvasRef.nativeElement;
    const ctx         = canvas.getContext('2d')!;
    const bufLen      = this.analyser.frequencyBinCount;
    const data        = new Uint8Array(bufLen);

    const frame = () => {
      this.animId = requestAnimationFrame(frame);
      this.analyser!.getByteFrequencyData(data);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barW = (canvas.width / bufLen) * 2.5;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const barH = (data[i] / 255) * canvas.height;
        const alpha = 0.5 + data[i] / 512;
        ctx.fillStyle = `rgba(76, 175, 80, ${alpha})`;
        ctx.fillRect(x, canvas.height - barH, barW, barH);
        x += barW + 1;
      }
    };
    frame();
  }

  private drawFlat(): void {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx    = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(76, 175, 80, 0.4)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }

  private stopAudio(): void {
    if (this.animId !== null) cancelAnimationFrame(this.animId);
    this.animId = null;
    this.source?.disconnect();
    this.audioCtx?.close();
    this.audioCtx = null;
    this.analyser = null;
    this.source   = null;
  }
}
