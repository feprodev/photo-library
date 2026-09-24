import { Component, inject, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FavoritesStore } from '../../core/favorites-store';
import { Photo } from '../../core/photo';
import { InfiniteScroll } from '../../shared/infinite-scroll/infinite-scroll';
import { PhotoGrid } from '../../shared/photo-grid/photo-grid';
import { PhotoFeedStore } from './photo-feed-store';

@Component({
  selector: 'app-photos-page',
  imports: [PhotoGrid, InfiniteScroll, MatProgressSpinner, MatButton],
  templateUrl: './photos-page.html',
  styleUrl: './photos-page.scss',
})
export class PhotosPage implements OnInit {
  protected readonly feed = inject(PhotoFeedStore);
  protected readonly favorites = inject(FavoritesStore);
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    if (this.feed.photos().length === 0) {
      this.feed.loadMore();
    }
  }

  protected addToFavorites(photo: Photo): void {
    this.favorites.add(photo);
    this.snackBar.open('Added to favorites');
  }
}
