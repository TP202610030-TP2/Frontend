import { Component, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './landing.component.html',
  styleUrl:    './landing.component.scss',
})
export class LandingComponent implements OnInit, OnDestroy {
  isScrolled = signal(false);
  typedText  = signal('');

  readonly waveHeights = [28, 52, 76, 44, 68, 88, 58, 38, 72, 84, 46, 62, 78, 32, 70];

  readonly features = [
    {
      icon: 'upload_file',
      title: 'Subir Audio',
      description: 'Carga archivos WAV, MP3, OGG, FLAC o M4A de hasta 50 MB y obtén la transcripción en segundos.',
    },
    {
      icon: 'mic',
      title: 'Streaming en Tiempo Real',
      description: 'Graba con tu micrófono y observa la transcripción aparecer en tiempo real mediante WebSocket de baja latencia.',
    },
    {
      icon: 'api',
      title: 'API REST Documentada',
      description: 'Integra la transcripción ASR en tus aplicaciones con nuestra API v1 documentada en Swagger/OpenAPI.',
    },
  ] as const;

  readonly stats = [
    { value: '4M+',    label: 'Hablantes de Quechua',   icon: 'people'     },
    { value: 'Whisper', label: 'Motor ASR de OpenAI',    icon: 'psychology' },
    { value: 'Azure',  label: 'Infraestructura en nube', icon: 'cloud'      },
    { value: '<2s',    label: 'Latencia de respuesta',   icon: 'speed'      },
  ] as const;

  readonly steps = [
    { num: '01', icon: 'cloud_upload', title: 'Sube tu audio',    desc: 'Arrastra o selecciona un archivo de audio en cualquier formato común.' },
    { num: '02', icon: 'memory',       title: 'Procesamiento IA', desc: 'Whisper analiza el audio y reconoce el habla en lengua quechua.' },
    { num: '03', icon: 'text_snippet', title: 'Obtén el texto',   desc: 'Descarga la transcripción en TXT, JSON o SRT con scores de confianza.' },
  ] as const;

  private readonly phrases = [
    'Allinllachu, imaynallan kashanki...',
    'Munakuyki, Quechua simipi...',
    "Sumaq p'unchaw kachun...",
  ];

  private phraseIdx  = 0;
  private charIdx    = 0;
  private isDeleting = false;
  private typeTimer?: ReturnType<typeof setTimeout>;
  private observer?:  IntersectionObserver;

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 20);
  }

  ngOnInit(): void {
    this.typeLoop();
    this.observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('revealed');
      }),
      { threshold: 0.12 },
    );
    document.querySelectorAll('.reveal-section').forEach(el => this.observer!.observe(el));
  }

  ngOnDestroy(): void {
    clearTimeout(this.typeTimer);
    this.observer?.disconnect();
  }

  private typeLoop(): void {
    const phrase = this.phrases[this.phraseIdx];
    if (this.isDeleting) {
      this.typedText.set(phrase.substring(0, this.charIdx - 1));
      this.charIdx--;
    } else {
      this.typedText.set(phrase.substring(0, this.charIdx + 1));
      this.charIdx++;
    }

    let delay = this.isDeleting ? 45 : 95;
    if (!this.isDeleting && this.charIdx === phrase.length) {
      delay = 2200; this.isDeleting = true;
    } else if (this.isDeleting && this.charIdx === 0) {
      this.isDeleting = false;
      this.phraseIdx  = (this.phraseIdx + 1) % this.phrases.length;
      delay = 400;
    }
    this.typeTimer = setTimeout(() => this.typeLoop(), delay);
  }
}
