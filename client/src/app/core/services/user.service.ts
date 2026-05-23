import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppUser, CreateUserRequest, UpdateUserRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private readonly http: HttpClient) {}

  getUsers(delayMs = 900): Observable<{ users: AppUser[] }> {
    const params = new HttpParams().set('delayMs', delayMs);
    return this.http.get<{ users: AppUser[] }>(`${environment.apiBaseUrl}/users`, { params });
  }

  createUser(request: CreateUserRequest): Observable<{ user: AppUser }> {
    return this.http.post<{ user: AppUser }>(`${environment.apiBaseUrl}/users`, request);
  }

  updateUser(userId: string, request: UpdateUserRequest): Observable<{ user: AppUser }> {
    return this.http.patch<{ user: AppUser }>(`${environment.apiBaseUrl}/users/${userId}`, request);
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiBaseUrl}/users/${userId}`);
  }
}
