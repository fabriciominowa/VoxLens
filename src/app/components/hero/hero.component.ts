import { Component, inject } from '@angular/core';
import { I18nService } from '../../i18n.service';
import { SmartReadDirective } from '../../directives/smart-read.directive';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [SmartReadDirective],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  readonly i18n = inject(I18nService);
}
