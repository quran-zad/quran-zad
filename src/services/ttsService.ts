// Text-to-Speech (TTS) Service for Arabic Tafsir and Text Narration
export interface TtsState {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  currentWordIndex?: number;
  currentSentence?: string;
  rate: number; // 0.8, 1.0, 1.2
  voiceName?: string;
}

export interface TtsOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onPause?: () => void;
  onResume?: () => void;
  onBoundary?: (charIndex: number, text: string) => void;
}

class TtsServiceManager {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isVoicesLoaded = false;
  private keepAliveInterval: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    if (this.voices.length > 0) {
      this.isVoicesLoaded = true;
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public getArabicVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    const all = this.synth.getVoices();
    return all.filter(v => v.lang.startsWith('ar') || v.lang.includes('AR') || v.lang.includes('arb'));
  }

  public getVoicesForLang(langCode: string): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    const all = this.synth.getVoices();
    return all.filter(v => v.lang.toLowerCase().startsWith(langCode.toLowerCase()));
  }

  /**
   * Cleans text for better TTS pronunciation (removes footnotes, special Quran brackets if needed)
   */
  public cleanArabicTextForTts(text: string): string {
    if (!text) return '';
    return text
      .replace(/[﴿﴾]/g, '')
      .replace(/[\(\[\{][0-9٠-٩]+[\)\]\}]/g, '')
      .replace(/[*_#~]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Speak Arabic Tafsir text with natural chunking and Chrome pause-workaround
   */
  public speak(text: string, options: TtsOptions = {}): void {
    if (!this.synth) {
      options.onError?.(new Error('تقنية تحويل النص إلى كلام غير مدعومة في هذا المتصفح'));
      return;
    }

    // Cancel any ongoing speech
    this.stop();

    const cleanedText = this.cleanArabicTextForTts(text);
    if (!cleanedText) return;

    const rate = options.rate ?? 1.0;
    const pitch = options.pitch ?? 1.0;
    const lang = options.lang ?? 'ar-SA';

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Pick best Arabic voice
    const arVoices = this.getArabicVoices();
    if (arVoices.length > 0) {
      // Prioritize natural / Google / high-quality Arabic voices
      const preferred = arVoices.find(v => 
        v.name.includes('Google') || 
        v.name.includes('Natural') || 
        v.name.includes('Maged') || 
        v.name.includes('Tarik') ||
        v.lang === 'ar-SA'
      ) || arVoices[0];
      utterance.voice = preferred;
    }

    utterance.onstart = () => {
      this.startKeepAlive();
      options.onStart?.();
    };

    utterance.onend = () => {
      this.stopKeepAlive();
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.stopKeepAlive();
      this.currentUtterance = null;
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        options.onError?.(e);
      }
    };

    utterance.onpause = () => {
      options.onPause?.();
    };

    utterance.onresume = () => {
      options.onResume?.();
    };

    utterance.onboundary = (e) => {
      if (e.name === 'word' || e.name === 'sentence') {
        options.onBoundary?.(e.charIndex, cleanedText);
      }
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause(): void {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  public resume(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public stop(): void {
    this.stopKeepAlive();
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  public isSpeaking(): boolean {
    return !!this.synth && this.synth.speaking && !this.synth.paused;
  }

  public isPaused(): boolean {
    return !!this.synth && this.synth.paused;
  }

  // Workaround for Chrome bug where speechSynthesis gets stuck or pauses after 15 seconds
  private startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveInterval = setInterval(() => {
      if (!this.synth || !this.synth.speaking) {
        this.stopKeepAlive();
        return;
      }
      if (!this.synth.paused) {
        this.synth.pause();
        this.synth.resume();
      }
    }, 10000);
  }

  private stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }
}

export const TtsService = new TtsServiceManager();
