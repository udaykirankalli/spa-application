import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RecordsResponse } from '../models/record.model';

@Injectable({ providedIn: 'root' })
export class RecordService {
  constructor(private readonly http: HttpClient) {}

  getRecords(delayMs = 1400): Observable<RecordsResponse> {
    const params = new HttpParams().set('delayMs', delayMs);
    return this.http.get<RecordsResponse>(`${environment.apiBaseUrl}/records`, { params });
  }
}
