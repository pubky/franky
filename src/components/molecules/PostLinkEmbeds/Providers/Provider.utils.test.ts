import { describe, it, expect } from 'vitest';
import { convertHmsToSeconds } from './Provider.utils';

describe('Provider.utils', () => {
  describe('convertHmsToSeconds', () => {
    describe('valid inputs', () => {
      it('converts hours, minutes, and seconds correctly', () => {
        expect(convertHmsToSeconds('1', '2', '3')).toBe(3723); // 1*3600 + 2*60 + 3
      });

      it('converts hours and minutes only', () => {
        expect(convertHmsToSeconds('1', '30', undefined)).toBe(5400); // 1*3600 + 30*60
      });

      it('converts minutes and seconds only', () => {
        expect(convertHmsToSeconds(undefined, '5', '30')).toBe(330); // 5*60 + 30
      });

      it('converts seconds only', () => {
        expect(convertHmsToSeconds(undefined, undefined, '45')).toBe(45);
      });

      it('converts hours only', () => {
        expect(convertHmsToSeconds('2', undefined, undefined)).toBe(7200); // 2*3600
      });

      it('converts minutes only', () => {
        expect(convertHmsToSeconds(undefined, '10', undefined)).toBe(600); // 10*60
      });

      it('handles zero values', () => {
        expect(convertHmsToSeconds('0', '0', '0')).toBe(0);
      });

      it('handles all undefined values as zero', () => {
        expect(convertHmsToSeconds(undefined, undefined, undefined)).toBe(0);
      });

      it('handles empty strings as zero', () => {
        expect(convertHmsToSeconds('', '', '')).toBe(0);
      });

      it('handles large numbers', () => {
        expect(convertHmsToSeconds('10', '30', '45')).toBe(37845); // 10*3600 + 30*60 + 45
      });
    });

    describe('invalid inputs (NaN protection)', () => {
      it('returns null for non-numeric hours', () => {
        expect(convertHmsToSeconds('abc', '2', '3')).toBeNull();
      });

      it('returns null for non-numeric minutes', () => {
        expect(convertHmsToSeconds('1', 'xyz', '3')).toBeNull();
      });

      it('returns null for non-numeric seconds', () => {
        expect(convertHmsToSeconds('1', '2', 'invalid')).toBeNull();
      });

      it('returns null when all values are non-numeric', () => {
        expect(convertHmsToSeconds('abc', 'def', 'ghi')).toBeNull();
      });

      it('returns null for mixed valid and invalid values', () => {
        expect(convertHmsToSeconds('1', 'bad', '3')).toBeNull();
        expect(convertHmsToSeconds('bad', '2', '3')).toBeNull();
        expect(convertHmsToSeconds('1', '2', 'bad')).toBeNull();
      });

      it('returns null for special string values', () => {
        expect(convertHmsToSeconds('NaN', '0', '0')).toBeNull();
        expect(convertHmsToSeconds('Infinity', '0', '0')).toBeNull();
        expect(convertHmsToSeconds('-Infinity', '0', '0')).toBeNull();
      });
    });

    describe('edge cases', () => {
      it('handles whitespace-only strings as NaN (returns null)', () => {
        expect(convertHmsToSeconds('   ', '0', '0')).toBeNull();
        expect(convertHmsToSeconds('0', '  ', '0')).toBeNull();
        expect(convertHmsToSeconds('0', '0', '\t')).toBeNull();
      });

      it('handles negative numbers correctly', () => {
        // parseInt handles negative numbers, so this should work
        // but results in negative total seconds (which might be invalid for timestamps)
        expect(convertHmsToSeconds('-1', '0', '0')).toBe(-3600);
      });

      it('handles numeric strings with trailing characters correctly', () => {
        // parseInt stops at first non-numeric character
        expect(convertHmsToSeconds('5x', '0', '0')).toBe(18000); // parseInt('5x') = 5
        expect(convertHmsToSeconds('10abc', '0', '0')).toBe(36000); // parseInt('10abc') = 10
      });

      it('handles leading zeros correctly', () => {
        expect(convertHmsToSeconds('01', '02', '03')).toBe(3723);
        expect(convertHmsToSeconds('001', '002', '003')).toBe(3723);
      });

      it('does not prevent NaN from null values in strict mode', () => {
        // @ts-expect-error - testing runtime behavior with null
        expect(convertHmsToSeconds(null, null, null)).toBe(0);
      });
    });

    describe('defense in depth validation', () => {
      it('prevents NaN propagation in calculations', () => {
        const result = convertHmsToSeconds('invalid', '2', '3');
        expect(result).toBeNull();
        // Verify we don't get NaN in calculations
        expect(Number.isNaN(result)).toBe(false);
      });

      it('ensures return type is always number or null', () => {
        const validResult = convertHmsToSeconds('1', '2', '3');
        const invalidResult = convertHmsToSeconds('abc', '2', '3');

        expect(typeof validResult === 'number' || validResult === null).toBe(true);
        expect(typeof invalidResult === 'number' || invalidResult === null).toBe(true);
      });

      it('handles all possible combinations of valid/invalid inputs', () => {
        const testCases = [
          { input: ['1', '2', '3'], shouldBeNull: false },
          { input: ['x', '2', '3'], shouldBeNull: true },
          { input: ['1', 'x', '3'], shouldBeNull: true },
          { input: ['1', '2', 'x'], shouldBeNull: true },
          { input: ['x', 'x', '3'], shouldBeNull: true },
          { input: ['x', '2', 'x'], shouldBeNull: true },
          { input: ['1', 'x', 'x'], shouldBeNull: true },
          { input: ['x', 'x', 'x'], shouldBeNull: true },
        ];

        testCases.forEach(({ input, shouldBeNull }) => {
          const result = convertHmsToSeconds(input[0] as string, input[1] as string, input[2] as string);
          if (shouldBeNull) {
            expect(result).toBeNull();
          } else {
            expect(result).not.toBeNull();
            expect(typeof result).toBe('number');
          }
        });
      });
    });
  });
});
