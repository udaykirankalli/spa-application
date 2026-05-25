import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AppUser, UserRole } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  readonly roles: UserRole[] = ['General User', 'Admin'];
  readonly currentUser$ = this.authService.currentUser$;
  readonly delayControl = new FormControl(1000, {
    nonNullable: true,
    validators: [Validators.min(0), Validators.max(5000)]
  });
  users: AppUser[] = [];
  loadingUsers = false;
  savingUser = false;
  noticeMessage = '';
  errorMessage = '';

  readonly userForm = this.formBuilder.group({
    userId: ['', Validators.required],
    displayName: ['', Validators.required],
    department: ['Operations'],
    role: ['General User' as UserRole, Validators.required],
    password: ['', Validators.required],
    status: ['Active' as const],
    accessLevel: ['Standard application access']
  });

  constructor(
    private readonly formBuilder: NonNullableFormBuilder,
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers(this.delayControl.value);
  }

  loadUsers(delayMs: number): void {
    if (this.delayControl.invalid) {
      this.delayControl.markAsTouched();
      return;
    }

    this.loadingUsers = true;
    this.errorMessage = '';
    this.userService
      .getUsers(delayMs)
      .pipe(finalize(() => (this.loadingUsers = false)))
      .subscribe({
        next: (response) => (this.users = response.users),
        error: (error) => (this.errorMessage = error?.error?.message ?? 'Users could not be loaded.')
      });
  }

  createUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.savingUser = true;
    this.errorMessage = '';
    this.noticeMessage = '';
    this.userService
      .createUser(this.userForm.getRawValue())
      .pipe(finalize(() => (this.savingUser = false)))
      .subscribe({
        next: (response) => {
          this.users = [...this.users, response.user];
          this.noticeMessage = `${response.user.displayName} was added successfully.`;
          this.userForm.reset({
            userId: '',
            displayName: '',
            department: 'Operations',
            role: 'General User',
            password: '',
            status: 'Active',
            accessLevel: 'Standard application access'
          });
        },
        error: (error) => (this.errorMessage = error?.error?.message ?? 'User could not be created.')
      });
  }

  changeRole(user: AppUser): void {
    const nextRole: UserRole = user.role === 'Admin' ? 'General User' : 'Admin';
    this.patchUser(user, { role: nextRole });
  }

  changeStatus(user: AppUser): void {
    this.patchUser(user, { status: user.status === 'Active' ? 'Disabled' : 'Active' });
  }

  deleteUser(user: AppUser): void {
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.users = this.users.filter((entry) => entry.id !== user.id);
        this.noticeMessage = `${user.displayName} was removed.`;
      },
      error: (error) => (this.errorMessage = error?.error?.message ?? 'User could not be deleted.')
    });
  }

  private patchUser(user: AppUser, change: Partial<AppUser>): void {
    this.userService.updateUser(user.id, change).subscribe({
      next: (response) => {
        this.users = this.users.map((entry) => (entry.id === user.id ? response.user : entry));
        this.noticeMessage = `${response.user.displayName} was updated.`;
      },
      error: (error) => (this.errorMessage = error?.error?.message ?? 'User could not be updated.')
    });
  }
}
