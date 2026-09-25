import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { FavoritesStore } from '../../core/favorites-store';

@Component({
  selector: 'app-photo-detail-page',
  imports: [NgOptimizedImage],
  templateUrl: './photo-detail-page.html',
  styleUrl: './photo-detail-page.scss',
})
export class PhotoDetailPage {
  private readonly favorites = inject(FavoritesStore);

  readonly id = input.required<string>();

  protected readonly photo = computed(() =>
    this.favorites.favorites().find((photo) => photo.id === this.id()),
  );
}
