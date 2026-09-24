import { Component, input, output } from '@angular/core';
import { Photo } from '../../core/photo';
import { PhotoCard } from '../photo-card/photo-card';

@Component({
  selector: 'app-photo-grid',
  imports: [PhotoCard],
  templateUrl: './photo-grid.html',
  styleUrl: './photo-grid.scss',
})
export class PhotoGrid {
  readonly photos = input.required<readonly Photo[]>();
  readonly photoClick = output<Photo>();
}
