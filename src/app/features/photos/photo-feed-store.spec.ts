import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { Photo } from '../../core/photo';
import { PAGE_SIZE, PhotoApi } from '../../core/photo-api';
import { PhotoFeedStore } from './photo-feed-store';

const photo = (id: number): Photo => ({
  id: String(id),
  author: `Author ${id}`,
  width: 400,
  height: 600,
});

const page = (firstId: number, size = PAGE_SIZE): Photo[] =>
  Array.from({ length: size }, (_, index) => photo(firstId + index));

describe('PhotoFeedStore', () => {
  let store: PhotoFeedStore;
  let requests: Subject<Photo[]>[];
  let getPage: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    requests = [];
    getPage = vi.fn(() => {
      const request = new Subject<Photo[]>();
      requests.push(request);
      return request;
    });
    TestBed.configureTestingModule({ providers: [{ provide: PhotoApi, useValue: { getPage } }] });
    store = TestBed.inject(PhotoFeedStore);
  });

  function respond(photos: Photo[]): void {
    const request = requests.at(-1)!;
    request.next(photos);
    request.complete();
  }

  it('starts empty and ready to load', () => {
    expect(store.photos()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBe(false);
    expect(store.hasMore()).toBe(true);
  });

  it('loads the first page and toggles loading', () => {
    store.loadMore();

    expect(getPage).toHaveBeenCalledWith(1, PAGE_SIZE);
    expect(store.loading()).toBe(true);

    respond(page(1));

    expect(store.loading()).toBe(false);
    expect(store.photos()).toEqual(page(1));
    expect(store.hasMore()).toBe(true);
  });

  it('appends subsequent pages', () => {
    store.loadMore();
    respond(page(1));
    store.loadMore();
    respond(page(31));

    expect(getPage.mock.calls).toEqual([
      [1, PAGE_SIZE],
      [2, PAGE_SIZE],
    ]);
    expect(store.photos()).toEqual([...page(1), ...page(31)]);
  });

  it('ignores loadMore while a page is loading', () => {
    store.loadMore();
    store.loadMore();

    expect(getPage).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['a partial', 3],
    ['an empty', 0],
  ])('stops loading after %s page', (_, size) => {
    store.loadMore();
    respond(page(1));
    store.loadMore();
    respond(page(31, size));

    expect(store.hasMore()).toBe(false);
    store.loadMore();
    expect(getPage).toHaveBeenCalledTimes(2);
  });

  it('exposes the error and retries the same page', () => {
    store.loadMore();
    respond(page(1));
    store.loadMore();
    requests.at(-1)!.error(new Error('Network error'));

    expect(store.error()).toBe(true);
    expect(store.loading()).toBe(false);

    store.loadMore();
    expect(getPage).toHaveBeenCalledTimes(2);

    store.retry();
    expect(getPage).toHaveBeenLastCalledWith(2, PAGE_SIZE);
    expect(store.error()).toBe(false);
    expect(store.loading()).toBe(true);

    respond(page(31));
    expect(store.photos()).toEqual([...page(1), ...page(31)]);
  });

  it('ignores retry when there is no error', () => {
    store.retry();

    expect(getPage).not.toHaveBeenCalled();
  });
});
