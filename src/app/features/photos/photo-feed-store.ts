import { computed, inject, Service, signal } from '@angular/core';
import { Photo } from '../../core/photo';
import { PAGE_SIZE, PhotoApi } from '../../core/photo-api';

interface FeedState {
  readonly photos: Photo[];
  readonly nextPage: number;
  readonly loading: boolean;
  readonly error: boolean;
  readonly hasMore: boolean;
}

const initialState: FeedState = {
  photos: [],
  nextPage: 1,
  loading: false,
  error: false,
  hasMore: true,
};

@Service()
export class PhotoFeedStore {
  private readonly api = inject(PhotoApi);
  private readonly state = signal(initialState);

  readonly photos = computed(() => this.state().photos);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly hasMore = computed(() => this.state().hasMore);

  loadMore(): void {
    const { loading, error, hasMore } = this.state();
    if (!loading && !error && hasMore) {
      this.load();
    }
  }

  retry(): void {
    if (this.state().error) {
      this.load();
    }
  }

  private load(): void {
    const page = this.state().nextPage;
    this.state.update((state) => ({ ...state, loading: true, error: false }));
    this.api.getPage(page, PAGE_SIZE).subscribe({
      next: (photos) =>
        this.state.update((state) => ({
          ...state,
          photos: [...state.photos, ...photos],
          nextPage: page + 1,
          loading: false,
          hasMore: photos.length === PAGE_SIZE,
        })),
      error: () => this.state.update((state) => ({ ...state, loading: false, error: true })),
    });
  }
}
