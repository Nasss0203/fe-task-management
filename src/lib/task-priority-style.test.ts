import { describe, it, expect } from 'vitest';
import { getTaskPriorityKey, normalizeTaskPriorityName } from './task-priority-style';

describe('task-priority-style', () => {
  describe('normalizeTaskPriorityName', () => {
    it('should handle undefined or null', () => {
      expect(normalizeTaskPriorityName(undefined)).toBe('');
      expect(normalizeTaskPriorityName(null)).toBe('');
    });

    it('should normalize strings correctly', () => {
      expect(normalizeTaskPriorityName(' Cao ')).toBe('cao');
      expect(normalizeTaskPriorityName('Trung bình')).toBe('trungbinh');
      expect(normalizeTaskPriorityName('Thấp')).toBe('thap');
    });
  });

  describe('getTaskPriorityKey', () => {
    it('should map to correct priority keys', () => {
      expect(getTaskPriorityKey('high')).toBe('high');
      expect(getTaskPriorityKey('cao')).toBe('high');
      expect(getTaskPriorityKey('medium')).toBe('medium');
      expect(getTaskPriorityKey('trung bình')).toBe('medium');
      expect(getTaskPriorityKey('low')).toBe('low');
      expect(getTaskPriorityKey('thấp')).toBe('low');
    });

    it('should fallback to "none" for unknown values', () => {
      expect(getTaskPriorityKey('critical')).toBe('none');
      expect(getTaskPriorityKey('')).toBe('none');
      expect(getTaskPriorityKey(undefined)).toBe('none');
    });
  });
});
