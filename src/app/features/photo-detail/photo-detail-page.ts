import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { FavoritesStore } from '../../core/favorites-store';
import { PhotoApi } from '../../core/photo-api';

@Component({
  selector: 'app-photo-detail-page',
  imports: [NgOptimizedImage, MatButton, MatIcon, MatProgressSpinner, RouterLink],
  templateUrl: './photo-detail-page.html',
  styleUrl: './photo-detail-page.scss',
})
export class PhotoDetailPage {
  private readonly favorites = inject(FavoritesStore);
  private readonly api = inject(PhotoApi);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly id = input.required<string>();

  protected readonly isFavorite = computed(() => this.favorites.ids().has(this.id()));

  protected readonly photo = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) => {
        const favorite = this.favorites.favorites().find((photo) => photo.id === id);
        return favorite ? of(favorite) : this.api.getPhoto(id).pipe(catchError(() => of(null)));
      }),
    ),
  );

  protected async removeFromFavorites(): Promise<void> {
    const id = this.id();
    if (await this.router.navigate(['/favorites'])) {
      this.favorites.remove(id);
      this.snackBar.open('Removed from favorites');
    }
  }
}
