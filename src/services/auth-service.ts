import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthResponse, LoginRequest } from '../types/auth-type';
import { User } from '../types/user-type';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private readonly token = signal<string | null>(null);
  private refreshInFlight: Promise<boolean> | null = null;

  readonly user = signal<User | null>(null);

  readonly accessToken = this.token.asReadonly();
  readonly isAuthenticated = computed(() => this.token() !== null);

  async login(request: LoginRequest): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/login`, request, { withCredentials: true })
    );
    this.token.set(response.accessToken);
  }
  
  refresh(): Promise<boolean> {
    this.refreshInFlight ??= this.requestRefresh().finally(() => (this.refreshInFlight = null));
    return this.refreshInFlight;
  }

  private async requestRefresh(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/refresh`, null, { withCredentials: true })
      );
      this.token.set(response.accessToken);
      return true;
    } catch {
      this.token.set(null);
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${this.baseUrl}/api/auth/logout`, null, { withCredentials: true })
      );
    } catch {
      // Ignore: the local session is cleared below regardless.
    } finally {
      this.token.set(null);
    }
  }
}