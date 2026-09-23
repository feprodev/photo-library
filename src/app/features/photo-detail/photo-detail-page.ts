import { Component, input } from '@angular/core';

@Component({
  selector: 'app-photo-detail-page',
  templateUrl: './photo-detail-page.html',
})
export class PhotoDetailPage {
  readonly id = input.required<string>();
}
