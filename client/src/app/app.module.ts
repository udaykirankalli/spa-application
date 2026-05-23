import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthTokenInterceptor } from './core/services/auth-token.interceptor';
import { StartupService } from './core/services/startup.service';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AdminComponent } from './features/admin/admin.component';

export function loadApplicationSession(startupService: StartupService): () => Promise<void> {
  return () => startupService.loadSession();
}

@NgModule({
  declarations: [AppComponent, LoginComponent, DashboardComponent, AdminComponent],
  imports: [BrowserModule, HttpClientModule, ReactiveFormsModule, AppRoutingModule],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: loadApplicationSession,
      deps: [StartupService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthTokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
