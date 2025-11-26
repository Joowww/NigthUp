import { bannedWords, wordSeverity, allBannedWords } from '../moderation/bannedWords';
import { bullyingPatterns, allBullyingPatterns, patternSeverity } from '../moderation/bullyingPatterns';

export interface ModerationResult {
  isAllowed: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical' | null;
  detectedWords: string[];
  detectedPatterns: string[];
  reason: string;
  sanitizedMessage?: string;
}

class ContentModerationService {
    private normalizeText(text: string): string {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
        .replace(/[^a-z0-9\s]/g, ' '); // Reemplaza caracteres especiales
    }
  
    checkBannedWords(message: string): { found: string[]; maxSeverity: string | null } {
      const normalized = this.normalizeText(message);
      const foundWords: string[] = [];
  
      for (const word of allBannedWords) {
        const normalizedWord = this.normalizeText(word);
        const regex = new RegExp(`\\b${normalizedWord}\\b`, 'i');
        
        if (regex.test(normalized)) {
          foundWords.push(word);
        }
      }
  
      const maxSeverity = foundWords.length > 0
        ? this.getMaxSeverity(foundWords.map(w => wordSeverity[w]))
        : null;
  
      return { found: foundWords, maxSeverity };
    }
  
    checkBullyingPatterns(message: string): { found: string[]; severity: string | null } {
      const foundPatterns: string[] = [];
  
      for (const [category, patterns] of Object.entries(bullyingPatterns)) {
        for (const pattern of patterns) {
          if (pattern.test(message)) {
            foundPatterns.push(category);
            break;
          }
        }
      }
  
      return {
        found: foundPatterns,
        severity: foundPatterns.length > 0 ? 'critical' : null
      };
    }
  
    private sanitizeMessage(message: string, detectedWords: string[]): string {
      let sanitized = message;
  
      for (const word of detectedWords) {
        const normalizedWord = this.normalizeText(word);
        const regex = new RegExp(`\\b${normalizedWord}\\b`, 'gi');
        
        sanitized = sanitized.replace(regex, (match) => '*'.repeat(match.length));
      }
  
      return sanitized;
    }
  
    private getMaxSeverity(severities: string[]): 'low' | 'medium' | 'high' | 'critical' {
      const order = { low: 1, medium: 2, high: 3, critical: 4 };
      return severities.reduce((max, curr) => 
        order[curr as keyof typeof order] > order[max as keyof typeof order] ? curr : max
      ) as 'low' | 'medium' | 'high' | 'critical';
    }
  
    moderateMessage(message: string): ModerationResult {
      const wordsCheck = this.checkBannedWords(message);
      const patternsCheck = this.checkBullyingPatterns(message);
  
      const allDetections = [wordsCheck.maxSeverity, patternsCheck.severity].filter(Boolean);
      const finalSeverity = allDetections.length > 0 
        ? this.getMaxSeverity(allDetections as string[])
        : null;
  
      // Criterios de bloqueo
      const shouldBlock = finalSeverity === 'critical' || 
                         finalSeverity === 'high' ||
                         (finalSeverity === 'medium' && wordsCheck.found.length > 2);
  
      const sanitizedMessage = wordsCheck.found.length > 0 
        ? this.sanitizeMessage(message, wordsCheck.found)
        : message;
  
      return {
        isAllowed: !shouldBlock,
        severity: finalSeverity,
        detectedWords: wordsCheck.found,
        detectedPatterns: patternsCheck.found,
        reason: this.generateReason(finalSeverity, patternsCheck.found),
        sanitizedMessage: sanitizedMessage
      };
    }
  
    private generateReason(severity: string | null, patterns: string[]): string {
      if (!severity) return '';
  
      if (patterns.includes('suicide') || patterns.includes('threats')) {
        return 'Mensaje bloqueado: Contiene amenazas graves o incitación al daño';
      }
      if (patterns.includes('sexualHarassment')) {
        return 'Mensaje bloqueado: Contiene acoso sexual';
      }
      if (patterns.includes('doxxing')) {
        return 'Mensaje bloqueado: Posible intento de doxxing';
      }
      if (severity === 'critical') {
        return 'Mensaje bloqueado: Contenido extremadamente inapropiado';
      }
      if (severity === 'high') {
        return 'Mensaje bloqueado: Lenguaje ofensivo grave';
      }
      if (severity === 'medium') {
        return 'Mensaje bloqueado: Contenido inapropiado';
      }
      
      return 'Evita usar lenguaje inapropiado';
    }
  }
export const contentModerationService = new ContentModerationService();