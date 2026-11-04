# ASR Quechua — Frontend

Aplicación Angular 18 para transcripción automática de voz en idioma quechua. Permite subir archivos de audio, transcribir en tiempo real mediante streaming, gestionar el historial de transcripciones y explorar la API REST embebida.

---

## Tabla de contenidos

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Levantar la app](#levantar-la-app)
- [Scripts disponibles](#scripts-disponibles)
- [Variables de entorno](#variables-de-entorno)
- [Arquitectura](#arquitectura)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Rutas](#rutas)
- [API y endpoints](#api-y-endpoints)
- [Autenticación](#autenticación)
- [Testing](#testing)
- [Tests E2E con Cypress](#tests-e2e-con-cypress)
- [Stack tecnológico](#stack-tecnológico)

---

## Requisitos

| Herramienta | Versión mínima | Obligatorio |
|-------------|----------------|-------------|
| Node.js     | 20.x           | Sí |
| pnpm        | 11.x           | Sí |
| Angular CLI | 18.x           | Sí |
| Backend ASR | corriendo en `:8000` | Solo para funcionalidad completa |

---

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd Frontend/asr-quechua-frontend

# Instalar dependencias (incluye Cypress)
pnpm install
```

---

## Levantar la app

### Solo el frontend (sin backend)

Si solo querés explorar la UI, revisar rutas o trabajar en componentes sin necesitar el backend:

```bash
pnpm start
```

La app carga en `http://localhost:4200`. Las rutas públicas (`/` y `/auth/*`) funcionan completamente. Las rutas protegidas (`/app/*`) redirigen a `/auth/login` porque no hay token JWT.

Para saltar el guard y ver una vista protegida directamente, podés poner un token falso en la consola del browser y recargar:

```javascript
// En la consola del browser (F12)
// Genera un JWT de prueba con exp a futuro (no valida firma, solo desbloquea el guard)
const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
const payload = btoa(JSON.stringify({ user_id: 'dev', email: 'dev@local.com', exp: Math.floor(Date.now()/1000) + 86400 }));
localStorage.setItem('asr_token', `${header}.${payload}.fake-signature`);
location.reload();
```

Las peticiones al backend fallarán con error de red (capturado por el `errorInterceptor`), pero podés navegar y ver la estructura de cada vista.

### Desarrollo (con backend)

```bash
pnpm start
```

Abre `http://localhost:4200`. Todas las peticiones a `/api/*` y las conexiones WebSocket a `/ws/*` se redirigen automáticamente al backend en `http://localhost:8000` mediante `proxy.conf.json`.

### Build de producción

```bash
pnpm build
# Output en: dist/asr-quechua-frontend/browser/
```

Servir el build con cualquier servidor estático:

```bash
npx serve dist/asr-quechua-frontend/browser
```

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm start` | Servidor de desarrollo con live reload y proxy al backend |
| `pnpm build` | Build de producción optimizado con tree-shaking y lazy loading |
| `pnpm test` | Ejecuta todos los tests unitarios con Jest |
| `pnpm test:watch` | Tests en modo watch (re-ejecuta al guardar) |
| `pnpm test:coverage` | Tests con reporte de cobertura de código |
| `pnpm e2e` | Tests E2E con Cypress en modo headless (requiere backend + frontend corriendo) |
| `pnpm e2e:open` | Abre Cypress UI interactivo para depurar tests |
| `pnpm lint` | Linter con ESLint + @angular-eslint |

---

## Variables de entorno

Los archivos de entorno están en `src/environments/`:

| Variable | Desarrollo | Producción |
|----------|-----------|-----------|
| `apiUrl` | `http://localhost:8000` | URL de Azure Container Apps |
| `wsUrl` | `ws://localhost:8000` | `wss://...` |
| `swaggerUrl` | `http://localhost:8000/docs` | `/docs` |
| `appVersion` | `1.0.0-dev` | `1.0.0` |

Para producción editar `src/environments/environment.production.ts` con las URLs reales antes de ejecutar `pnpm build`.

---

## Arquitectura

El frontend usa **Feature-based architecture** — el código se organiza por _feature_ (vista o dominio funcional), no por tipo técnico. Cada feature es autocontenida y se carga con lazy loading por ruta.

### Las cuatro capas

```
src/app/
├── core/       # Singletons globales: services, guards, interceptors, models, API registry
├── features/   # Una carpeta por vista/feature, lazy loaded
├── shared/     # Componentes y pipes reutilizables sin lógica de negocio
└── layout/     # AppShell (sidenav + navbar + router-outlet)
```

### Vistas (features)

| Feature | Ruta | Descripción |
|---------|------|-------------|
| `landing` | `/` | Página pública estática |
| `auth` | `/auth/*` | Login · Register · ForgotPassword · ResetPassword |
| `dashboard` | `/app/dashboard` | Stats · ServiceStatus · QuickActions |
| `upload` | `/app/upload` | Drag & drop · transcripción · descarga |
| `streaming` | `/app/streaming` | WebSocket + MediaRecorder en tiempo real |
| `history` | `/app/history` | Lista paginada y detalle con word confidence |
| `settings` | `/app/settings` | Perfil · seguridad · preferencias · sesión |
| `docs` | `/app/docs` | Swagger UI embebido |

### Dentro de cada feature

```
feature/
├── components/        # Componentes presentacionales (reciben @Input, emiten @Output)
├── feature.component  # Componente contenedor (inyecta servicios, gestiona señales)
└── feature.routes     # Sub-rutas lazy (solo en auth)
```

### `core/` — capa de infraestructura

| Subcarpeta | Responsabilidad |
|-----------|----------------|
| `core/services/` | Servicios singleton `providedIn: 'root'` |
| `core/models/` | Interfaces TypeScript que reflejan el contrato exacto del backend |
| `core/interceptors/` | `authInterceptor` (adjunta JWT), `errorInterceptor` (401/403/500) |
| `core/guards/` | `authGuard` (requiere sesión válida), `publicGuard` (redirige si ya hay sesión) |
| `core/api/endpoints.registry.ts` | Punto único de verdad para URLs y timeouts de todos los endpoints |

### Estado reactivo

Se usan **Angular Signals** (`signal()`, `computed()`, `effect()`) para todo el estado local. No hay NgRx ni BehaviorSubject. Los servicios exponen señales de solo lectura (`.asReadonly()`); los componentes las consumen sin mutar estado externo.

### Comunicación con el backend

- **REST:** `HttpClient` con interceptores funcionales (`HttpInterceptorFn`)
- **WebSocket:** API nativa del browser + `MediaRecorder` para captura de micrófono
- **JWT:** almacenado en `localStorage['asr_token']`, adjuntado automáticamente por `authInterceptor`

---

## Estructura de carpetas

```
src/
├── app/
│   ├── app.component.ts
│   ├── app.config.ts            # Providers globales + AppTitleStrategy
│   ├── app.routes.ts            # Rutas raíz con lazy loading
│   │
│   ├── core/
│   │   ├── api/
│   │   │   └── endpoints.registry.ts    # Contrato frontend ↔ backend
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── public.guard.ts
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts      # Adjunta Authorization: Bearer <token>
│   │   │   └── error.interceptor.ts     # 401 → logout; 403/500 → snackbar
│   │   ├── models/                      # Interfaces del backend (sin clases)
│   │   │   ├── auth.models.ts
│   │   │   ├── user.models.ts
│   │   │   ├── transcription.models.ts
│   │   │   ├── dashboard.models.ts
│   │   │   ├── websocket.models.ts
│   │   │   └── api-envelope.model.ts
│   │   └── services/
│   │       ├── auth.service.ts
│   │       ├── audio-upload.service.ts
│   │       ├── dashboard.service.ts
│   │       ├── streaming.service.ts     # WebSocket + MediaRecorder
│   │       ├── theme.service.ts         # Dark mode + localStorage
│   │       ├── transcription.service.ts
│   │       └── user.service.ts
│   │
│   ├── features/
│   │   ├── auth/                        # Login · Register · ForgotPassword · ResetPassword
│   │   ├── dashboard/                   # StatsCard · ServiceStatusList · QuickActions
│   │   ├── docs/                        # Swagger UI embebido + copiado de token
│   │   ├── history/
│   │   │   ├── components/
│   │   │   │   ├── transcription-card/
│   │   │   │   └── word-confidence-table/
│   │   │   ├── history-list/
│   │   │   └── history-detail/
│   │   ├── landing/
│   │   ├── settings/
│   │   │   └── components/
│   │   │       ├── profile-form/        # Formulario reactivo con MatDatepicker
│   │   │       ├── security-section/    # Cambio de contraseña vía enlace
│   │   │       ├── preferences-section/ # Dark mode + selector de idioma
│   │   │       └── session-info/        # Email · expiry · logout
│   │   ├── streaming/
│   │   │   └── components/
│   │   │       ├── waveform-canvas/     # AudioContext + AnalyserNode + canvas
│   │   │       ├── transcript-panel/    # Texto parcial (gris) y final (negro)
│   │   │       └── stream-controls/     # Idle · Connecting · Live (timer) · Processing
│   │   └── upload/
│   │       └── components/
│   │           ├── audio-dropzone/      # Drag & drop + validación extensión/tamaño
│   │           ├── upload-progress/     # Spinner + mensajes rotativos cada 8s
│   │           ├── transcription-result/# Textarea readonly en Noto Sans + copiar
│   │           └── download-buttons/    # Descarga TXT · JSON · SRT
│   │
│   ├── layout/
│   │   └── app-shell/                   # Sidenav responsive + Navbar con avatar
│   │       └── components/navbar/
│   │
│   └── shared/
│       ├── components/
│       │   ├── confirm-dialog/          # MatDialog de confirmación reutilizable
│       │   ├── confidence-chip/         # Chip verde/amarillo/rojo por nivel
│       │   ├── empty-state/             # Estado vacío con ícono y CTA opcional
│       │   ├── error-banner/            # Banner de error con role="alert"
│       │   ├── loading-skeleton/        # Skeleton animado: card · list-item · text-block
│       │   └── status-badge/            # Badge healthy/unhealthy/unknown con aria-label
│       ├── pipes/
│       │   ├── relative-time.pipe.ts    # "hace 5 min", "ayer", "hace 3 días"
│       │   └── confidence-label.pipe.ts # 0.92 → "92%" (para aria-label)
│       └── validators/
│           └── password-match.validator.ts
│
├── environments/
│   ├── environment.ts
│   └── environment.production.ts
└── styles/
    ├── styles.scss
    ├── _theme.scss          # Paleta Material: primary #2E7D32 · accent #F57F17
    └── _typography.scss
```

---

## Rutas

| Ruta | Componente | Guard |
|------|-----------|-------|
| `/` | `LandingComponent` | `publicGuard` |
| `/auth/login` | `LoginComponent` | `publicGuard` |
| `/auth/register` | `RegisterComponent` | `publicGuard` |
| `/auth/forgot-password` | `ForgotPasswordComponent` | `publicGuard` |
| `/auth/reset-password?token=...` | `ResetPasswordComponent` | `publicGuard` |
| `/app/dashboard` | `DashboardComponent` | `authGuard` |
| `/app/upload` | `UploadComponent` | `authGuard` |
| `/app/streaming` | `StreamingComponent` | `authGuard` |
| `/app/history` | `HistoryListComponent` | `authGuard` |
| `/app/history/:id` | `HistoryDetailComponent` | `authGuard` |
| `/app/docs` | `DocsComponent` | `authGuard` |
| `/app/settings` | `SettingsComponent` | `authGuard` |
| `/**` | — | redirige a `/` |

Todas las rutas bajo `/app` usan lazy loading y están protegidas por `authGuard`, que verifica que exista un JWT válido (no expirado) en `localStorage['asr_token']`.

---

## API y endpoints

Todos los endpoints están centralizados en `src/app/core/api/endpoints.registry.ts`. El API Gateway corre en `:8000` y en desarrollo el proxy de Angular lo reescribe transparentemente.

| Método | Endpoint | Descripción | Timeout |
|--------|----------|-------------|---------|
| `POST` | `/api/v1/auth/register` | Registro de usuario | 30s |
| `POST` | `/api/v1/auth/login` | Login → `{ token, user }` | 30s |
| `POST` | `/api/v1/auth/logout` | Invalida sesión | 10s |
| `POST` | `/api/v1/auth/password-recovery` | Solicita enlace de recuperación | 10s |
| `POST` | `/api/v1/auth/password-reset` | Restablece contraseña con token | 10s |
| `POST` | `/api/v1/transcribe` | Sube audio y transcribe | **5 min** |
| `GET`  | `/api/v1/transcriptions` | Lista paginada (`?page=&page_size=`) | 15s |
| `GET`  | `/api/v1/transcriptions/:id` | Detalle con `confidence_scores` | 15s |
| `GET`  | `/api/v1/transcriptions/:id/download` | Descarga en `txt`, `json` o `srt` | 30s |
| `DELETE` | `/api/v1/transcriptions/:id` | Elimina transcripción | 15s |
| `GET`  | `/api/v1/dashboard` | Datos del dashboard (`ApiEnvelope<T>`) | 15s |
| `GET`  | `/api/v1/users/profile` | Perfil del usuario autenticado | 15s |
| `PUT`  | `/api/v1/users/profile` | Actualiza perfil | 15s |
| `PUT`  | `/api/v1/users/change-password` | Cambia contraseña | 15s |
| `WS`   | `/ws/stream?token=<jwt>` | Streaming de audio en tiempo real | — |

> **Importante:** Solo `/api/v1/dashboard` devuelve `ApiEnvelope<DashboardData>` (`{ status, data, timestamp }`). El resto de endpoints devuelve el cuerpo directamente.

---

## Autenticación

- El token **JWT HS256** se almacena en `localStorage['asr_token']`.
- El payload contiene `user_id`, `email` y `exp` (Unix timestamp). El campo es `user_id`, **no** `sub`.
- `authInterceptor` adjunta automáticamente `Authorization: Bearer <token>` a todas las peticiones salientes.
- `errorInterceptor` captura `401` → limpia sesión y redirige a `/auth/login`.
- El WebSocket de streaming recibe el token como query param: `WS /ws/stream?token=<jwt>` (los headers HTTP no están disponibles en la API WebSocket nativa del browser).

---

## Testing

### Ejecutar todos los tests

```bash
pnpm test
```

### Con reporte de cobertura

```bash
pnpm test:coverage
```

**Cobertura actual:** 82.87% lines · 81.18% statements (umbral mínimo: 80%).

### Convenciones

- `provideNoopAnimations()` en **todos** los specs que usen Angular Material (evita el error `@transitionMessages`).
- Los signals de servicio se mockean directamente con `signal()` de `@angular/core`:

```typescript
const uploadSvc = {
  uploadState:  signal<UploadState>('idle'),
  uploadResult: signal<TranscribeResponse | null>(null),
  errorMessage: signal(''),
  uploadAudio:  jest.fn(),
};
```

- No se usa `HttpClientTestingModule`; las peticiones HTTP se prueban mockeando los métodos del servicio directamente.
- `WaveformCanvas` y `AudioContext` se omiten en tests con el guard `typeof AudioContext !== 'undefined'`.

---

## Tests E2E con Cypress

### Prerequisitos

1. Backend corriendo en `http://localhost:8000`
2. Frontend corriendo en `http://localhost:4200` (`pnpm start` en otra terminal)

### Configurar credenciales de prueba

Crear `cypress.env.json` en la raíz del proyecto (no incluir en el repositorio):

```json
{
  "testEmail": "usuario@example.com",
  "testPassword": "Contraseña123"
}
```

### Ejecutar

```bash
# Headless (CI/CD)
pnpm e2e

# Modo interactivo
pnpm e2e:open
```

### Suites disponibles

| Archivo | Escenarios cubiertos | HU |
|---------|--------------------|----|
| `cypress/e2e/landing.cy.ts` | Carga landing, CTA a registro | — |
| `cypress/e2e/auth.cy.ts` | Registro → login → dashboard; error de credenciales; logout | E1-HU01, 02, 05 |
| `cypress/e2e/upload.cy.ts` | Upload WAV válido; extensión inválida rechazada; botón TXT | E2-HU01, 04, 06 |
| `cypress/e2e/history.cy.ts` | Lista o estado vacío; navega al detalle; descarga JSON | E2-HU05, 06 |
| `cypress/e2e/settings.cy.ts` | Perfil precargado; actualizar nombre | E1-HU03 |
| `cypress/e2e/recovery.cy.ts` | Forgot password → mensaje genérico (seguridad por oscuridad) | E1-HU04 |
| `cypress/e2e/docs.cy.ts` | iframe Swagger existe; botón copiar token; panel "v1" | E3-HU02, 03, 06 |

---

## Stack tecnológico

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| Framework | Angular | 18.2 |
| UI Components | Angular Material (MDC/M3) | 18.2 |
| Estilos utilitarios | TailwindCSS | 3.4.19 |
| Estado reactivo | Angular Signals | built-in |
| HTTP | Angular HttpClient + interceptores funcionales | built-in |
| Formularios | Angular Reactive Forms | built-in |
| WebSocket / audio | WebSocket API + MediaRecorder API | browser |
| Package manager | pnpm | 11.x |
| Tests unitarios | Jest + jest-preset-angular | 29 / 14 |
| Tests E2E | Cypress | 15.x |
| Linter | ESLint + @angular-eslint | angular-cli |

### Tema Angular Material

| Token | Valor |
|-------|-------|
| Primary | `#2E7D32` (verde Material 800) |
| Accent | `#F57F17` (ámbar Material 800) |
| Warn | rojo Material por defecto |
| Dark mode | clase `dark` en `<html>`, gestionada por `ThemeService`, persiste en `localStorage['theme']` |
