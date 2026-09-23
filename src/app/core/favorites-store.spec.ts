import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FAVORITES_STORAGE_KEY, FavoritesStore } from './favorites-store';
import { Photo } from './photo';
import { STORAGE } from './storage';

function createMemoryStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
  return {
    get length() {
      return data.size;
    },
    key: (index) => [...data.keys()][index] ?? null,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, String(value));
    },
    removeItem: (key) => {
      data.delete(key);
    },
    clear: () => data.clear(),
  };
}

const first: Photo = { id: '1', author: 'Alejandro Escamilla', width: 5000, height: 3333 };
const second: Photo = { id: '2', author: 'Paul Jarvis', width: 2500, height: 1667 };

describe('FavoritesStore', () => {
  let storage: Storage;

  function createStore(): FavoritesStore {
    TestBed.configureTestingModule({ providers: [{ provide: STORAGE, useValue: storage }] });
    return TestBed.inject(FavoritesStore);
  }

  function stored(): unknown {
    return JSON.parse(storage.getItem(FAVORITES_STORAGE_KEY) ?? 'null');
  }

  beforeEach(() => {
    storage = createMemoryStorage();
  });

  it('starts empty when storage has no favorites', () => {
    const store = createStore();

    expect(store.favorites()).toEqual([]);
    expect(store.count()).toBe(0);
  });

  it('adds photos in insertion order and ignores duplicates', () => {
    const store = createStore();

    store.add(first);
    store.add(second);
    store.add(first);

    expect(store.favorites()).toEqual([first, second]);
    expect(store.count()).toBe(2);
    expect(store.isFavorite('1')).toBe(true);
    expect(store.isFavorite('3')).toBe(false);
  });

  it('removes photos by id', () => {
    const store = createStore();
    store.add(first);
    store.add(second);

    store.remove('1');
    store.remove('unknown');

    expect(store.favorites()).toEqual([second]);
    expect(store.isFavorite('1')).toBe(false);
  });

  it('persists changes to storage', () => {
    const store = createStore();

    store.add(first);
    TestBed.tick();
    expect(stored()).toEqual([first]);

    store.remove('1');
    TestBed.tick();
    expect(stored()).toEqual([]);
  });

  it('restores favorites from storage', () => {
    storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([first, second]));

    const store = createStore();

    expect(store.favorites()).toEqual([first, second]);
    expect(store.isFavorite('2')).toBe(true);
  });

  it('starts empty when stored data is not valid JSON', () => {
    storage.setItem(FAVORITES_STORAGE_KEY, '{not json');

    expect(createStore().favorites()).toEqual([]);
  });

  it('drops stored entries that do not match the photo schema', () => {
    storage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify([first, { id: 3, author: 'x' }, null, 'photo', second]),
    );

    expect(createStore().favorites()).toEqual([first, second]);
  });

  it('starts empty when stored data is not an array', () => {
    storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ id: '1' }));

    expect(createStore().favorites()).toEqual([]);
  });

  it('keeps working and reports the error when storage write fails', () => {
    const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
    vi.spyOn(storage, 'setItem').mockImplementation(() => {
      throw quotaError;
    });
    const handleError = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: ErrorHandler, useValue: { handleError } }],
    });
    const store = createStore();

    store.add(first);
    TestBed.tick();

    expect(store.favorites()).toEqual([first]);
    expect(handleError).toHaveBeenCalledWith(quotaError);
  });
});
