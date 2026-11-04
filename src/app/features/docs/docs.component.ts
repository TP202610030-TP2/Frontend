import { Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

import { AuthService } from '@core/services/auth.service';
import { environment as env } from '@env/environment';

interface EndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path:   string;
  desc:   string;
}

@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule, MatDividerModule, MatChipsModule],
  template: `
    <div class="docs-page">

      <!-- Header -->
      <div class="docs-header">
        <div class="docs-header-inner">
          <div class="header-icon">
            <mat-icon>api</mat-icon>
          </div>
          <div>
            <h1 class="docs-title">Documentación de la API</h1>
            <p class="docs-subtitle">ASR Quechua Platform · REST API v1</p>
          </div>
          @if (isAuth()) {
            <button mat-raised-button class="copy-btn" (click)="copyToken()">
              <mat-icon>content_copy</mat-icon>
              Copiar mi JWT
            </button>
          }
        </div>
      </div>

      <div class="docs-body">

        <!-- Info panel -->
        <div class="info-grid">

          <!-- Base URL -->
          <div class="info-card">
            <div class="info-card-head">
              <mat-icon>link</mat-icon>
              <span>URL base</span>
            </div>
            <code class="code-block">{{ apiBase }}</code>
            <p class="info-hint">Todos los endpoints usan este prefijo.</p>
          </div>

          <!-- Autenticación -->
          <div class="info-card">
            <div class="info-card-head">
              <mat-icon>lock</mat-icon>
              <span>Autenticación</span>
            </div>
            <code class="code-block">Authorization: Bearer &lt;jwt&gt;</code>
            <p class="info-hint">JWT HS256 · Expira en 24 h · Payload incluye <code>user_id</code> y <code>email</code>.</p>
          </div>

          <!-- Swagger link -->
          <div class="info-card">
            <div class="info-card-head">
              <mat-icon>open_in_new</mat-icon>
              <span>Swagger UI interactivo</span>
            </div>
            <code class="code-block">{{ swaggerUrl }}</code>
            <p class="info-hint">Abre en una nueva pestaña para explorar y probar los endpoints.</p>
            <a class="open-swagger-btn" [href]="swaggerUrl" target="_blank" rel="noopener">
              <mat-icon>launch</mat-icon>
              Abrir Swagger UI
            </a>
          </div>

        </div>

        <!-- Cómo autorizar -->
        <mat-card class="steps-card">
          <mat-card-header class="steps-header">
            <div class="steps-icon"><mat-icon>how_to_reg</mat-icon></div>
            <div>
              <mat-card-title class="steps-title">Cómo autorizar en Swagger UI</mat-card-title>
              <mat-card-subtitle class="steps-sub">3 pasos para probar endpoints protegidos</mat-card-subtitle>
            </div>
          </mat-card-header>
          <mat-card-content class="steps-body">
            <div class="steps-list">
              <div class="step">
                <span class="step-num">1</span>
                <p>Copia tu JWT usando el botón <strong>Copiar mi JWT</strong> de arriba.</p>
              </div>
              <div class="step">
                <span class="step-num">2</span>
                <p>Abre Swagger UI y haz clic en <strong>Authorize</strong> (candado 🔒).</p>
              </div>
              <div class="step">
                <span class="step-num">3</span>
                <p>Pega el token en el campo <code>Bearer &lt;token&gt;</code> y confirma.</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Referencia rápida de endpoints -->
        <mat-card class="endpoints-card">
          <mat-card-header class="steps-header">
            <div class="steps-icon" style="background:rgba(25,118,210,.1)">
              <mat-icon style="color:#1976d2">route</mat-icon>
            </div>
            <div>
              <mat-card-title class="steps-title">Referencia rápida de endpoints</mat-card-title>
              <mat-card-subtitle class="steps-sub">Principales rutas de la API v1</mat-card-subtitle>
            </div>
          </mat-card-header>
          <mat-card-content class="p-0">
            <div class="endpoint-list">
              @for (ep of endpoints; track ep.path) {
                <div class="endpoint-row">
                  <span class="method-badge method-{{ ep.method.toLowerCase() }}">{{ ep.method }}</span>
                  <code class="ep-path">{{ ep.path }}</code>
                  <span class="ep-desc">{{ ep.desc }}</span>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <!-- iframe Swagger embebido -->
        <mat-card class="iframe-card">
          <mat-card-header class="steps-header">
            <div class="steps-icon" style="background:rgba(245,127,23,.1)">
              <mat-icon style="color:#F57F17">web</mat-icon>
            </div>
            <div>
              <mat-card-title class="steps-title">Swagger UI embebido</mat-card-title>
              <mat-card-subtitle class="steps-sub">
                @if (iframeError()) { Backend no disponible — usa el enlace directo }
                @else { El backend debe estar corriendo en localhost:8000 }
              </mat-card-subtitle>
            </div>
          </mat-card-header>
          <mat-card-content class="p-0">
            @if (!iframeError()) {
              <iframe
                [src]="safeSwaggerUrl"
                width="100%"
                style="height:72vh;border:0;display:block"
                title="Swagger UI — ASR Quechua API"
                (error)="iframeError.set(true)">
              </iframe>
            } @else {
              <div class="iframe-fallback">
                <mat-icon>cloud_off</mat-icon>
                <p>El servidor no está disponible en este momento.</p>
                <a [href]="swaggerUrl" target="_blank" rel="noopener" class="open-swagger-btn">
                  <mat-icon>launch</mat-icon>
                  Intentar abrir en pestaña nueva
                </a>
              </div>
            }
          </mat-card-content>
        </mat-card>

      </div>
    </div>
  `,
  styles: [`
    .docs-page { min-height: 100%; background: var(--bg-app); }

    .docs-header {
      background: linear-gradient(135deg, #0d47a1, #1976d2);
      padding: 32px 24px 40px;
    }

    .docs-header-inner {
      max-width: 1000px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .header-icon {
      width: 52px; height: 52px;
      border-radius: 16px;
      background: rgba(255,255,255,.18);
      border: 1px solid rgba(255,255,255,.25);
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 26px; width: 26px; height: 26px; color: white; }
    }

    .docs-title   { font-size: 1.6rem; font-weight: 800; color: white; margin: 0 0 4px; letter-spacing: -.5px; }
    .docs-subtitle { font-size: .88rem; color: rgba(255,255,255,.7); margin: 0; }

    .copy-btn {
      margin-left: auto !important;
      background: rgba(255,255,255,.18) !important;
      color: white !important;
      border: 1px solid rgba(255,255,255,.3) !important;
      &:hover { background: rgba(255,255,255,.28) !important; }
      mat-icon { margin-right: 6px; }
    }

    .docs-body {
      max-width: 1000px;
      margin: -20px auto 0;
      padding: 0 24px 48px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* Info grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;

      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }

    .info-card {
      background: var(--bg-surface);
      border-radius: 16px;
      padding: 20px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-card);
    }

    .info-card-head {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: .8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-muted);
      margin-bottom: 12px;

      mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--color-primary); }
    }

    .code-block {
      display: block;
      background: var(--bg-surface-2);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 10px 12px;
      font-size: .8rem;
      color: var(--color-primary);
      word-break: break-all;
      margin-bottom: 8px;
      font-family: 'Fira Code', 'Cascadia Code', monospace;
    }

    .info-hint { font-size: .78rem; color: var(--text-muted); margin: 0; line-height: 1.5; }
    .info-hint code { background: var(--bg-surface-2); padding: 1px 5px; border-radius: 4px; font-size: .76rem; }

    .open-swagger-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 12px;
      padding: 7px 14px;
      border-radius: 8px;
      background: var(--color-primary);
      color: white;
      font-size: .8rem;
      font-weight: 700;
      text-decoration: none;
      transition: opacity .2s;
      &:hover { opacity: .85; }
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
    }

    /* Steps card */
    .steps-card, .endpoints-card, .iframe-card {
      border-radius: 16px !important;
      background: var(--bg-surface) !important;
      box-shadow: var(--shadow-card) !important;
      border: 1px solid var(--border-color) !important;
      overflow: hidden;
    }

    .steps-header {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      padding: 20px 20px 14px !important;
    }

    .steps-icon {
      width: 40px; height: 40px;
      border-radius: 11px;
      background: rgba(46,125,50,.1);
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 20px; width: 20px; height: 20px; color: var(--color-primary); }
    }

    .steps-title { font-size: .95rem !important; font-weight: 700 !important; color: var(--text-primary) !important; margin: 0 !important; }
    .steps-sub   { font-size: .78rem !important; color: var(--text-muted) !important; margin: 2px 0 0 !important; }

    .steps-body { padding: 4px 20px 20px !important; }

    .steps-list { display: flex; flex-direction: column; gap: 12px; }

    .step {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .step-num {
      width: 26px; height: 26px;
      border-radius: 50%;
      background: var(--color-primary);
      color: white;
      font-size: .75rem;
      font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    .step p { font-size: .88rem; color: var(--text-secondary); margin: 3px 0 0; line-height: 1.5; }
    .step p strong { color: var(--text-primary); }
    .step p code { background: var(--bg-surface-2); padding: 1px 5px; border-radius: 4px; font-size: .8rem; }

    /* Endpoints list */
    .endpoint-list { display: flex; flex-direction: column; }

    .endpoint-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 20px;
      border-bottom: 1px solid var(--border-color);
      transition: background .15s;
      &:last-child { border-bottom: none; }
      &:hover { background: var(--bg-surface-2); }
    }

    .method-badge {
      font-size: .65rem;
      font-weight: 800;
      letter-spacing: .5px;
      padding: 3px 8px;
      border-radius: 6px;
      min-width: 52px;
      text-align: center;
      flex-shrink: 0;
    }

    .method-get    { background: rgba(25,118,210,.12); color: #1565c0; }
    .method-post   { background: rgba(46,125,50,.12);  color: #1b5e20; }
    .method-put    { background: rgba(245,127,23,.12); color: #e65100; }
    .method-patch  { background: rgba(124,77,255,.12); color: #5e35b1; }
    .method-delete { background: rgba(229,57,53,.12);  color: #b71c1c; }

    .ep-path { font-size: .78rem; color: var(--text-primary); font-family: monospace; flex-shrink: 0; }
    .ep-desc { font-size: .78rem; color: var(--text-muted); margin-left: auto; }

    /* Iframe fallback */
    .iframe-fallback {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 48px 24px;
      color: var(--text-muted);

      mat-icon { font-size: 48px; width: 48px; height: 48px; }
      p { font-size: .95rem; margin: 0; }
    }
  `],
})
export class DocsComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly authSvc   = inject(AuthService);
  private readonly snackBar  = inject(MatSnackBar);

  readonly swaggerUrl: string = env.swaggerUrl;

  readonly safeSwaggerUrl: SafeResourceUrl =
    this.sanitizer.bypassSecurityTrustResourceUrl(env.swaggerUrl);

  readonly apiBase    = `http://localhost:8000/api/v1`;
  readonly isAuth     = computed(() => this.authSvc.isAuthenticated());
  readonly iframeError = signal(false);

  readonly endpoints: EndpointDoc[] = [
    { method: 'POST',   path: '/api/v1/auth/register',          desc: 'Registrar nuevo usuario'              },
    { method: 'POST',   path: '/api/v1/auth/login',             desc: 'Iniciar sesión · devuelve JWT'        },
    { method: 'POST',   path: '/api/v1/auth/logout',            desc: 'Cerrar sesión'                        },
    { method: 'GET',    path: '/api/v1/users/profile',          desc: 'Obtener perfil del usuario'           },
    { method: 'PUT',    path: '/api/v1/users/profile',          desc: 'Actualizar perfil'                    },
    { method: 'GET',    path: '/api/v1/dashboard',              desc: 'Resumen y estado de servicios'        },
    { method: 'POST',   path: '/api/v1/transcribe',             desc: 'Subir audio y transcribir'            },
    { method: 'GET',    path: '/api/v1/transcriptions',         desc: 'Listar transcripciones paginadas'     },
    { method: 'GET',    path: '/api/v1/transcriptions/:id',     desc: 'Detalle + word confidence scores'     },
    { method: 'GET',    path: '/api/v1/transcriptions/:id/download', desc: 'Descargar TXT / JSON / SRT'     },
    { method: 'PATCH',  path: '/api/v1/transcriptions/:id',    desc: 'Renombrar audio_filename · 200 con transcripción completa' },
    { method: 'DELETE', path: '/api/v1/transcriptions/:id',    desc: '204 si elimina · 403 si no es tuya · 404 si no existe' },
  ];

  copyToken(): void {
    const token = this.authSvc.getToken();
    if (!token) return;
    navigator.clipboard.writeText(token).then(() => {
      this.snackBar.open('JWT copiado al portapapeles', 'OK', { duration: 3000 });
    });
  }
}
