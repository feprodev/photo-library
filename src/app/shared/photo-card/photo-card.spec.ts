import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconHarness } from '@angular/material/icon/testing';
import { Photo } from '../../core/photo';
import { providePicsumImageLoader } from '../../core/picsum-image-loader';
import { PhotoCard } from './photo-card';

const photo: Photo = { id: '42', author: 'Paul Jarvis', width: 2500, height: 1667 };

describe('PhotoCard', () => {
  let fixture: ComponentFixture<PhotoCard>;
  let host: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [providePicsumImageLoader('https://cdn.test')],
    });
    fixture = TestBed.createComponent(PhotoCard);
    fixture.componentRef.setInput('photo', photo);
    await fixture.whenStable();
    host = fixture.nativeElement;
  });

  it('renders the photo preview', () => {
    const image = host.querySelector('img')!;

    expect(image.getAttribute('srcset')).toBe(
      'https://cdn.test/id/42/400/600 1x, https://cdn.test/id/42/800/1200 2x',
    );
    expect(image.alt).toBe('Photo by Paul Jarvis');
    expect(host.querySelector('[aria-label="In favorites"]')).toBeNull();
  });

  it('marks a favorite photo', async () => {
    fixture.componentRef.setInput('favorite', true);
    await fixture.whenStable();

    const icon = await TestbedHarnessEnvironment.loader(fixture).getHarness(
      MatIconHarness.with({ name: 'favorite' }),
    );
    expect(await (await icon.host()).getAttribute('aria-label')).toBe('In favorites');
  });

  it('shows a labelled placeholder when the image fails to load', async () => {
    host.querySelector('img')!.dispatchEvent(new Event('error'));
    await fixture.whenStable();

    const placeholder = host.querySelector('[role="img"]')!;
    const icon = await TestbedHarnessEnvironment.harnessForFixture(fixture, MatIconHarness);
    expect(host.querySelector('img')).toBeNull();
    expect(placeholder.getAttribute('aria-label')).toBe('Photo by Paul Jarvis');
    expect(await icon.getName()).toBe('broken_image');
  });

  it('retries the image when the photo changes', async () => {
    host.querySelector('img')!.dispatchEvent(new Event('error'));
    await fixture.whenStable();

    fixture.componentRef.setInput('photo', { ...photo, id: '43' });
    await fixture.whenStable();

    expect(host.querySelector('img')!.getAttribute('srcset')).toContain('/id/43/400/600 1x');
  });
});
