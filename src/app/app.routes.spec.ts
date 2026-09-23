import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';

describe('routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
  });

  it('redirects unknown paths to /', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/unknown/path');
    expect(TestBed.inject(Router).url).toBe('/');
  });
});
