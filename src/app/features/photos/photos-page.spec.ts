import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { DebugElement, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatProgressSpinnerHarness } from '@angular/material/progress-spinner/testing';
import { By } from '@angular/platform-browser';
import { Photo } from '../../core/photo';
import { InfiniteScroll } from '../../shared/infinite-scroll/infinite-scroll';
import { PhotoFeedStore } from './photo-feed-store';
import { PhotosPage } from './photos-page';

const photos: Photo[] = [
  { id: '1', author: 'Alejandro Escamilla', width: 5000, height: 3333 },
  { id: '2', author: 'Paul Jarvis', width: 2500, height: 1667 },
];

function createFeed() {
  return {
    photos: signal<Photo[]>([]),
    loading: signal(false),
    error: signal(false),
    hasMore: signal(true),
    loadMore: vi.fn(),
    retry: vi.fn(),
  };
}

describe('PhotosPage', () => {
  let feed: ReturnType<typeof createFeed>;

  beforeEach(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn();
        disconnect = vi.fn();
      },
    );
    feed = createFeed();
    TestBed.configureTestingModule({
      providers: [{ provide: PhotoFeedStore, useValue: feed }],
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function render(): Promise<ComponentFixture<PhotosPage>> {
    const fixture = TestBed.createComponent(PhotosPage);
    await fixture.whenStable();
    return fixture;
  }

  function sentinel(fixture: ComponentFixture<PhotosPage>): DebugElement | null {
    return fixture.debugElement.query(By.directive(InfiniteScroll));
  }

  it('loads the first page when the feed is empty', async () => {
    await render();

    expect(feed.loadMore).toHaveBeenCalledOnce();
  });

  it('keeps the already loaded feed', async () => {
    feed.photos.set(photos);

    const fixture = await render();

    expect(feed.loadMore).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelectorAll('app-photo-grid img')).toHaveLength(2);
  });

  it('loads the next page when the end of the feed comes into view', async () => {
    feed.photos.set(photos);
    const fixture = await render();

    sentinel(fixture)!.triggerEventHandler('scrolled');

    expect(feed.loadMore).toHaveBeenCalledOnce();
  });

  it('shows the spinner and pauses the sentinel while a page is loading', async () => {
    feed.loading.set(true);
    const fixture = await render();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const disabled = () => sentinel(fixture)!.injector.get(InfiniteScroll).disabled();

    expect(await loader.hasHarness(MatProgressSpinnerHarness)).toBe(true);
    expect(disabled()).toBe(true);

    feed.loading.set(false);
    await fixture.whenStable();

    expect(await loader.hasHarness(MatProgressSpinnerHarness)).toBe(false);
    expect(disabled()).toBe(false);
  });

  it('tells when the whole feed is loaded', async () => {
    feed.photos.set(photos);
    feed.hasMore.set(false);

    const fixture = await render();

    expect(sentinel(fixture)).toBeNull();
    expect(fixture.nativeElement.querySelector('.end').textContent).toBe("That's all");
  });

  it('offers to retry when a page fails to load', async () => {
    feed.photos.set(photos);
    feed.error.set(true);
    const fixture = await render();
    const retry = await TestbedHarnessEnvironment.loader(fixture).getHarness(
      MatButtonHarness.with({ text: 'Retry' }),
    );

    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      "Couldn't load photos",
    );
    expect(sentinel(fixture)).toBeNull();

    await retry.click();

    expect(feed.retry).toHaveBeenCalledOnce();
  });
});
