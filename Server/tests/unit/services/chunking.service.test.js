// File: tests/unit/services/chunking.service.test.js

import { describe, it, expect } from 'vitest';
import { chunkText } from '../../../src/services/chunking.service.js';

describe('chunkText', () => {
  it('returns a single chunk for short text', async () => {
    const chunks = await chunkText('This is a short sentence.');

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe('This is a short sentence.');
  });

  it('splits long text into multiple chunks', async () => {
    const sentence = 'The quick brown fox jumps over the lazy dog. ';
    const longText = sentence.repeat(60);

    const chunks = await chunkText(longText);

    expect(chunks.length).toBeGreaterThan(1);

    // Check chunk size
    chunks.forEach((chunk) => {
      expect(chunk.length).toBeLessThanOrEqual(1100);
    });
  });

  it('returns an empty array for empty input', async () => {
    const chunks = await chunkText('');

    expect(chunks).toEqual([]);
  });

  it('preserves overlap between chunks', async () => {
    const sentence = 'Alpha bravo charlie delta echo foxtrot golf hotel india juliet. ';
    const longText = sentence.repeat(30);

    const chunks = await chunkText(longText);

    expect(chunks[0]).toContain('Alpha bravo charlie');
    expect(chunks[chunks.length - 1]).toContain('juliet');
  });
});