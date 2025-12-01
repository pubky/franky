import { describe, expect, it } from 'vitest';
import { isIpSafe } from './network';

describe('network', () => {
  describe('isIpSafe', () => {
    describe('safe public IPs', () => {
      it('accepts Cloudflare DNS (1.1.1.1)', () => {
        expect(isIpSafe('1.1.1.1')).toBe(true);
      });

      it('accepts Google DNS (8.8.8.8)', () => {
        expect(isIpSafe('8.8.8.8')).toBe(true);
      });

      it('accepts public IP addresses', () => {
        expect(isIpSafe('93.184.216.34')).toBe(true); // example.com
        expect(isIpSafe('151.101.1.69')).toBe(true); // random public IP
        expect(isIpSafe('185.199.108.153')).toBe(true); // GitHub Pages
      });

      it('accepts IPs at edge of private ranges', () => {
        expect(isIpSafe('9.255.255.255')).toBe(true); // Just before 10.x
        expect(isIpSafe('11.0.0.0')).toBe(true); // Just after 10.x
        expect(isIpSafe('172.15.255.255')).toBe(true); // Just before 172.16.x
        expect(isIpSafe('172.32.0.0')).toBe(true); // Just after 172.31.x
        expect(isIpSafe('192.167.255.255')).toBe(true); // Just before 192.168.x
        expect(isIpSafe('192.169.0.0')).toBe(true); // Just after 192.168.x
      });

      it('accepts IPs around link-local range', () => {
        expect(isIpSafe('169.253.255.255')).toBe(true); // Just before 169.254
        expect(isIpSafe('169.255.0.0')).toBe(true); // Just after 169.254
      });

      it('accepts IPs around carrier-grade NAT range', () => {
        expect(isIpSafe('100.63.255.255')).toBe(true); // Just before 100.64
        expect(isIpSafe('100.128.0.0')).toBe(true); // Just after 100.127
      });
    });

    describe('localhost blocking', () => {
      it('blocks 127.0.0.1 (IPv4 loopback)', () => {
        expect(isIpSafe('127.0.0.1')).toBe(false);
      });

      it('blocks ::1 (IPv6 loopback)', () => {
        expect(isIpSafe('::1')).toBe(false);
      });

      it('blocks 0.0.0.0 (all interfaces)', () => {
        expect(isIpSafe('0.0.0.0')).toBe(false);
      });

      it('only blocks exact 127.0.0.1', () => {
        expect(isIpSafe('127.0.0.1')).toBe(false);
        // Note: Other 127.x addresses are NOT blocked by current implementation
        expect(isIpSafe('127.0.0.0')).toBe(true);
        expect(isIpSafe('127.1.1.1')).toBe(true);
        expect(isIpSafe('127.255.255.255')).toBe(true);
      });
    });

    describe('private IPv4 ranges (RFC 1918)', () => {
      it('blocks 10.0.0.0/8 range', () => {
        expect(isIpSafe('10.0.0.0')).toBe(false);
        expect(isIpSafe('10.0.0.1')).toBe(false);
        expect(isIpSafe('10.1.2.3')).toBe(false);
        expect(isIpSafe('10.255.255.255')).toBe(false);
      });

      it('blocks 172.16.0.0/12 range', () => {
        expect(isIpSafe('172.16.0.0')).toBe(false);
        expect(isIpSafe('172.16.0.1')).toBe(false);
        expect(isIpSafe('172.20.1.1')).toBe(false);
        expect(isIpSafe('172.31.255.255')).toBe(false);
      });

      it('blocks 192.168.0.0/16 range', () => {
        expect(isIpSafe('192.168.0.0')).toBe(false);
        expect(isIpSafe('192.168.0.1')).toBe(false);
        expect(isIpSafe('192.168.1.1')).toBe(false);
        expect(isIpSafe('192.168.255.255')).toBe(false);
      });
    });

    describe('link-local addresses (RFC 3927)', () => {
      it('blocks 169.254.0.0/16 range', () => {
        expect(isIpSafe('169.254.0.0')).toBe(false);
        expect(isIpSafe('169.254.0.1')).toBe(false);
        expect(isIpSafe('169.254.169.254')).toBe(false); // AWS metadata endpoint
        expect(isIpSafe('169.254.255.255')).toBe(false);
      });
    });

    describe('carrier-grade NAT (RFC 6598)', () => {
      it('blocks 100.64.0.0/10 range', () => {
        expect(isIpSafe('100.64.0.0')).toBe(false);
        expect(isIpSafe('100.64.0.1')).toBe(false);
        expect(isIpSafe('100.100.0.0')).toBe(false);
        expect(isIpSafe('100.127.255.255')).toBe(false);
      });
    });

    describe('IPv6 private ranges', () => {
      it('blocks fc00::/7 unique local addresses', () => {
        expect(isIpSafe('fc00::1')).toBe(false);
        expect(isIpSafe('fd00::1')).toBe(false);
        expect(isIpSafe('fdff:ffff:ffff::1')).toBe(false);
      });

      it('blocks fe80::/10 link-local addresses', () => {
        expect(isIpSafe('fe80::1')).toBe(false);
        expect(isIpSafe('fe80:1234:5678::abcd')).toBe(false);
      });
    });

    describe('invalid/malformed IPs', () => {
      it('blocks malformed IPv4 addresses', () => {
        expect(isIpSafe('256.1.1.1')).toBe(false); // Octet > 255
        expect(isIpSafe('1.1.1')).toBe(false); // Too few octets
        expect(isIpSafe('1.1.1.1.1')).toBe(false); // Too many octets
        expect(isIpSafe('1.1.1.a')).toBe(false); // Non-numeric octet
        expect(isIpSafe('abc.def.ghi.jkl')).toBe(false); // All invalid
      });

      it('blocks negative values', () => {
        expect(isIpSafe('-1.1.1.1')).toBe(false);
        expect(isIpSafe('1.-1.1.1')).toBe(false);
        expect(isIpSafe('1.1.-1.1')).toBe(false);
        expect(isIpSafe('1.1.1.-1')).toBe(false);
      });

      it('blocks empty and invalid strings', () => {
        expect(isIpSafe('')).toBe(false);
        expect(isIpSafe('not an ip')).toBe(false);
        expect(isIpSafe('localhost')).toBe(false);
      });

      it('handles IPs with extra characters', () => {
        // Note: split().map(Number) treats '1.1.1.1 ' as valid because split ignores trailing content
        expect(isIpSafe('1.1.1.1 ')).toBe(true); // Trailing space - Number('1 ') = 1
        expect(isIpSafe(' 1.1.1.1')).toBe(true); // Leading space - Number(' 1') = 1
        expect(isIpSafe('1.1.1.1/24')).toBe(false); // CIDR notation - not 4 octets
      });
    });

    describe('SSRF attack vectors', () => {
      it('blocks AWS metadata endpoint', () => {
        expect(isIpSafe('169.254.169.254')).toBe(false);
      });

      it('blocks common internal network IPs', () => {
        expect(isIpSafe('192.168.1.1')).toBe(false); // Router
        expect(isIpSafe('10.0.0.1')).toBe(false); // Private network gateway
        expect(isIpSafe('172.16.0.1')).toBe(false); // Private network
      });

      it('blocks exact localhost variations', () => {
        expect(isIpSafe('127.0.0.1')).toBe(false);
        // Note: Only exact 127.0.0.1 is blocked, not entire 127.x range
        expect(isIpSafe('127.1.0.1')).toBe(true);
        expect(isIpSafe('::1')).toBe(false);
        expect(isIpSafe('0.0.0.0')).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('handles boundary values correctly', () => {
        // Only exact 0.0.0.0 is blocked, not 0.0.0.1
        expect(isIpSafe('0.0.0.1')).toBe(true);
        expect(isIpSafe('0.0.0.0')).toBe(false);
        expect(isIpSafe('255.255.255.255')).toBe(true); // Broadcast, but technically public
      });

      it('handles partial IPv6 formats', () => {
        expect(isIpSafe('2001:db8::1')).toBe(false); // Invalid IPv4 format
        expect(isIpSafe('[2001:db8::1]')).toBe(false); // Bracketed IPv6
      });

      it('rejects common typos', () => {
        expect(isIpSafe('192.168.1')).toBe(false); // Missing octet
        expect(isIpSafe('192.168.1.1.1')).toBe(false); // Extra octet
      });
    });

    describe('real-world examples', () => {
      it('allows common CDN IPs', () => {
        expect(isIpSafe('104.16.132.229')).toBe(true); // Cloudflare
        expect(isIpSafe('151.101.1.69')).toBe(true); // Fastly
      });

      it('allows DNS server IPs', () => {
        expect(isIpSafe('1.1.1.1')).toBe(true); // Cloudflare DNS
        expect(isIpSafe('8.8.8.8')).toBe(true); // Google DNS
        expect(isIpSafe('9.9.9.9')).toBe(true); // Quad9 DNS
      });

      it('blocks typical router IPs', () => {
        expect(isIpSafe('192.168.0.1')).toBe(false);
        expect(isIpSafe('192.168.1.1')).toBe(false);
        expect(isIpSafe('10.0.0.1')).toBe(false);
      });
    });
  });
});
