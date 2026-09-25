import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatSnackBarHarness } from '@angular/material/snack-bar/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { FavoritesStore } from '../../core/favorites-store';
import { Photo } from '../../core/photo';
import { PhotoApi } from '../../core/photo-api';
import { providePicsumImageLoader } from '../../core/picsum-image-loader';
import { PhotoDetailPage } from './photo-detail-page';

const photos: Photo[] = [
  { id: '1', author: 'Alejandro Escamilla', width: 5000, height: 3333 },
  { id: '2', author: 'Paul Jarvis', width: 2500, height: 1667 },
];

const otherPhoto: Photo = { id: '3', author: 'Alejandro Escamilla', width: 5000, height: 3333 };

function createFavorites() {
  const favorites = signal(photos);
  return {
    favorites,
    ids: computed(() => new Set(favorites().map((photo) => photo.id))),
    remove: vi.fn(),
  };
}

describe('PhotoDetailPage', () => {
  let favorites: ReturnType<typeof createFavorites>;
  let api: { getPhoto: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    favorites = createFavorites();
    api = { getPhoto: vi.fn(() => of(otherPhoto)) };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'favorites', children: [] }]),
        providePicsumImageLoader('https://cdn.test'),
        { provide: FavoritesStore, useValue: favorites },
        { provide: PhotoApi, useValue: api },
      ],
    });
  });

  async function render(id: string): Promise<ComponentFixture<PhotoDetailPage>> {
    const fixture = TestBed.createComponent(PhotoDetailPage);
    fixture.componentRef.setInput('id', id);
    await fixture.whenStable();
    return fixture;
  }

  function removeButton(fixture: ComponentFixture<PhotoDetailPage>): Promise<MatButtonHarness> {
    return TestbedHarnessEnvironment.loader(fixture).getHarness(
      MatButtonHarness.with({ text: /Remove from favorites/ }),
    );
  }

  it('shows the photo with its original aspect ratio as the page priority image', async () => {
    const fixture = await render('2');

    const image: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(image.alt).toBe('Photo by Paul Jarvis');
    expect(image.getAttribute('fetchpriority')).toBe('high');
    expect(image.getAttribute('srcset')).toContain('https://cdn.test/id/2/640/427 640w');
    expect(image.getAttribute('srcset')).toContain('https://cdn.test/id/2/1920/1280 1920w');
  });

  it('credits the author', async () => {
    const fixture = await render('2');

    expect(fixture.nativeElement.querySelector('figcaption').textContent).toBe('Paul Jarvis');
  });

  it('removes the photo from favorites and returns to them', async () => {
    const fixture = await render('2');

    await (await removeButton(fixture)).click();

    expect(TestBed.inject(Router).url).toBe('/favorites');
    expect(favorites.remove).toHaveBeenCalledExactlyOnceWith('2');
    const snackBar =
      await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(MatSnackBarHarness);
    expect(await snackBar.getMessage()).toBe('Removed from favorites');
  });

  it('keeps the photo in favorites when leaving the page is cancelled', async () => {
    const fixture = await render('2');
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(false);

    await (await removeButton(fixture)).click();

    expect(favorites.remove).not.toHaveBeenCalled();
  });

  it('does not request a photo that is in favorites', async () => {
    await render('2');

    expect(api.getPhoto).not.toHaveBeenCalled();
  });

  it('loads a photo that is not in favorites and points to them instead of removing', async () => {
    const fixture = await render('3');
    const loader = TestbedHarnessEnvironment.loader(fixture);

    expect(api.getPhoto).toHaveBeenCalledExactlyOnceWith('3');
    expect(fixture.nativeElement.querySelector('img').alt).toBe('Photo by Alejandro Escamilla');
    expect(fixture.nativeElement.querySelector('.not-favorite p').textContent).toBe(
      'Not in your favorites',
    );
    const favoritesLink = await loader.getHarness(
      MatButtonHarness.with({ text: 'Go to favorites' }),
    );
    expect(await (await favoritesLink.host()).getAttribute('href')).toBe('/favorites');
    expect(await loader.hasHarness(MatButtonHarness.with({ text: /Remove from favorites/ }))).toBe(
      false,
    );
  });

  it('shows the spinner while the photo is loading', async () => {
    const response = new Subject<Photo>();
    api.getPhoto.mockReturnValue(response);
    const fixture = await render('3');

    expect(fixture.nativeElement.querySelector('mat-progress-spinner')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();

    response.next(otherPhoto);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('mat-progress-spinner')).toBeNull();
    expect(fixture.nativeElement.querySelector('img')).not.toBeNull();
  });

  it('tells when the photo cannot be loaded', async () => {
    api.getPhoto.mockReturnValue(throwError(() => new Error('Not found')));

    const fixture = await render('3');

    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toBe(
      "Couldn't load the photo",
    );
    expect(fixture.nativeElement.querySelector('mat-progress-spinner')).toBeNull();
  });
});
