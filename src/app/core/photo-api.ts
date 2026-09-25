import { HttpClient } from '@angular/common/http';
import { inject, InjectionToken, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Photo } from './photo';

export const API_URL = new InjectionToken<string>('API_URL');

export const PAGE_SIZE = 30;

interface PicsumPhoto {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

const toPhoto = ({ id, author, width, height }: PicsumPhoto): Photo => ({
  id,
  author,
  width,
  height,
});

@Service()
export class PhotoApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getPage(page: number, size = PAGE_SIZE): Observable<Photo[]> {
    return this.http
      .get<PicsumPhoto[]>(`${this.apiUrl}/v2/list`, { params: { page, limit: size } })
      .pipe(map((items) => items.map(toPhoto)));
  }

  getPhoto(id: string): Observable<Photo> {
    return this.http
      .get<PicsumPhoto>(`${this.apiUrl}/id/${encodeURIComponent(id)}/info`)
      .pipe(map(toPhoto));
  }
}
