import { Component, inject } from '@angular/core';
import { I18nService } from '../../i18n.service';
import { SmartReadDirective } from '../../directives/smart-read.directive';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [SmartReadDirective],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  readonly i18n = inject(I18nService);
}
