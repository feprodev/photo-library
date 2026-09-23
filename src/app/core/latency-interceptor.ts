import { HttpInterceptorFn } from '@angular/common/http';
import { inject, InjectionToken } from '@angular/core';
import { delay } from 'rxjs';

export interface LatencyRange {
  readonly min: number;
  readonly max: number;
}

export const API_LATENCY_MS = new InjectionToken<LatencyRange>('API_LATENCY_MS');

export function randomLatency({ min, max }: LatencyRange): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export const latencyInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(delay(randomLatency(inject(API_LATENCY_MS))));
