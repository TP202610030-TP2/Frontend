import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from '../../core/services/auth.service';

const NAV_ITEMS = [
  { label: 'Dashboard',     icon: 'dashboard',   route: '/app/dashboard'  },
  { label: 'Subir archivo', icon: 'upload_file',  route: '/app/upload'     },
  { label: 'Streaming',     icon: 'mic',          route: '/app/streaming'  },
  { label: 'API Docs',      icon: 'api',          route: '/app/docs'       },
  { label: 'Historial',     icon: 'history',      route: '/app/history'    },
  { label: 'Configuración', icon: 'settings',     route: '/app/settings'   },
] as const;

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    NavbarComponent,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  readonly navItems = NAV_ITEMS;

  private readonly bp      = inject(BreakpointObserver);
  private readonly authSvc = inject(AuthService);

  isMobile = toSignal(
    this.bp.observe(Breakpoints.Handset).pipe(map(r => r.matches)),
    { initialValue: false },
  );

  userName  = computed(() => {
    const user = this.authSvc.currentUser();
    return user?.full_name || user?.email?.split('@')[0] || 'Usuario';
  });

  userEmail = computed(() => this.authSvc.currentUser()?.email ?? '');
}
