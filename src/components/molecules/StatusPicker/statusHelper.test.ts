import { describe, it, expect } from 'vitest';
import { statusHelper, labels, emojis } from './statusHelper';

describe('statusHelper', () => {
  describe('labels', () => {
    it('should export all predefined status labels', () => {
      expect(labels.available).toBe('Available');
      expect(labels.away).toBe('Away');
      expect(labels.vacationing).toBe('Vacationing');
      expect(labels.working).toBe('Working');
      expect(labels.traveling).toBe('Traveling');
      expect(labels.celebrating).toBe('Celebrating');
      expect(labels.sick).toBe('Sick');
      expect(labels.noStatus).toBe('No Status');
      expect(labels.loading).toBe('Loading');
    });

    it('should have all labels as non-empty strings', () => {
      Object.values(labels).forEach((label) => {
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      });
    });

    it('should have consistent keys between labels and emojis', () => {
      const labelKeys = Object.keys(labels).sort();
      const emojiKeys = Object.keys(emojis).sort();
      expect(labelKeys).toEqual(emojiKeys);
    });
  });

  describe('emojis', () => {
    it('should export all predefined status emojis', () => {
      expect(emojis.available).toBe('👋');
      expect(emojis.away).toBe('🕓');
      expect(emojis.vacationing).toBe('🌴');
      expect(emojis.working).toBe('👨‍💻');
      expect(emojis.traveling).toBe('✈️');
      expect(emojis.celebrating).toBe('🥂');
      expect(emojis.sick).toBe('🤒');
      expect(emojis.noStatus).toBe('💭');
      expect(emojis.loading).toBe('⏳');
    });

    it('should have all emojis as non-empty strings', () => {
      Object.values(emojis).forEach((emoji) => {
        expect(typeof emoji).toBe('string');
        expect(emoji.length).toBeGreaterThan(0);
      });
    });

    it('should have emojis that match Unicode emoji pattern', () => {
      Object.values(emojis).forEach((emoji) => {
        // Emojis should match Unicode emoji pattern
        expect(emoji).toMatch(/\p{Extended_Pictographic}/u);
      });
    });
  });

  describe('statusHelper object', () => {
    it('should export statusHelper with labels and emojis', () => {
      expect(statusHelper).toBeDefined();
      expect(statusHelper.labels).toBe(labels);
      expect(statusHelper.emojis).toBe(emojis);
    });

    it('should have all expected status keys', () => {
      const expectedKeys = [
        'available',
        'away',
        'vacationing',
        'working',
        'traveling',
        'celebrating',
        'sick',
        'noStatus',
        'loading',
      ];

      expectedKeys.forEach((key) => {
        expect(statusHelper.labels).toHaveProperty(key);
        expect(statusHelper.emojis).toHaveProperty(key);
      });
    });
  });
});
