import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { I18nService, type Language } from '../i18n.service';

interface GeminiProxyResponse {
  fala: string;
}

@Injectable({ providedIn: 'root' })
export class AcessibilidadeService {
  private readonly http = inject(HttpClient);
  private readonly i18n = inject(I18nService);
  private readonly liveAnnouncer = inject(LiveAnnouncer);

  // Estados de Preferência
  private readonly highContrastSubject = new BehaviorSubject<boolean>(false);
  readonly highContrast$ = this.highContrastSubject.asObservable();

  private readonly narrationEnabledSubject = new BehaviorSubject<boolean>(false);
  readonly narrationEnabled$ = this.narrationEnabledSubject.asObservable();

  private readonly reducedMotionSubject = new BehaviorSubject<boolean>(false);
  readonly reducedMotion$ = this.reducedMotionSubject.asObservable();

  private readonly legendaSubject = new BehaviorSubject<string>('');
  readonly legenda$ = this.legendaSubject.asObservable();

  private readonly legendaAtivaSubject = new BehaviorSubject<boolean>(false);
  readonly legendaAtiva$ = this.legendaAtivaSubject.asObservable();

  private narrationToken = 0;
  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.inicializarPreferencias();
      this.ouvirMudancasSistema();

      if ('speechSynthesis' in window) {
        this.availableVoices = window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
          this.availableVoices = window.speechSynthesis.getVoices();
        };
      }
    }
  }

  get isHighContrast(): boolean { return this.highContrastSubject.value; }
  get isNarrationEnabled(): boolean { return this.narrationEnabledSubject.value; }
  get isReducedMotion(): boolean { return this.reducedMotionSubject.value; }

  private inicializarPreferencias(): void {
    const savedContrast = localStorage.getItem('pref-high-contrast');
    const savedNarration = localStorage.getItem('pref-narration');

    const prefersContrast = window.matchMedia('(prefers-contrast: more)').matches;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.setHighContrast(savedContrast ? savedContrast === 'true' : prefersContrast);
    this.setReducedMotion(prefersReduced);
    this.setNarration(savedNarration === 'true');

    this.reavaliarLegendaPorSurdez();
  }

  private ouvirMudancasSistema(): void {
    window.matchMedia('(prefers-contrast: more)').addEventListener('change', e => {
      if (localStorage.getItem('pref-high-contrast') === null) {
        this.setHighContrast(e.matches);
      }
    });
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
      this.setReducedMotion(e.matches);
    });
  }

  setHighContrast(active: boolean): void {
    this.highContrastSubject.next(active);
    localStorage.setItem('pref-high-contrast', String(active));
    if (active) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }

  setNarration(active: boolean): void {
    this.narrationEnabledSubject.next(active);
    localStorage.setItem('pref-narration', String(active));
    if (!active) this.cancelarNarracaoAtual();
  }

  setReducedMotion(active: boolean): void {
    this.reducedMotionSubject.next(active);
    if (active) {
      document.documentElement.style.setProperty('--scroll-behavior', 'auto');
    } else {
      document.documentElement.style.setProperty('--scroll-behavior', 'smooth');
    }
  }

  getCurrentLanguageCode(): 'pt-BR' | 'en-US' {
    return this.toSpeechLanguage(this.i18n.language());
  }

  gerarNarracao(texto: string, idioma: string, contexto: string): Observable<string> {
    const payload = {
      texto,
      idioma: this.toSpeechLanguage(idioma),
      contexto,
    };

    return this.http.post<GeminiProxyResponse>('/api/gemini-proxy', payload).pipe(
      map((response) => response?.fala?.trim() || texto),
      catchError(() => of(texto))
    );
  }

  narrarComGemini(texto: string, idioma: string, contexto: string): void {
    if (!this.isNarrationEnabled) return;

    const textoLimpo = texto.trim();
    if (!textoLimpo) return;

    this.cancelarNarracaoAtual();
    const currentToken = ++this.narrationToken;

    this.gerarNarracao(textoLimpo, idioma, contexto).subscribe((fala: string) => {
      if (currentToken !== this.narrationToken) return;
      this.falar(fala, idioma);
    });
  }

  falar(texto: string, lang?: string): void {
    const textoLimpo = texto.trim();
    if (!textoLimpo) return;

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.clearLegenda();
      return;
    }

    this.setLegendaTexto(this.legendaAtivaSubject.value ? textoLimpo : '');
    void this.liveAnnouncer.announce(textoLimpo, 'polite');

    const targetLang = this.toSpeechLanguage(lang ?? this.i18n.language());
    const utterance = new SpeechSynthesisUtterance(textoLimpo);
    utterance.lang = targetLang;
    const voice = this.pickVoice(targetLang);
    utterance.voice = voice;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => this.clearLegenda();
    utterance.onerror = () => this.clearLegenda();

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  private toSpeechLanguage(lang: string | Language): 'pt-BR' | 'en-US' {
    const normalized = (lang || '').toLowerCase();
    return normalized.startsWith('pt') ? 'pt-BR' : 'en-US';
  }

  private pickVoice(lang: 'pt-BR' | 'en-US'): SpeechSynthesisVoice | null {
    const exactVoice = this.availableVoices.find(
      (voice) => voice.lang.toLowerCase() === lang.toLowerCase()
    );
    if (exactVoice) return exactVoice;

    const languageVoice = this.availableVoices.find((voice) =>
      voice.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase())
    );
    return languageVoice ?? null;
  }

  private reavaliarLegendaPorSurdez(): void {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;
    const forcedColors = window.matchMedia('(forced-colors: active)').matches;
    const semSpeechSynthesis = !('speechSynthesis' in window);

    const perfilSurdezDetectado =
      semSpeechSynthesis || (prefersReducedMotion && (prefersHighContrast || forcedColors));

    this.legendaAtivaSubject.next(perfilSurdezDetectado);
    if (!perfilSurdezDetectado) {
      this.legendaSubject.next('');
    }
  }

  private setLegendaTexto(texto: string): void {
    this.legendaSubject.next(texto);
  }

  private clearLegenda(): void {
    this.legendaSubject.next('');
  }

  cancelarNarracaoAtual(): void {
    this.narrationToken += 1;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.clearLegenda();
  }
}
