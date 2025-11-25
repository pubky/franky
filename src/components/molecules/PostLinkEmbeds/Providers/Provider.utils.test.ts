import { describe, it, expect } from 'vitest';
import { convertHmsToSeconds, isUrlSafe } from './Provider.utils';

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

  describe('isUrlSafe', () => {
    describe('valid URLs', () => {
      it('accepts standard HTTP URLs', () => {
        expect(isUrlSafe('http://example.com')).toBe(true);
      });

      it('accepts standard HTTPS URLs', () => {
        expect(isUrlSafe('https://example.com')).toBe(true);
      });

      it('accepts URLs with paths', () => {
        expect(isUrlSafe('https://example.com/path/to/resource')).toBe(true);
      });

      it('accepts URLs with query parameters', () => {
        expect(isUrlSafe('https://example.com/search?q=test&page=1')).toBe(true);
      });

      it('accepts URLs with fragments', () => {
        expect(isUrlSafe('https://example.com/page#section')).toBe(true);
      });

      it('accepts URLs with ports', () => {
        expect(isUrlSafe('https://example.com:8080/api')).toBe(true);
      });

      it('accepts URLs with subdomains', () => {
        expect(isUrlSafe('https://api.example.com')).toBe(true);
        expect(isUrlSafe('https://www.example.com')).toBe(true);
      });

      it('accepts international domains', () => {
        expect(isUrlSafe('https://example.co.uk')).toBe(true);
        expect(isUrlSafe('https://example.org')).toBe(true);
      });

      it('accepts URLs with authentication (username:password)', () => {
        expect(isUrlSafe('https://user:pass@example.com')).toBe(true);
      });
    });

    describe('invalid protocols', () => {
      it('rejects file:// protocol', () => {
        expect(isUrlSafe('file:///etc/passwd')).toBe(false);
      });

      it('rejects ftp:// protocol', () => {
        expect(isUrlSafe('ftp://example.com')).toBe(false);
      });

      it('rejects javascript: protocol', () => {
        expect(isUrlSafe('javascript:alert(1)')).toBe(false);
      });

      it('rejects data: protocol', () => {
        expect(isUrlSafe('data:text/html,<script>alert(1)</script>')).toBe(false);
      });

      it('rejects gopher:// protocol', () => {
        expect(isUrlSafe('gopher://example.com')).toBe(false);
      });

      it('rejects custom protocols', () => {
        expect(isUrlSafe('custom://example.com')).toBe(false);
      });
    });

    describe('localhost blocking', () => {
      it('blocks localhost hostname', () => {
        expect(isUrlSafe('http://localhost')).toBe(false);
        expect(isUrlSafe('https://localhost')).toBe(false);
      });

      it('blocks localhost with port', () => {
        expect(isUrlSafe('http://localhost:3000')).toBe(false);
        expect(isUrlSafe('https://localhost:8080')).toBe(false);
      });

      it('blocks localhost with path', () => {
        expect(isUrlSafe('http://localhost/api/data')).toBe(false);
      });

      it('blocks 127.0.0.1 (IPv4 loopback)', () => {
        expect(isUrlSafe('http://127.0.0.1')).toBe(false);
        expect(isUrlSafe('https://127.0.0.1:8080')).toBe(false);
      });

      it('blocks ::1 (IPv6 loopback)', () => {
        expect(isUrlSafe('http://[::1]')).toBe(false);
        expect(isUrlSafe('https://[::1]:8080')).toBe(false);
      });

      it('blocks 0.0.0.0 (all interfaces)', () => {
        expect(isUrlSafe('http://0.0.0.0')).toBe(false);
        expect(isUrlSafe('https://0.0.0.0:3000')).toBe(false);
      });

      it('blocks localhost case-insensitively', () => {
        expect(isUrlSafe('http://LOCALHOST')).toBe(false);
        expect(isUrlSafe('http://LocalHost')).toBe(false);
        expect(isUrlSafe('http://LoCaLhOsT')).toBe(false);
      });
    });

    describe('private IPv4 ranges blocking', () => {
      it('blocks 10.0.0.0/8 range', () => {
        expect(isUrlSafe('http://10.0.0.1')).toBe(false);
        expect(isUrlSafe('http://10.255.255.255')).toBe(false);
        expect(isUrlSafe('http://10.1.2.3')).toBe(false);
      });

      it('blocks 172.16.0.0/12 range', () => {
        expect(isUrlSafe('http://172.16.0.1')).toBe(false);
        expect(isUrlSafe('http://172.31.255.255')).toBe(false);
        expect(isUrlSafe('http://172.20.1.1')).toBe(false);
      });

      it('allows 172.x outside private range', () => {
        expect(isUrlSafe('http://172.15.0.1')).toBe(true); // Just before range
        expect(isUrlSafe('http://172.32.0.1')).toBe(true); // Just after range
      });

      it('blocks 192.168.0.0/16 range', () => {
        expect(isUrlSafe('http://192.168.0.1')).toBe(false);
        expect(isUrlSafe('http://192.168.255.255')).toBe(false);
        expect(isUrlSafe('http://192.168.1.1')).toBe(false);
      });

      it('blocks 169.254.0.0/16 link-local range', () => {
        expect(isUrlSafe('http://169.254.0.1')).toBe(false);
        expect(isUrlSafe('http://169.254.169.254')).toBe(false); // AWS metadata endpoint
        expect(isUrlSafe('http://169.254.255.255')).toBe(false);
      });

      it('allows similar but non-private IPs', () => {
        expect(isUrlSafe('http://11.0.0.1')).toBe(true); // Not in 10.x range
        expect(isUrlSafe('http://192.167.1.1')).toBe(true); // Not 192.168
        expect(isUrlSafe('http://169.253.1.1')).toBe(true); // Not 169.254
      });
    });

    describe('private IPv6 ranges blocking', () => {
      it('blocks fc00::/7 unique local addresses', () => {
        expect(isUrlSafe('http://[fd00::1]')).toBe(false);
        expect(isUrlSafe('http://[fd12:3456:789a::1]')).toBe(false);
        expect(isUrlSafe('http://[fdff:ffff:ffff::1]')).toBe(false);
      });

      it('blocks fe80::/10 link-local addresses', () => {
        expect(isUrlSafe('http://[fe80::1]')).toBe(false);
        expect(isUrlSafe('http://[fe80:1234:5678::abcd]')).toBe(false);
      });

      it('allows public IPv6 addresses', () => {
        expect(isUrlSafe('http://[2001:db8::1]')).toBe(true); // Documentation range, but not blocked
        expect(isUrlSafe('http://[2606:2800:220:1:248:1893:25c8:1946]')).toBe(true); // example.com IPv6
      });
    });

    describe('SSRF attack vectors', () => {
      it('blocks AWS metadata endpoint', () => {
        expect(isUrlSafe('http://169.254.169.254/latest/meta-data/')).toBe(false);
      });

      it('blocks internal network access', () => {
        expect(isUrlSafe('http://192.168.1.1/admin')).toBe(false);
        expect(isUrlSafe('http://10.0.0.1/internal-api')).toBe(false);
      });

      it('blocks localhost with various paths', () => {
        expect(isUrlSafe('http://localhost/admin')).toBe(false);
        expect(isUrlSafe('http://127.0.0.1/metrics')).toBe(false);
      });
    });

    describe('malformed URLs', () => {
      it('rejects invalid URL format', () => {
        expect(isUrlSafe('not a url')).toBe(false);
      });

      it('rejects empty string', () => {
        expect(isUrlSafe('')).toBe(false);
      });

      it('rejects URLs without protocol', () => {
        expect(isUrlSafe('example.com')).toBe(false);
      });

      it('rejects URLs with only protocol', () => {
        expect(isUrlSafe('http://')).toBe(false);
      });

      it('rejects malformed protocols', () => {
        expect(isUrlSafe('ht!tp://example.com')).toBe(false);
      });

      it('rejects URLs with spaces', () => {
        expect(isUrlSafe('http://example .com')).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('handles URLs with encoded characters', () => {
        expect(isUrlSafe('https://example.com/%2Fpath')).toBe(true);
      });

      it('handles URLs with special characters in path', () => {
        expect(isUrlSafe('https://example.com/path?q=test&foo=bar')).toBe(true);
      });

      it('handles very long URLs', () => {
        const longPath = '/path/' + 'a'.repeat(1000);
        expect(isUrlSafe('https://example.com' + longPath)).toBe(true);
      });

      it('handles URLs with multiple subdomains', () => {
        expect(isUrlSafe('https://api.v1.staging.example.com')).toBe(true);
      });

      it('handles IP addresses with ports', () => {
        expect(isUrlSafe('http://10.0.0.1:8080')).toBe(false);
        expect(isUrlSafe('http://8.8.8.8:80')).toBe(true); // Public IP
      });

      it('handles IPv6 with ports', () => {
        expect(isUrlSafe('http://[::1]:3000')).toBe(false);
        expect(isUrlSafe('http://[2001:db8::1]:8080')).toBe(true);
      });

      it('is case-insensitive for protocols', () => {
        expect(isUrlSafe('HTTP://example.com')).toBe(true);
        expect(isUrlSafe('HTTPS://example.com')).toBe(true);
      });

      it('handles trailing slashes', () => {
        expect(isUrlSafe('https://example.com/')).toBe(true);
        expect(isUrlSafe('http://localhost/')).toBe(false);
      });
    });

    describe('real-world examples', () => {
      it('accepts common video platforms', () => {
        expect(isUrlSafe('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
        expect(isUrlSafe('https://vimeo.com/123456789')).toBe(true);
      });

      it('accepts common social media', () => {
        expect(isUrlSafe('https://twitter.com/user/status/123')).toBe(true);
        expect(isUrlSafe('https://facebook.com/page')).toBe(true);
      });

      it('accepts CDN URLs', () => {
        expect(isUrlSafe('https://cdn.example.com/images/photo.jpg')).toBe(true);
      });

      it('accepts API endpoints', () => {
        expect(isUrlSafe('https://api.github.com/users/octocat')).toBe(true);
      });
    });

    describe('defense in depth', () => {
      it('returns boolean (never throws)', () => {
        const testCases = ['https://example.com', 'http://localhost', 'invalid url', '', 'javascript:alert(1)'];

        testCases.forEach((url) => {
          const result = isUrlSafe(url);
          expect(typeof result).toBe('boolean');
        });
      });

      it('handles null/undefined gracefully', () => {
        // @ts-expect-error - testing runtime behavior
        expect(isUrlSafe(null)).toBe(false);
        // @ts-expect-error - testing runtime behavior
        expect(isUrlSafe(undefined)).toBe(false);
      });

      it('handles non-string inputs gracefully', () => {
        // @ts-expect-error - testing runtime behavior
        expect(isUrlSafe(123)).toBe(false);
        // @ts-expect-error - testing runtime behavior
        expect(isUrlSafe({})).toBe(false);
        // @ts-expect-error - testing runtime behavior
        expect(isUrlSafe([])).toBe(false);
      });
    });
  });
});
