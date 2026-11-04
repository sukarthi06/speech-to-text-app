import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { AuthService } from '../../services/auth-service';
import { Footer } from '../../layout/footer/footer';
import { Header } from '../../layout/header/header';

type LoginStatus = 'idle' | 'submitting' | 'error';

@Component({
  selector: 'app-login',
  imports: [FormRoot, FormField, Header, Footer],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly status = signal<LoginStatus>('idle');
  private readonly model = signal({ email: '', password: '' });

  protected readonly loginForm = form(
    this.model,
    (path) => {
      required(path.email);
      email(path.email);
      required(path.password);
    },
    {
      submission: {
        action: async () => {
          this.status.set('submitting');
          try {
            await this.auth.login(this.model());
            await this.router.navigate(['/profile']);
          } catch {
            this.status.set('error');
          }
        },
      },
    }
  );
}