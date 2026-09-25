import { IMAGE_LOADER } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { picsumImageLoader, providePicsumImageLoader } from './picsum-image-loader';

describe('picsumImageLoader', () => {
  const loader = picsumImageLoader('https://cdn.test');

  it('uses the width and height requested by NgOptimizedImage', () => {
    expect(loader({ src: '42', width: 400, height: 600 })).toBe('https://cdn.test/id/42/400/600');
  });

  it('requests a square image when only the width is known', () => {
    expect(loader({ src: '42', width: 800 })).toBe('https://cdn.test/id/42/800/800');
  });

  it('falls back to a square image of the default width', () => {
    expect(loader({ src: '42' })).toBe('https://cdn.test/id/42/1080/1080');
  });

  it('keeps the aspect ratio passed in loader params', () => {
    const loaderParams = { aspectRatio: 1.5 };

    expect(loader({ src: '42', width: 640, loaderParams })).toBe('https://cdn.test/id/42/640/427');
    expect(loader({ src: '42', loaderParams })).toBe('https://cdn.test/id/42/1080/720');
  });

  it('is provided as IMAGE_LOADER', () => {
    TestBed.configureTestingModule({ providers: [providePicsumImageLoader('https://cdn.test')] });

    expect(TestBed.inject(IMAGE_LOADER)({ src: '7', width: 100, height: 150 })).toBe(
      'https://cdn.test/id/7/100/150',
    );
  });
});
