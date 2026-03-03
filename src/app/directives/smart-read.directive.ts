import { FocusMonitor } from '@angular/cdk/a11y';
import { Directive, ElementRef, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AcessibilidadeService } from '../services/acessibilidade.service';

@Directive({
  selector: '[smartRead]',
  standalone: true,
})
export class SmartReadDirective implements OnInit, OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly acessibilidade = inject(AcessibilidadeService);
  private readonly focusMonitor = inject(FocusMonitor);
  private readonly destroy$ = new Subject<void>();

  @Input() smartReadContext = 'Elemento focado';
  @Input() smartReadText?: string;
  @Input() smartRead: boolean | string = true;

  ngOnInit(): void {
    this.focusMonitor
      .monitor(this.elementRef, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe((origin) => {
        if (origin !== 'keyboard') {
          return;
        }

        if (this.smartRead === false || this.smartRead === 'false') {
          return;
        }

        const texto = (this.smartReadText ?? this.elementRef.nativeElement.innerText ?? '').trim();
        if (!texto) {
          return;
        }

        this.acessibilidade.narrarComGemini(
          texto,
          this.acessibilidade.getCurrentLanguageCode(),
          this.smartReadContext
        );
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusMonitor.stopMonitoring(this.elementRef);
  }
}
