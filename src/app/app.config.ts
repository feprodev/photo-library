import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { API_LATENCY_MS, latencyInterceptor } from './core/latency-interceptor';
import { API_URL } from './core/photo-api';
import { providePicsumImageLoader } from './core/picsum-image-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([latencyInterceptor])),
    { provide: API_URL, useValue: environment.apiUrl },
    { provide: API_LATENCY_MS, useValue: environment.apiLatencyMs },
    providePicsumImageLoader(environment.imageCdnUrl),
    { provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-symbols-outlined' } },
  ],
};
