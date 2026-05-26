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

  photoUrl = 'images/perfil/perfil.jpeg';

  get hint(): string {
    return this.i18n.t('about.hint');
  }

  onPhotoAreaClick(): void {
    this.flipToBack();
  }

  flipToBack(): void {
    this.isFlipped = true;
    this.showVideoControls = true;
    this.startTvBoot();
  }

  flipBack(): void {
    this.isFlipped = false;
    this.showVideoControls = false;
    this.tvBooting = false;
    if (this.tvBootTimer) {
      clearTimeout(this.tvBootTimer);
      this.tvBootTimer = null;
    }
    setTimeout(() => this.photoTrigger?.nativeElement.focus(), 60);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.isFlipped) {
      return;
    }

    this.flipBack();
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
