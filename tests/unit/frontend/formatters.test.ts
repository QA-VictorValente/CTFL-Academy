import { describe, it, expect } from 'vitest';
import {
  formatDurationSeconds,
  formatDateBR,
  formatDateTimeBR,
  cn,
} from '@/shared/utils/formatters';

describe('Frontend Unit Tests — Formatadores e Utilitários de UI', () => {
  it('formata segundos para MM:SS corretamente', () => {
    expect(formatDurationSeconds(0)).toBe('00:00');
    expect(formatDurationSeconds(59)).toBe('00:59');
    expect(formatDurationSeconds(60)).toBe('01:00');
    expect(formatDurationSeconds(3600)).toBe('60:00');
    expect(formatDurationSeconds(90)).toBe('01:30');
    expect(formatDurationSeconds(-10)).toBe('00:00');
  });

  it('formata datas para o padrão pt-BR de forma resiliente', () => {
    expect(formatDateBR(null)).toBe('—');
    expect(formatDateBR(undefined)).toBe('—');
    expect(formatDateBR('data-invalida')).toBe('—');

    const sampleDate = new Date('2026-10-15T12:00:00Z');
    expect(formatDateBR(sampleDate)).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(formatDateTimeBR(sampleDate)).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('mescla classes CSS com cn (tailwind-merge + clsx)', () => {
    const result = cn(
      'p-4 bg-red-500',
      true && 'text-white',
      false && 'hidden',
      'bg-blue-500' // sobrescreve bg-red-500
    );
    expect(result).toBe('p-4 text-white bg-blue-500');
  });
});
