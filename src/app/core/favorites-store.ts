import { computed, effect, ErrorHandler, inject, Service, signal } from '@angular/core';
import { Photo } from './photo';
import { STORAGE } from './storage';

export const FAVORITES_STORAGE_KEY = 'photo-library:favorites:v1';

function isPhoto(value: unknown): value is Photo {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const { id, author, width, height } = value as Record<string, unknown>;
  return (
    typeof id === 'string' &&
    typeof author === 'string' &&
    typeof width === 'number' &&
    typeof height === 'number'
  );
}

@Service()
export class FavoritesStore {
  private readonly storage = inject(STORAGE);
  private readonly errorHandler = inject(ErrorHandler);

  private readonly state = signal<Photo[]>(this.read());
  private readonly ids = computed(() => new Set(this.state().map((photo) => photo.id)));

  readonly favorites = this.state.asReadonly();
  readonly count = computed(() => this.state().length);

  constructor() {
    effect(() => this.write(this.state()));
  }

  isFavorite(id: string): boolean {
    return this.ids().has(id);
  }

  add(photo: Photo): void {
    if (!this.isFavorite(photo.id)) {
      this.state.update((photos) => [...photos, photo]);
    }
  }

  remove(id: string): void {
    if (this.isFavorite(id)) {
      this.state.update((photos) => photos.filter((photo) => photo.id !== id));
    }
  }

  private read(): Photo[] {
    try {
      const parsed: unknown = JSON.parse(this.storage.getItem(FAVORITES_STORAGE_KEY) ?? '[]');
      return Array.isArray(parsed) ? parsed.filter(isPhoto) : [];
    } catch {
      return [];
    }
  }

  private write(photos: Photo[]): void {
    try {
      this.storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(photos));
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }
}
