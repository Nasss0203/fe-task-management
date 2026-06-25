import { describe, it, expect } from 'vitest';
import { getTaskStatusKey, normalizeTaskStatusName } from '@/lib/task-status-style';

describe('task-status-style', () => {
  describe('normalizeTaskStatusName', () => {
    it('should handle undefined or null', () => {
      expect(normalizeTaskStatusName(undefined)).toBe('');
      expect(normalizeTaskStatusName(null)).toBe('');
    });

    it('should normalize strings by removing accents, spaces, and converting to lowercase', () => {
      expect(normalizeTaskStatusName('Đang thực hiện')).toBe('dangthuchien');
      expect(normalizeTaskStatusName(' Hoàn tất ')).toBe('hoantat');
      expect(normalizeTaskStatusName('In_Progress')).toBe('inprogress');
    });
  });

  describe('getTaskStatusKey', () => {
    it('should return "done" if isDone is true regardless of statusName', () => {
      expect(getTaskStatusKey('todo', true)).toBe('done');
      expect(getTaskStatusKey(undefined, true)).toBe('done');
    });

    it('should return correct key for valid status names', () => {
      expect(getTaskStatusKey('done')).toBe('done');
      expect(getTaskStatusKey('hoantat')).toBe('done');
      expect(getTaskStatusKey('in progress')).toBe('inprogress');
      expect(getTaskStatusKey('Đang thực hiện')).toBe('inprogress');
    });

    it('should default to "todo" for unknown or empty statuses', () => {
      expect(getTaskStatusKey('')).toBe('todo');
      expect(getTaskStatusKey('unknown_status')).toBe('todo');
      expect(getTaskStatusKey(undefined)).toBe('todo');
    });
  });
});
