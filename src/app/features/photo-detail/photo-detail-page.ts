import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FavoritesStore } from '../../core/favorites-store';

@Component({
  selector: 'app-photo-detail-page',
  imports: [NgOptimizedImage, MatButton, MatIcon],
  templateUrl: './photo-detail-page.html',
  styleUrl: './photo-detail-page.scss',
})
export class PhotoDetailPage {
  private readonly favorites = inject(FavoritesStore);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly id = input.required<string>();

  protected readonly photo = computed(() =>
    this.favorites.favorites().find((photo) => photo.id === this.id()),
  );

  protected async removeFromFavorites(): Promise<void> {
    const id = this.id();
    if (await this.router.navigate(['/favorites'])) {
      this.favorites.remove(id);
      this.snackBar.open('Removed from favorites');
    }
  }
}
