import { InjectionToken } from '@angular/core';

export const STORAGE = new InjectionToken<Storage>('STORAGE', {
  providedIn: 'root',
  factory: () => localStorage,
});
