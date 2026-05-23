import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class StartupService {
  constructor(private readonly authService: AuthService) {}

  async loadSession(): Promise<void> {
    const sessionRequest = this.authService.restoreSession();
    if (!sessionRequest) {
      return;
    }

    try {
      await firstValueFrom(sessionRequest);
    } catch {
      this.authService.clearSession();
    }
  }
}
