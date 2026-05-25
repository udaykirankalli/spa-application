import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
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
  readonly delayControl = new FormControl(1500, {
    nonNullable: true,
    validators: [Validators.min(0), Validators.max(5000)]
  });
  records: WorkRecord[] = [];
  accessNote = '';
  loadingRecords = false;
  errorMessage = '';

  constructor(private readonly authService: AuthService, private readonly recordService: RecordService) {}

  ngOnInit(): void {
    this.loadRecords(this.delayControl.value);
  }

  get totalAmount(): number {
    return this.records.reduce((sum, record) => sum + record.amount, 0);
  }

  loadRecords(delayMs: number): void {
    if (this.delayControl.invalid) {
      this.delayControl.markAsTouched();
      return;
    }

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
