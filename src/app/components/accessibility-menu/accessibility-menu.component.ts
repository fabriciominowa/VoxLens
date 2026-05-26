import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { AcessibilidadeService } from '../../services/acessibilidade.service';

@Component({
  selector: 'app-accessibility-menu',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './accessibility-menu.component.html',
  styleUrl: './accessibility-menu.component.scss'
})
export class AccessibilityMenuComponent {
  public readonly acessibilidade = inject(AcessibilidadeService);
  public isOpen = false;

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }
}
