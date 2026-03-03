import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { take } from 'rxjs';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { SkillsComponent } from './components/skills/skills.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { AboutComponent } from './components/about/about.component';
import { ExperienceComponent } from './components/experience/experience.component';
import { ContactComponent } from './components/contact/contact.component';
import { FooterComponent } from './components/footer/footer.component';
import { AccessibilityCaptionComponent } from './components/accessibility-caption/accessibility-caption.component';
import { AcessibilidadeService } from './services/acessibilidade.service';

@Component({
  selector: 'app-root',
  imports: [
    NavbarComponent,
    HeroComponent,
    SkillsComponent,
    ProjectsComponent,
    AboutComponent,
    ExperienceComponent,
    ContactComponent,
    FooterComponent,
    AccessibilityCaptionComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly acessibilidade = inject(AcessibilidadeService);

  mouseX = 0;
  mouseY = 0;
  ringX = 0;
  ringY = 0;

  private frameId = 0;
  private revealObserver?: IntersectionObserver;
  private alreadyPresented = false;

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  @HostListener('document:click')
  onFirstClick(): void {
    this.tryPresentWelcome();
  }

  @HostListener('document:keydown')
  onFirstKeydown(): void {
    this.tryPresentWelcome();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.applyHighContrastIfNeeded();
  }

  ngAfterViewInit(): void {
    this.ringX = this.mouseX;
    this.ringY = this.mouseY;
    this.animateRing();
    this.applyHighContrastIfNeeded();

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        }
      },
      { threshold: 0.1 }
    );

    const revealNodes = this.host.nativeElement.querySelectorAll('.reveal');
    revealNodes.forEach((node: Element) => this.revealObserver?.observe(node));
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId);
    this.revealObserver?.disconnect();
  }

  private animateRing(): void {
    this.ringX += (this.mouseX - this.ringX) * 0.12;
    this.ringY += (this.mouseY - this.ringY) * 0.12;
    this.frameId = requestAnimationFrame(() => this.animateRing());
  }

  private tryPresentWelcome(): void {
    if (this.alreadyPresented) {
      return;
    }

    this.alreadyPresented = true;
    const sobreMim = this.document.getElementById('sobre-mim');
    const texto = sobreMim?.innerText?.trim();

    if (!texto) {
      return;
    }

    const lang = this.acessibilidade.getCurrentLanguageCode();
    this.acessibilidade
      .gerarNarracao(texto, lang, 'Bio da secao sobre mim para boas-vindas iniciais')
      .pipe(take(1))
      .subscribe((fala) => this.acessibilidade.falar(fala, lang));
  }

  private applyHighContrastIfNeeded(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const deviceRatio = window.devicePixelRatio ?? 1;
    const viewportScale = window.visualViewport?.scale ?? 1;
    const shouldUseContrast = deviceRatio > 1 || viewportScale > 1.2;

    this.document.body.classList.toggle('high-contrast', shouldUseContrast);
  }
}

