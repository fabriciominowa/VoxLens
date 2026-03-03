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

  private readonly legendaSubject = new BehaviorSubject<string>('');
  readonly legenda$ = this.legendaSubject.asObservable();

  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.availableVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        this.availableVoices = window.speechSynthesis.getVoices();
      });
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
    const textoLimpo = texto.trim();
    if (!textoLimpo) {
      return;
    }

    this.gerarNarracao(textoLimpo, idioma, contexto).subscribe((fala) => {
      this.falar(fala, idioma);
    });
  }

  falar(texto: string, lang?: string): void {
    const textoLimpo = texto.trim();
    if (!textoLimpo) {
      return;
    }

    this.legendaSubject.next(textoLimpo);
    void this.liveAnnouncer.announce(textoLimpo, 'polite');

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const targetLang = this.toSpeechLanguage(lang ?? this.i18n.language());
    const utterance = new SpeechSynthesisUtterance(textoLimpo);
    utterance.lang = targetLang;
    utterance.voice = this.pickVoice(targetLang);
    utterance.rate = 1;
    utterance.pitch = 1;

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
    if (exactVoice) {
      return exactVoice;
    }

    const languageVoice = this.availableVoices.find((voice) =>
      voice.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase())
    );
    return languageVoice ?? null;
  }
}
