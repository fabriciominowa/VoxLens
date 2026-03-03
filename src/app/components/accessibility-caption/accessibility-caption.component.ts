import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AcessibilidadeService } from '../../services/acessibilidade.service';

@Component({
  selector: 'app-accessibility-caption',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './accessibility-caption.component.html',
  styleUrl: './accessibility-caption.component.scss',
})
export class AccessibilityCaptionComponent {
  readonly acessibilidade = inject(AcessibilidadeService);
}
