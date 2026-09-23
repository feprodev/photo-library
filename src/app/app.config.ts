import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { API_LATENCY_MS, latencyInterceptor } from './core/latency-interceptor';
import { providePicsumImageLoader } from './core/picsum-image-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([latencyInterceptor])),
    { provide: API_LATENCY_MS, useValue: environment.apiLatencyMs },
    providePicsumImageLoader(environment.imageCdnUrl),
  ],
};
