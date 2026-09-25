import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatSnackBarHarness } from '@angular/material/snack-bar/testing';
import { provideRouter, Router } from '@angular/router';
import { FavoritesStore } from '../../core/favorites-store';
import { Photo } from '../../core/photo';
import { providePicsumImageLoader } from '../../core/picsum-image-loader';
import { PhotoDetailPage } from './photo-detail-page';

const photos: Photo[] = [
  { id: '1', author: 'Alejandro Escamilla', width: 5000, height: 3333 },
  { id: '2', author: 'Paul Jarvis', width: 2500, height: 1667 },
];

function createFavorites() {
  return { favorites: signal(photos), remove: vi.fn() };
}

describe('PhotoDetailPage', () => {
  let favorites: ReturnType<typeof createFavorites>;

  beforeEach(() => {
    favorites = createFavorites();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'favorites', children: [] }]),
        providePicsumImageLoader('https://cdn.test'),
        { provide: FavoritesStore, useValue: favorites },
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
});
