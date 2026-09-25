import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FavoritesStore } from '../../core/favorites-store';
import { Photo } from '../../core/photo';
import { providePicsumImageLoader } from '../../core/picsum-image-loader';
import { PhotoDetailPage } from './photo-detail-page';

const photos: Photo[] = [
  { id: '1', author: 'Alejandro Escamilla', width: 5000, height: 3333 },
  { id: '2', author: 'Paul Jarvis', width: 2500, height: 1667 },
];

describe('PhotoDetailPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        providePicsumImageLoader('https://cdn.test'),
        { provide: FavoritesStore, useValue: { favorites: signal(photos) } },
      ],
    });
  });

  async function render(id: string): Promise<ComponentFixture<PhotoDetailPage>> {
    const fixture = TestBed.createComponent(PhotoDetailPage);
    fixture.componentRef.setInput('id', id);
    await fixture.whenStable();
    return fixture;
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
});
