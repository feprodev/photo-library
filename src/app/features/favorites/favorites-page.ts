import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { FavoritesStore } from '../../core/favorites-store';
import { PhotoGrid } from '../../shared/photo-grid/photo-grid';

@Component({
  selector: 'app-favorites-page',
  imports: [PhotoGrid, MatButton, RouterLink],
  templateUrl: './favorites-page.html',
  styleUrl: './favorites-page.scss',
})
export class FavoritesPage {
  protected readonly favorites = inject(FavoritesStore);
}
