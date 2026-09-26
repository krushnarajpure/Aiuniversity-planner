"use client";

type RecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript?: string }>>;
};

type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: RecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};
type RecognitionConstructor = new () => Recognition;

export class MyraaWakeWordDetector {
  private recognition: Recognition | null = null;
  private running = false;
  private phrase = "hey myraa";
  private callback: (() => void) | null = null;

  start(callback: () => void, phrase = "hey myraa") {
    const speechWindow = window as Window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
    const Constructor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Constructor) return false;
    this.phrase = phrase.toLowerCase();
    this.callback = callback;
    this.running = true;
    this.launch(Constructor);
    return true;
  }

  stop() {
    this.running = false;
    this.recognition?.abort();
    this.recognition = null;
  }

  private launch(Constructor: RecognitionConstructor) {
    if (!this.running) return;
    const recognition = new Constructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";
    recognition.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = String(event.results[index]?.[0]?.transcript || "").toLowerCase();
        if (transcript.includes(this.phrase)) {
          this.callback?.();
          recognition.stop();
          return;
        }
      }
    };
    recognition.onerror = () => undefined;
    recognition.onend = () => {
      this.recognition = null;
      if (this.running) window.setTimeout(() => this.launch(Constructor), 500);
    };
    this.recognition = recognition;
    try { recognition.start(); } catch { this.recognition = null; }
  }
}