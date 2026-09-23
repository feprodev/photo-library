import { HarnessLoader, parallel } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { provideRouter, Router } from '@angular/router';
import { Header } from './header';

describe('Header', () => {
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', children: [] }])],
    });
    loader = TestbedHarnessEnvironment.loader(TestBed.createComponent(Header));
  });

  it.each([
    ['/', ['Photos']],
    ['/favorites', ['Favorites']],
    ['/photos/42', []],
  ])('highlights the active view on %s', async (url, expected) => {
    await TestBed.inject(Router).navigateByUrl(url);

    const active = await loader.getAllHarnesses(MatButtonHarness.with({ appearance: 'filled' }));
    const labels = await parallel(() => active.map((button) => button.getText()));
    expect(labels).toEqual(expected);
  });
});
