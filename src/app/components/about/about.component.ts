import { CommonModule } from '@angular/common';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { Component, HostListener, ViewChild, ElementRef, inject } from '@angular/core';
import { I18nService } from '../../i18n.service';
import { SmartReadDirective } from '../../directives/smart-read.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, SmartReadDirective, CdkTrapFocus],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  readonly i18n = inject(I18nService);
  @ViewChild('photoTrigger') private photoTrigger?: ElementRef<HTMLButtonElement>;

  isFlipped = false;
  showVideoControls = false;
  tvBooting = false;
  private tvBootTimer: ReturnType<typeof setTimeout> | null = null;
  private activeVideoEl?: HTMLVideoElement;

  photoUrl = 'images/perfil/perfil.jpeg';
  videoUrl = 'assets/profile/fabricio-video.mp4';

  get hint(): string {
    return this.i18n.t('about.hint');
  }

  onPhotoAreaClick(videoEl: HTMLVideoElement): void {
    this.flipToBack(videoEl);
  }

  onVideoClick(videoEl: HTMLVideoElement): void {
    if (videoEl.paused) {
      void videoEl.play();
      return;
    }
    videoEl.pause();
  }

  flipToBack(videoEl: HTMLVideoElement): void {
    this.activeVideoEl = videoEl;
    this.isFlipped = true;
    this.showVideoControls = true;
    this.startTvBoot();
    void videoEl.play();
  }

  flipBack(videoEl: HTMLVideoElement): void {
    this.isFlipped = false;
    this.showVideoControls = false;
    this.tvBooting = false;
    if (this.tvBootTimer) {
      clearTimeout(this.tvBootTimer);
      this.tvBootTimer = null;
    }
    videoEl.pause();
    videoEl.currentTime = 0;
    this.activeVideoEl = undefined;
    setTimeout(() => this.photoTrigger?.nativeElement.focus(), 60);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.isFlipped || !this.activeVideoEl) {
      return;
    }

    this.flipBack(this.activeVideoEl);
  }

  private startTvBoot(): void {
    this.tvBooting = true;
    if (this.tvBootTimer) {
      clearTimeout(this.tvBootTimer);
    }
    this.tvBootTimer = setTimeout(() => {
      this.tvBooting = false;
      this.tvBootTimer = null;
    }, 700);
  }
}
