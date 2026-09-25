import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Photo } from './photo';
import { API_URL, PAGE_SIZE, PhotoApi } from './photo-api';

describe('PhotoApi', () => {
  let api: PhotoApi;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'https://api.test' },
      ],
    });
    api = TestBed.inject(PhotoApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('requests a page from the configured API and maps items to photos', () => {
    let photos: Photo[] | undefined;
    api.getPage(3, 10).subscribe((result) => (photos = result));

    const req = httpTesting.expectOne(
      (request) => request.url === 'https://api.test/v2/list' && request.method === 'GET',
    );
    expect(req.request.params.get('page')).toBe('3');
    expect(req.request.params.get('limit')).toBe('10');

    req.flush([
      {
        id: '10',
        author: 'Paul Jarvis',
        width: 2500,
        height: 1667,
        url: 'https://unsplash.com/photos/6J--NXulQCs',
        download_url: 'https://picsum.photos/id/10/2500/1667',
      },
    ]);

    expect(photos).toEqual([{ id: '10', author: 'Paul Jarvis', width: 2500, height: 1667 }]);
  });

  it('uses PAGE_SIZE as the default limit', () => {
    api.getPage(1).subscribe();

    const req = httpTesting.expectOne((request) => request.url === 'https://api.test/v2/list');
    expect(req.request.params.get('limit')).toBe(String(PAGE_SIZE));
    req.flush([]);
  });

  it('requests a single photo by id and maps it', () => {
    let photo: Photo | undefined;
    api.getPhoto('10').subscribe((result) => (photo = result));

    httpTesting.expectOne({ url: 'https://api.test/id/10/info', method: 'GET' }).flush({
      id: '10',
      author: 'Paul Jarvis',
      width: 2500,
      height: 1667,
      url: 'https://unsplash.com/photos/6J--NXulQCs',
      download_url: 'https://picsum.photos/id/10/2500/1667',
    });

    expect(photo).toEqual({ id: '10', author: 'Paul Jarvis', width: 2500, height: 1667 });
  });

  it('encodes the photo id in the path', () => {
    api.getPhoto('../v2/list').subscribe();

    httpTesting.expectOne('https://api.test/id/..%2Fv2%2Flist/info').flush({});
  });
});
