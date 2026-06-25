import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000/api";

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
});

if (typeof window !== "undefined") {
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.setPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
}
