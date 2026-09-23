import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_LATENCY_MS, latencyInterceptor, randomLatency } from './latency-interceptor';

describe('randomLatency', () => {
  afterEach(() => vi.restoreAllMocks());

  it.each([
    [0, 200],
    [0.5, 250],
    [0.999, 300],
  ])('maps Math.random() = %s to %sms', (random, expected) => {
    vi.spyOn(Math, 'random').mockReturnValue(random);

    expect(randomLatency({ min: 200, max: 300 })).toBe(expected);
  });
});

describe('latencyInterceptor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([latencyInterceptor])),
        provideHttpClientTesting(),
        { provide: API_LATENCY_MS, useValue: { min: 250, max: 250 } },
      ],
    });
  });

  afterEach(() => vi.useRealTimers());

  it('delays the response by the configured latency', () => {
    const http = TestBed.inject(HttpClient);
    const httpTesting = TestBed.inject(HttpTestingController);
    let response: unknown;
    http.get('/api').subscribe((body) => (response = body));
    httpTesting.expectOne('/api').flush('ok');

    vi.advanceTimersByTime(249);
    expect(response).toBeUndefined();

    vi.advanceTimersByTime(1);
    expect(response).toBe('ok');
  });
});
