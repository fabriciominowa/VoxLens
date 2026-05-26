import { Component, inject } from '@angular/core';
import { I18nService } from '../../i18n.service';
import { SmartReadDirective } from '../../directives/smart-read.directive';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [SmartReadDirective],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
})
export class SkillsComponent {
  readonly i18n = inject(I18nService);
}
