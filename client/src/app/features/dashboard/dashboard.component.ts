import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { WorkRecord } from '../../core/models/record.model';
import { AuthService } from '../../core/services/auth.service';
import { RecordService } from '../../core/services/record.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  readonly currentUser$ = this.authService.currentUser$;
  records: WorkRecord[] = [];
  accessNote = '';
  loadingRecords = false;
  errorMessage = '';

  constructor(private readonly authService: AuthService, private readonly recordService: RecordService) {}

  ngOnInit(): void {
    this.loadRecords(1500);
  }

  get totalAmount(): number {
    return this.records.reduce((sum, record) => sum + record.amount, 0);
  }

  loadRecords(delayMs: number): void {
    this.loadingRecords = true;
    this.errorMessage = '';
    this.recordService
      .getRecords(delayMs)
      .pipe(finalize(() => (this.loadingRecords = false)))
      .subscribe({
        next: (response) => {
          this.records = response.records;
          this.accessNote = response.accessNote;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message ?? 'Records could not be loaded.';
        }
      });
  }
}
