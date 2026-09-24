import { afterRenderEffect, Directive, ElementRef, inject, input, output } from '@angular/core';

@Directive({ selector: '[appInfiniteScroll]' })
export class InfiniteScroll {
  readonly disabled = input(false);
  readonly rootMargin = input('400px');
  readonly scrolled = output<void>();

  private readonly host = inject<ElementRef<Element>>(ElementRef).nativeElement;

  constructor() {
    afterRenderEffect((onCleanup) => {
      if (this.disabled()) {
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            this.scrolled.emit();
          }
        },
        { rootMargin: this.rootMargin() },
      );
      observer.observe(this.host);
      onCleanup(() => observer.disconnect());
    });
  }
}
