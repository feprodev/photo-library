import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Photo } from '../../core/photo';
import { PhotoGrid } from './photo-grid';

const photos: Photo[] = [
  { id: '1', author: 'Alejandro Escamilla', width: 5000, height: 3333 },
  { id: '2', author: 'Paul Jarvis', width: 2500, height: 1667 },
];

describe('PhotoGrid', () => {
  let fixture: ComponentFixture<PhotoGrid>;
  let buttons: HTMLButtonElement[];

  beforeEach(async () => {
    fixture = TestBed.createComponent(PhotoGrid);
    fixture.componentRef.setInput('photos', photos);
    await fixture.whenStable();
    buttons = Array.from(fixture.nativeElement.querySelectorAll('li > button'));
  });

  it('renders a card for every photo', () => {
    const labels = buttons.map((button) => button.querySelector('img')!.alt);

    expect(labels).toEqual(['Photo by Alejandro Escamilla', 'Photo by Paul Jarvis']);
  });

  it('marks favorite photos', async () => {
    fixture.componentRef.setInput('favoriteIds', new Set(['2']));
    await fixture.whenStable();

    const marked = buttons.map((button) => !!button.querySelector('[aria-label="In favorites"]'));

    expect(marked).toEqual([false, true]);
  });

  it('emits the clicked photo', () => {
    const photoClick = vi.fn();
    fixture.componentInstance.photoClick.subscribe(photoClick);

    buttons[1].click();

    expect(photoClick).toHaveBeenCalledExactlyOnceWith(photos[1]);
  });
});
