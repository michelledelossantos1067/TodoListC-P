import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { AppModule } from './app/app.module';
import { provideRouter, RouterModule } from '@angular/router';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent,{
  providers: [
    importProvidersFrom(
      BrowserModule,
      AppModule,
      RouterModule
    ),
    provideRouter(routes)
  ]
}).catch((err) => console.error(err));
