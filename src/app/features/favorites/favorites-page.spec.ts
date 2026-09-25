import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { provideRouter } from '@angular/router';
import { FavoritesStore } from '../../core/favorites-store';
import { Photo } from '../../core/photo';
import { FavoritesPage } from './favorites-page';

const photos: Photo[] = [
  { id: '1', author: 'Alejandro Escamilla', width: 5000, height: 3333 },
  { id: '2', author: 'Paul Jarvis', width: 2500, height: 1667 },
];

function createFavorites() {
  const favorites = signal<Photo[]>([]);
  return { favorites, count: computed(() => favorites().length) };
}

describe('FavoritesPage', () => {
  let favorites: ReturnType<typeof createFavorites>;

  beforeEach(() => {
    favorites = createFavorites();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: FavoritesStore, useValue: favorites }],
    });
  });

  async function render(): Promise<ComponentFixture<FavoritesPage>> {
    const fixture = TestBed.createComponent(FavoritesPage);
    await fixture.whenStable();
    return fixture;
  }

  it('shows favorite photos in a grid', async () => {
    favorites.favorites.set(photos);

    const fixture = await render();

    const labels = Array.from(
      fixture.nativeElement.querySelectorAll('app-photo-grid img'),
      (image: HTMLImageElement) => image.alt,
    );
    expect(labels).toEqual(['Photo by Alejandro Escamilla', 'Photo by Paul Jarvis']);
    expect(fixture.nativeElement.querySelector('.empty')).toBeNull();
  });

  it('offers to browse photos when there are no favorites', async () => {
    const fixture = await render();

    const browse = await TestbedHarnessEnvironment.loader(fixture).getHarness(
      MatButtonHarness.with({ text: 'Browse photos' }),
    );
    expect(fixture.nativeElement.querySelector('.empty p').textContent).toBe('No favorites yet');
    expect(fixture.nativeElement.querySelector('app-photo-grid')).toBeNull();
    expect(await (await browse.host()).getAttribute('href')).toBe('/');
  });
});
