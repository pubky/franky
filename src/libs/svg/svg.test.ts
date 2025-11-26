import { describe, expect, it } from 'vitest';
import { createReplyConnectorPath } from './svg';

describe('svg', () => {
  describe('createReplyConnectorPath', () => {
    describe('basic functionality', () => {
      it('creates path data for given post height', () => {
        const result = createReplyConnectorPath(100);

        expect(result).toHaveProperty('path');
        expect(result).toHaveProperty('tailPath');
        expect(result).toHaveProperty('width');
        expect(result).toHaveProperty('height');

        expect(typeof result.path).toBe('string');
        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
      });

      it('creates valid SVG path commands', () => {
        const result = createReplyConnectorPath(200);

        // Path should start with M (move to)
        expect(result.path).toMatch(/^M \d+/);
        // Path should contain v (vertical line)
        expect(result.path).toContain('v');
        // Path should contain a (arc)
        expect(result.path).toContain('a');
        // Path should contain h (horizontal line)
        expect(result.path).toContain('h');
      });

      it('returns correct dimensions based on constants', () => {
        const postHeight = 200;
        const result = createReplyConnectorPath(postHeight);

        // x = 16, R = 8, W = 24
        const expectedWidth = 16 + 8 + 24; // x + R + W = 48
        expect(result.width).toBe(expectedWidth);
      });
    });

    describe('isLast parameter', () => {
      it('includes tailPath when isLast is false', () => {
        const result = createReplyConnectorPath(100, false);

        expect(result.tailPath).not.toBeNull();
        expect(typeof result.tailPath).toBe('string');
        expect(result.tailPath).toMatch(/^M \d+/);
      });

      it('excludes tailPath when isLast is true', () => {
        const result = createReplyConnectorPath(100, true);

        expect(result.tailPath).toBeNull();
      });

      it('defaults to false when isLast not provided', () => {
        const result = createReplyConnectorPath(100);

        expect(result.tailPath).not.toBeNull();
      });

      it('adjusts height based on isLast', () => {
        const postHeight = 200;
        const resultNotLast = createReplyConnectorPath(postHeight, false);
        const resultIsLast = createReplyConnectorPath(postHeight, true);

        // When isLast is true, height should be smaller (no tail)
        expect(resultIsLast.height).toBeLessThan(resultNotLast.height);
      });
    });

    describe('height variations', () => {
      it('handles small post heights', () => {
        const result = createReplyConnectorPath(50);

        expect(result.path).toBeDefined();
        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
      });

      it('handles large post heights', () => {
        const result = createReplyConnectorPath(500);

        expect(result.path).toBeDefined();
        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
      });

      it('enforces minimum height of 100', () => {
        const result1 = createReplyConnectorPath(50);
        const result2 = createReplyConnectorPath(100);

        // Both should use safePostHeight of 100
        expect(result1.path).toBe(result2.path);
      });

      it('handles zero height', () => {
        const result = createReplyConnectorPath(0);

        expect(result.path).toBeDefined();
        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
      });

      it('handles negative height', () => {
        const result = createReplyConnectorPath(-100);

        // Should fall back to minimum height
        expect(result.path).toBeDefined();
        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
      });
    });

    describe('path structure', () => {
      it('creates consistent path structure across different heights', () => {
        const heights = [100, 200, 300, 400];

        heights.forEach((height) => {
          const result = createReplyConnectorPath(height);

          // All paths should have the same structure: M, v, a, h
          const pathParts = result.path.split(' ');
          expect(pathParts[0]).toBe('M'); // Move to
          expect(pathParts.some((part) => part === 'v')).toBe(true); // Vertical line
          expect(pathParts.some((part) => part === 'a')).toBe(true); // Arc
          expect(pathParts.some((part) => part === 'h')).toBe(true); // Horizontal line
        });
      });

      it('starts path at x=16, y=0', () => {
        const result = createReplyConnectorPath(200);

        expect(result.path).toMatch(/^M 16 0/);
      });

      it('includes arc with radius 8', () => {
        const result = createReplyConnectorPath(200);

        // Arc command should include R=8
        expect(result.path).toContain('a 8 8');
      });

      it('includes horizontal line of width 24', () => {
        const result = createReplyConnectorPath(200);

        // Should end with h 24
        expect(result.path).toMatch(/h 24$/);
      });
    });

    describe('tailPath structure', () => {
      it('creates tailPath starting from correct position', () => {
        const result = createReplyConnectorPath(200, false);

        expect(result.tailPath).toMatch(/^M 16/);
      });

      it('creates vertical line in tailPath', () => {
        const result = createReplyConnectorPath(200, false);

        expect(result.tailPath).toContain('v');
      });

      it('tailPath length increases with post height', () => {
        const result1 = createReplyConnectorPath(100, false);
        const result2 = createReplyConnectorPath(300, false);

        // Extract the vertical line length from tailPath
        const getVLength = (path: string | null) => {
          if (!path) return 0;
          const match = path.match(/v (\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        };

        const vLength1 = getVLength(result1.tailPath);
        const vLength2 = getVLength(result2.tailPath);

        expect(vLength2).toBeGreaterThan(vLength1);
      });
    });

    describe('mathematical correctness', () => {
      it('calculates correct curveStartY', () => {
        const postHeight = 200;
        const result = createReplyConnectorPath(postHeight);

        // H = postHeight / 2 = 100
        // R = 8
        // curveStartY = H - R = 92
        const expectedCurveStart = postHeight / 2 - 8;

        // Path should be: M 16 0 v 92 a 8 8 0 0 0 8 8 h 24
        expect(result.path).toContain(`v ${expectedCurveStart}`);
      });

      it('enforces minimum H value of R', () => {
        const postHeight = 10; // This would give H=5, which is < R=8
        const result = createReplyConnectorPath(postHeight);

        // Should use safePostHeight of 100, giving H=50
        // validH = max(H, R) = max(50, 8) = 50
        // curveStartY = 50 - 8 = 42
        expect(result.path).toContain('v 42');
      });

      it('calculates correct viewbox height when not last', () => {
        const postHeight = 200;
        const result = createReplyConnectorPath(postHeight, false);

        // H = 100, R = 8, gapSpacing = 16
        // curveStartY = 92
        // tailHeight = 100 + 8 + 16 = 124
        // vbH = 92 + 124 = 216
        const expectedHeight = 216;

        expect(result.height).toBe(expectedHeight);
      });

      it('calculates correct viewbox height when last', () => {
        const postHeight = 200;
        const result = createReplyConnectorPath(postHeight, true);

        // H = 100, R = 8
        // curveStartY = 92
        // vbH = 92 + 8 = 100
        const expectedHeight = 100;

        expect(result.height).toBe(expectedHeight);
      });
    });

    describe('edge cases', () => {
      it('handles undefined height gracefully', () => {
        // @ts-expect-error - testing runtime behavior
        const result = createReplyConnectorPath(undefined);

        expect(result.path).toBeDefined();
        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
      });

      it('handles null height gracefully', () => {
        // @ts-expect-error - testing runtime behavior
        const result = createReplyConnectorPath(null);

        expect(result.path).toBeDefined();
        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
      });

      it('handles extremely large heights', () => {
        const result = createReplyConnectorPath(10000);

        expect(result.path).toBeDefined();
        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
        expect(Number.isFinite(result.height)).toBe(true);
      });

      it('handles decimal heights', () => {
        const result = createReplyConnectorPath(123.456);

        expect(result.path).toBeDefined();
        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
      });
    });

    describe('consistency', () => {
      it('produces same output for same inputs', () => {
        const result1 = createReplyConnectorPath(200, false);
        const result2 = createReplyConnectorPath(200, false);

        expect(result1.path).toBe(result2.path);
        expect(result1.tailPath).toBe(result2.tailPath);
        expect(result1.width).toBe(result2.width);
        expect(result1.height).toBe(result2.height);
      });

      it('width is constant across different heights', () => {
        const result1 = createReplyConnectorPath(100);
        const result2 = createReplyConnectorPath(500);

        // Width should always be x + R + W = 48
        expect(result1.width).toBe(result2.width);
        expect(result1.width).toBe(48);
      });
    });
  });
});
