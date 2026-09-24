import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input, linkedSignal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Photo } from '../../core/photo';

@Component({
  selector: 'app-photo-card',
  imports: [NgOptimizedImage, MatIcon],
  templateUrl: './photo-card.html',
  styleUrl: './photo-card.scss',
})
export class PhotoCard {
  readonly photo = input.required<Photo>();

  protected readonly alt = computed(() => `Photo by ${this.photo().author}`);
  protected readonly failed = linkedSignal({ source: this.photo, computation: () => false });
}
