import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Photo } from '../../core/photo';
import { PhotoFeedStore } from './photo-feed-store';
import { PhotosPage } from './photos-page';

const photos: Photo[] = [
  { id: '1', author: 'Alejandro Escamilla', width: 5000, height: 3333 },
  { id: '2', author: 'Paul Jarvis', width: 2500, height: 1667 },
];

describe('PhotosPage', () => {
  let feed: { photos: ReturnType<typeof signal<Photo[]>>; loadMore: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    feed = { photos: signal<Photo[]>([]), loadMore: vi.fn() };
    TestBed.configureTestingModule({
      providers: [{ provide: PhotoFeedStore, useValue: feed }],
    });
  });

  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(PhotosPage);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('loads the first page when the feed is empty', async () => {
    await render();

    expect(feed.loadMore).toHaveBeenCalledOnce();
  });

  it('keeps the already loaded feed', async () => {
    feed.photos.set(photos);

    const element = await render();

    expect(feed.loadMore).not.toHaveBeenCalled();
    expect(element.querySelectorAll('app-photo-grid img')).toHaveLength(2);
  });
});
