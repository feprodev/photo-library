import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { Provider } from '@angular/core';

const DEFAULT_WIDTH = 1080;

export function picsumImageLoader(cdnUrl: string) {
  return ({ src, width = DEFAULT_WIDTH, height = width }: ImageLoaderConfig): string =>
    `${cdnUrl}/id/${src}/${width}/${height}`;
}

export function providePicsumImageLoader(cdnUrl: string): Provider {
  return { provide: IMAGE_LOADER, useValue: picsumImageLoader(cdnUrl) };
}
