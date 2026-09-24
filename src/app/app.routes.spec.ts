import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';

describe('routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
  });

  it('redirects unknown paths to /', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/unknown/path');
    expect(router.url).toBe('/');
  });
});
