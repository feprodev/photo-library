import { Component, inject, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
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

  ngOnInit(): void {
    if (this.feed.photos().length === 0) {
      this.feed.loadMore();
    }
  }
}
