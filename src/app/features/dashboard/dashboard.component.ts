import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { DashboardService } from '@core/services/dashboard.service';
import { AuthService } from '@core/services/auth.service';
import type { DashboardData, ServiceStatusMap } from '@core/models/dashboard.models';
import { RelativeTimePipe } from '@shared/pipes/relative-time.pipe';
import { StatsCardComponent } from './components/stats-card/stats-card.component';
import { ServiceStatusListComponent } from './components/service-status-list/service-status-list.component';
import { QuickActionsComponent } from './components/quick-actions/quick-actions.component';
import { ErrorBannerComponent } from '@shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    StatsCardComponent,
    ServiceStatusListComponent,
    QuickActionsComponent,
    ErrorBannerComponent,
    RelativeTimePipe,
  ],
  template: `
    <div class="dashboard-page">

      <!-- Header con saludo -->
      <div class="dashboard-header">
        <div class="dashboard-header-inner">
          @if (loading()) {
            <div class="h-8 w-64 rounded-lg animate-pulse" style="background:rgba(255,255,255,.2)"></div>
            <div class="h-4 w-40 rounded mt-2 animate-pulse" style="background:rgba(255,255,255,.15)"></div>
          } @else {
            <div class="header-greeting">
              <div class="greeting-icon"><mat-icon>waving_hand</mat-icon></div>
              <div>
                <h1 class="greeting-title">¡Hola, {{ userName() }}!</h1>
                <p class="greeting-sub">Plataforma de transcripción de voz quechua</p>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="dashboard-body">

        <!-- Error -->
        @if (hasError()) {
          <div class="mb-6">
            <app-error-banner
              message="No se pudo cargar el panel. Verifica tu conexión e inténtalo de nuevo."
              retryLabel="Reintentar"
              (retry)="retry()" />
          </div>
        }

        @if (!hasError()) {

          <!-- Métricas -->
          <div class="stats-row">
            <div class="stat-tile">
              <div class="stat-tile-icon" style="background:rgba(46,125,50,.1)">
                <mat-icon style="color:#2E7D32">transcribe</mat-icon>
              </div>
              <div class="stat-tile-body">
                <p class="stat-tile-label">Transcripciones totales</p>
                @if (loading()) {
                  <div class="h-7 w-16 rounded animate-pulse" style="background:var(--border-color)"></div>
                } @else {
                  <p class="stat-tile-value">{{ totalTranscriptions() }}</p>
                }
              </div>
            </div>

            <div class="stat-tile">
              <div class="stat-tile-icon" style="background:rgba(25,118,210,.1)">
                <mat-icon style="color:#1976d2">schedule</mat-icon>
              </div>
              <div class="stat-tile-body">
                <p class="stat-tile-label">Última actividad</p>
                @if (loading()) {
                  <div class="h-7 w-32 rounded animate-pulse" style="background:var(--border-color)"></div>
                } @else if (latestAt()) {
                  <p class="stat-tile-value stat-tile-value--sm">{{ latestAt()! | relativeTime }}</p>
                  <p class="stat-tile-meta" [attr.title]="latestAtLabel()">{{ latestAtLabel() }}</p>
                } @else {
                  <p class="stat-tile-value stat-tile-value--sm">Sin actividad</p>
                  <p class="stat-tile-meta">Aún no hay transcripciones</p>
                }
              </div>
            </div>

            <div class="stat-tile">
              <div class="stat-tile-icon" style="background:rgba(123,31,162,.1)">
                <mat-icon style="color:#7b1fa2">verified_user</mat-icon>
              </div>
              <div class="stat-tile-body">
                <p class="stat-tile-label">Estado de cuenta</p>
                @if (loading()) {
                  <div class="h-7 w-20 rounded animate-pulse" style="background:var(--border-color)"></div>
                } @else {
                  <span class="status-pill">
                    <span class="status-pill-dot"></span>
                    Activa
                  </span>
                }
              </div>
            </div>

            <div class="stat-tile">
              <div class="stat-tile-icon" style="background:rgba(245,127,23,.1)">
                <mat-icon style="color:#F57F17">mic</mat-icon>
              </div>
              <div class="stat-tile-body">
                <p class="stat-tile-label">Transcribir ahora</p>
                <a mat-stroked-button color="primary" routerLink="/app/upload" class="mt-1 text-xs whitespace-nowrap">
                  <mat-icon>upload_file</mat-icon>
                  Subir audio
                </a>
              </div>
            </div>
          </div>

          <!-- Grid principal -->
          <div class="main-grid">

            <!-- Acciones rápidas -->
            <mat-card class="dash-card">
              <mat-card-header class="dash-card-header">
                <div class="dash-card-icon" style="background:rgba(46,125,50,.1)">
                  <mat-icon style="color:#2E7D32">bolt</mat-icon>
                </div>
                <div>
                  <mat-card-title class="dash-card-title">Acciones rápidas</mat-card-title>
                  <mat-card-subtitle class="dash-card-sub">Elige qué deseas hacer hoy</mat-card-subtitle>
                </div>
              </mat-card-header>
              <mat-card-content class="pt-2 pb-4 px-5">
                <app-quick-actions />
              </mat-card-content>
            </mat-card>

            <!-- Estado de servicios -->
            <mat-card class="dash-card">
              <mat-card-header class="dash-card-header">
                <div class="dash-card-icon" style="background:rgba(25,118,210,.1)">
                  <mat-icon style="color:#1976d2">monitor_heart</mat-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <mat-card-title class="dash-card-title">Estado de servicios</mat-card-title>
                  <mat-card-subtitle class="dash-card-sub">
                    @if (loading()) { Verificando... }
                    @else if (checkingServices()) { Algunos servicios se están iniciando, comprobando de nuevo… }
                    @else { Infraestructura backend en tiempo real }
                  </mat-card-subtitle>
                </div>
                <button mat-icon-button class="refresh-btn" (click)="refreshServices()"
                        [disabled]="loading()" aria-label="Volver a comprobar servicios">
                  <mat-icon [class.spin]="checkingServices()">refresh</mat-icon>
                </button>
              </mat-card-header>
              <mat-card-content class="pt-2 pb-4 px-5">
                <app-service-status-list [services]="services()" [checking]="checkingServices()" />
              </mat-card-content>
            </mat-card>

          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page { min-height: 100%; background: var(--bg-app); }

    .dashboard-header {
      background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
      padding: 32px 24px 40px;
    }

    .dashboard-header-inner { max-width: 1100px; margin: 0 auto; }

    .header-greeting { display: flex; align-items: center; gap: 16px; }

    .greeting-icon {
      width: 52px; height: 52px;
      border-radius: 16px;
      background: rgba(255,255,255,.18);
      border: 1px solid rgba(255,255,255,.25);
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 26px; width: 26px; height: 26px; color: white; }
    }

    .greeting-title { font-size: 1.6rem; font-weight: 800; color: white; margin: 0 0 4px; letter-spacing: -.5px; }
    .greeting-sub   { font-size: .88rem; color: rgba(255,255,255,.7); margin: 0; }

    .dashboard-body {
      container: dashboard / inline-size;
      max-width: 1100px;
      margin: -20px auto 0;
      padding: 0 24px 48px;
    }

    /* Stats row */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
      margin-bottom: 24px;

      /* Según el ancho real del contenido (con o sin menú lateral abierto) */
      @container dashboard (max-width: 900px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      @container dashboard (max-width: 480px) { grid-template-columns: 1fr; }
    }

    .stat-tile {
      background: var(--bg-surface);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: var(--shadow-card);
      border: 1px solid var(--border-color);
    }

    .stat-tile-icon {
      width: 46px; height: 46px;
      border-radius: 13px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
    }

    .stat-tile-body { min-width: 0; flex: 1; }
    .stat-tile-label { font-size: .72rem; color: var(--text-muted); margin: 0 0 6px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }
    .stat-tile-value { font-size: 1.6rem; font-weight: 800; color: var(--text-primary); margin: 0; letter-spacing: -.5px; }
    .stat-tile-value--sm {
      font-size: 1.05rem; font-weight: 700; letter-spacing: -.2px; line-height: 1.3;
      &::first-letter { text-transform: uppercase; }
    }
    .stat-tile-meta {
      font-size: .75rem; color: var(--text-muted); margin: 2px 0 0;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .refresh-btn { color: var(--text-muted); }
    .spin { animation: spin 1.2s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(46,125,50,.1);
      border: 1px solid rgba(46,125,50,.2);
      border-radius: 100px;
      padding: 4px 12px;
      font-size: .8rem;
      font-weight: 700;
      color: #2E7D32;
      margin-top: 4px;
    }

    .status-pill-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #2E7D32;
      animation: pulse-dot 1.6s ease-in-out infinite;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: .4; transform: scale(.65); }
    }

    /* Main grid */
    .main-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;

      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }

    .dash-card {
      border-radius: 16px !important;
      background: var(--bg-surface) !important;
      box-shadow: var(--shadow-card) !important;
      border: 1px solid var(--border-color) !important;
    }

    .dash-card-header {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      padding: 20px 20px 12px !important;
    }

    .dash-card-icon {
      width: 40px; height: 40px;
      border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }

    .dash-card-title { font-size: .95rem !important; font-weight: 700 !important; color: var(--text-primary) !important; margin: 0 !important; }
    .dash-card-sub   { font-size: .78rem !important; color: var(--text-muted) !important; margin: 2px 0 0 !important; }
  `],
})
export class DashboardComponent implements OnInit {
  private readonly dashSvc = inject(DashboardService);
  private readonly authSvc = inject(AuthService);

