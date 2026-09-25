import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { Provider } from '@angular/core';

const DEFAULT_WIDTH = 1080;

interface PicsumLoaderParams {
  readonly aspectRatio: number;
}

export function picsumImageLoader(cdnUrl: string) {
  return ({ src, width = DEFAULT_WIDTH, height, loaderParams }: ImageLoaderConfig): string => {
    const aspectRatio = (loaderParams as PicsumLoaderParams | undefined)?.aspectRatio ?? 1;
    return `${cdnUrl}/id/${src}/${width}/${height ?? Math.round(width / aspectRatio)}`;
  };
}

export function providePicsumImageLoader(cdnUrl: string): Provider {
  return { provide: IMAGE_LOADER, useValue: picsumImageLoader(cdnUrl) };
}
