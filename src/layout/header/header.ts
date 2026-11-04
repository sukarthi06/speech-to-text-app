import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-header',
  template: `
    <span class="brand">AI Medical Scribe</span>
    @if (auth.isAuthenticated()) {
      <button type="button" class="btn btn-outline-secondary btn-sm" (click)="logout()">Log out</button>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './header.css',
})
export class Header {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigate(['/login']);
  }
}