  data     = signal<DashboardData | null>(null);
  loading  = signal(true);
  hasError = signal(false);

  userName = computed(() => {
    const name = this.data()?.user?.full_name;
    if (name) return name;
    return this.authSvc.currentUser()?.email?.split('@')[0] ?? 'Usuario';
  });

  totalTranscriptions = computed<number | null>(() =>
    this.loading() ? null : (this.data()?.transcription_summary.total ?? 0)
  );

  latestAt = computed<string | null>(() =>
    this.loading() ? null : (this.data()?.transcription_summary.latest_at ?? null)
  );

  /** Fecha y hora compactas, p. ej. "06 nov. 2026 · 09:49" */
  latestAtLabel = computed<string | null>(() => {
    const lat = this.latestAt();
    if (!lat) return null;
    const d = new Date(lat);
    const day  = d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${day} · ${time}`;
  });

  services = computed(() => this.data()?.services ?? null);

  /** true mientras se vuelven a consultar servicios que aún no responden */
  readonly checkingServices = signal(false);

  private readonly destroyRef = inject(DestroyRef);
  private pollTimer: ReturnType<typeof setTimeout> | null = null;
  private retries = 0;

  constructor() {
    this.destroyRef.onDestroy(() => this.clearPoll());
  }

  ngOnInit(): void { this.load(); }
  retry():  void   { this.load(); }

  /** Botón "actualizar" del panel de servicios. */
  refreshServices(): void {
    this.retries = 0;
    this.pollServices();
  }

  private load(): void {
    this.clearPoll();
    this.loading.set(true);
    this.hasError.set(false);
    this.dashSvc.getDashboard().subscribe({
      next:  d  => {
        this.data.set(d);
        this.loading.set(false);
        this.retries = 0;
        this.scheduleServicesCheck(d.services);
      },
      error: () => { this.hasError.set(true); this.loading.set(false); },
    });
  }

  /**
   * Con escalado a cero (Azure Container Apps) la primera consulta /health solo
   * "despierta" al servicio y responde como no disponible. Mientras algún
   * servicio no esté operativo se vuelve a consultar cada RETRY_MS (hasta
   * MAX_RETRIES veces); luego se refresca cada REFRESH_MS.
   */
  private scheduleServicesCheck(services: ServiceStatusMap | null | undefined): void {
    this.clearPoll();
    const allHealthy = !!services && Object.values(services).every(s => s === 'healthy');
    const keepTrying = !allHealthy && this.retries < DashboardComponent.MAX_RETRIES;
    this.checkingServices.set(keepTrying);
    const delay = keepTrying ? DashboardComponent.RETRY_MS : DashboardComponent.REFRESH_MS;
    this.pollTimer = setTimeout(() => this.pollServices(), delay);
  }

  private pollServices(): void {
    this.clearPoll();
    this.retries++;
    this.dashSvc.getServices().subscribe({
      next: services => {
        const current = this.data();
        if (current) this.data.set({ ...current, services });
        if (Object.values(services).every(s => s === 'healthy')) this.retries = 0;
        this.scheduleServicesCheck(services);
      },
      error: () => this.scheduleServicesCheck(null),
    });
  }

  private clearPoll(): void {
    if (this.pollTimer !== null) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  static readonly RETRY_MS    = 5_000;
  static readonly MAX_RETRIES = 12;      // ~1 minuto reintentando
  static readonly REFRESH_MS  = 60_000;
}
