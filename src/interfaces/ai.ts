export interface DetectedLanguageResult {
  detectedLanguage: string;
  confidence: number;
}

export interface LanguageDetectorOptions {
  expectedInputLanguages: string[];
}

export interface LanguageDetectorInstance {
  detect(text: string): Promise<DetectedLanguageResult[]>;
}

export interface LanguageDetectorFactory {
  create(options: LanguageDetectorOptions): Promise<LanguageDetectorInstance>;
}

export interface TranslatorOptions {
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslatorInstance {
  translate(text: string): Promise<string>;
}

export interface TranslatorFactory {
  create(options: TranslatorOptions): Promise<TranslatorInstance>;
}

export type SummarizerType = "tldr" | "teaser" | "headline" | "key-points";
export type SummarizerLength = "short" | "medium" | "long";
export type SummarizerFormat = "plain-text" | "markdown";

export interface SummarizerOptions {
  sharedContext: string;
  type: SummarizerType;
  length: SummarizerLength;
  format: SummarizerFormat;
  expectedInputLanguages: string[];
  outputLanguage: string;
}

export interface SummarizerInstance {
  summarize(text: string): Promise<string>;
}

export interface SummarizerFactory {
  create(options: SummarizerOptions): Promise<SummarizerInstance>;
}
