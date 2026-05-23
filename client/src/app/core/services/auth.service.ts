import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppUser } from '../models/user.model';
import { LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenStorageKey = 'role_access_token';
  private readonly currentUserSubject = new BehaviorSubject<AppUser | null>(null);

  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  get token(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  get currentUser(): AppUser | null {
    return this.currentUserSubject.value;
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    const params = new HttpParams().set('delayMs', request.delayMs);
    const body = {
      userId: request.userId.trim(),
      password: request.password,
      role: request.role
    };

    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, body, { params }).pipe(
      tap((response) => {
        localStorage.setItem(this.tokenStorageKey, response.token);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  restoreSession(): Observable<{ user: AppUser }> | null {
    if (!this.token) {
      this.currentUserSubject.next(null);
      return null;
    }

    return this.http.get<{ user: AppUser }>(`${environment.apiBaseUrl}/auth/me`).pipe(
      tap({
        next: (response) => this.currentUserSubject.next(response.user),
        error: () => this.clearSession()
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${environment.apiBaseUrl}/auth/logout`, {}).pipe(
      tap(() => this.clearSession())
    );
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenStorageKey);
    this.currentUserSubject.next(null);
  }
}
