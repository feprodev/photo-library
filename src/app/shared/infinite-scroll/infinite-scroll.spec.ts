import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfiniteScroll } from './infinite-scroll';

@Component({
  imports: [InfiniteScroll],
  template: `<div appInfiniteScroll [disabled]="disabled()" (scrolled)="scrolled()"></div>`,
})
class Host {
  readonly disabled = signal(false);
  readonly scrolled = vi.fn();
}

describe('InfiniteScroll', () => {
  const observer = { observe: vi.fn(), disconnect: vi.fn() };
  let notify: (isIntersecting: boolean) => void;
  const IntersectionObserverMock = vi.fn(function (
    callback: (entries: Partial<IntersectionObserverEntry>[]) => void,
  ) {
    notify = (isIntersecting) => callback([{ isIntersecting }]);
    return observer;
  });

  let fixture: ComponentFixture<Host>;
  let host: Host;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function setDisabled(disabled: boolean): Promise<void> {
    host.disabled.set(disabled);
    await fixture.whenStable();
  }

  it('observes the sentinel with a 400px margin', () => {
    const sentinel = fixture.nativeElement.querySelector('div');

    expect(IntersectionObserverMock).toHaveBeenCalledWith(expect.any(Function), {
      rootMargin: '400px',
    });
    expect(observer.observe).toHaveBeenCalledExactlyOnceWith(sentinel);
  });

  it('emits when the sentinel comes into view', () => {
    notify(false);
    expect(host.scrolled).not.toHaveBeenCalled();

    notify(true);
    expect(host.scrolled).toHaveBeenCalledOnce();
  });

  it('stops observing while disabled', async () => {
    await setDisabled(true);

    expect(observer.disconnect).toHaveBeenCalledOnce();
    expect(observer.observe).toHaveBeenCalledOnce();
  });

  it('observes again once enabled', async () => {
    await setDisabled(true);
    await setDisabled(false);

    expect(observer.observe).toHaveBeenCalledTimes(2);
  });

  it('stops observing when destroyed', () => {
    fixture.destroy();

    expect(observer.disconnect).toHaveBeenCalledOnce();
  });
});
