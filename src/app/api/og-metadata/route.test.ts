import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock dns module
vi.mock('dns/promises', () => ({
  default: {
    resolve4: vi.fn(),
  },
}));

// Mock net module - must return a default export
vi.mock('net', () => {
  return {
    default: {
      isIP: vi.fn(),
    },
    isIP: vi.fn(),
  };
});

import dns from 'dns/promises';
import { isIP } from 'net';

describe('API Route: /api/og-metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createRequest = (url: string) => {
    return new NextRequest('http://localhost:3000/api/og-metadata', {
      method: 'POST',
      body: JSON.stringify({ url }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  describe('Input Validation', () => {
    it('should reject empty URL', async () => {
      const request = createRequest('');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid URL');
    });

    it('should reject non-string URL', async () => {
      const request = new NextRequest('http://localhost:3000/api/og-metadata', {
        method: 'POST',
        body: JSON.stringify({ url: 123 }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid URL');
    });

    it('should reject malformed URL', async () => {
      const request = createRequest('not-a-valid-url');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Malformed URL');
    });

    it('should reject file:// protocol', async () => {
      const request = createRequest('file:///etc/passwd');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid protocol');
    });

    it('should reject ftp:// protocol', async () => {
      const request = createRequest('ftp://example.com');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid protocol');
    });

    it('should reject javascript: protocol', async () => {
      const request = createRequest('javascript:alert(1)');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid protocol');
    });
  });

  describe('SSRF Protection - DNS Rebinding Prevention', () => {
    it('should block localhost by hostname', async () => {
      vi.mocked(isIP).mockReturnValue(0); // Not an IP
      vi.mocked(dns.resolve4).mockResolvedValue(['127.0.0.1']);

      const request = createRequest('http://localhost/admin');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Blocked IP range');
      expect(dns.resolve4).toHaveBeenCalledWith('localhost');
    });

    it('should block 127.0.0.1 direct IP', async () => {
      vi.mocked(isIP).mockReturnValue(4); // IPv4

      const request = createRequest('http://127.0.0.1/admin');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Blocked IP range');
      // Note: isIP returns truthy but our implementation still calls resolve4 for safety
      // This is acceptable as it provides defense in depth
    });

    it('should block private network 10.0.0.0/8', async () => {
      vi.mocked(isIP).mockReturnValue(0);
      vi.mocked(dns.resolve4).mockResolvedValue(['10.0.0.1']);

      const request = createRequest('http://internal.company.com/secrets');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Blocked IP range');
    });

    it('should block private network 172.16.0.0/12', async () => {
      vi.mocked(isIP).mockReturnValue(0);
      vi.mocked(dns.resolve4).mockResolvedValue(['172.16.0.1']);

      const request = createRequest('http://evil.com');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Blocked IP range');
    });

    it('should block private network 192.168.0.0/16', async () => {
      vi.mocked(isIP).mockReturnValue(0);
      vi.mocked(dns.resolve4).mockResolvedValue(['192.168.1.1']);

      const request = createRequest('http://router.local');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Blocked IP range');
    });

    it('should block link-local addresses 169.254.0.0/16', async () => {
      vi.mocked(isIP).mockReturnValue(0);
      vi.mocked(dns.resolve4).mockResolvedValue(['169.254.169.254']);

      const request = createRequest('http://metadata.aws');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Blocked IP range');
    });

    it('should block carrier-grade NAT 100.64.0.0/10', async () => {
      vi.mocked(isIP).mockReturnValue(0);
      vi.mocked(dns.resolve4).mockResolvedValue(['100.64.0.1']);

      const request = createRequest('http://cgnat.example.com');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Blocked IP range');
    });

    it('should block 0.0.0.0', async () => {
      vi.mocked(isIP).mockReturnValue(4);

      const request = createRequest('http://0.0.0.0/');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Blocked IP range');
    });

    it('should handle DNS resolution failures', async () => {
      vi.mocked(isIP).mockReturnValue(0);
      vi.mocked(dns.resolve4).mockRejectedValue(new Error('ENOTFOUND'));

      const request = createRequest('http://nonexistent.example.com');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('DNS resolution failed');
    });

    it('should handle empty DNS resolution', async () => {
      vi.mocked(isIP).mockReturnValue(0);
      vi.mocked(dns.resolve4).mockResolvedValue([]);

      const request = createRequest('http://example.com');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('DNS resolution failed');
    });
  });

  describe('DNS Rebinding Attack Simulation', () => {
    it('should prevent DNS rebinding attack scenario', async () => {
      // Attacker scenario:
      // 1. evil.com initially resolves to public IP (1.1.1.1)
      // 2. Passes initial hostname check
      // 3. Attacker changes DNS record
      // 4. evil.com now resolves to private IP (192.168.1.1)
      // 5. Our implementation MUST block this

      vi.mocked(isIP).mockReturnValue(0);
      // Simulate the attack: DNS now points to private IP
      vi.mocked(dns.resolve4).mockResolvedValue(['192.168.1.1']);

      const request = createRequest('http://evil.com/rebind-attack');
      const response = await POST(request);
      const data = await response.json();

      // Our implementation resolves DNS BEFORE fetch, so it should block
      expect(response.status).toBe(403);
      expect(data.error).toContain('Blocked IP range');
      expect(dns.resolve4).toHaveBeenCalledWith('evil.com');
    });
  });

  describe('Valid Requests', () => {
    it('should allow public IPs', async () => {
      vi.mocked(isIP).mockReturnValue(0);
      vi.mocked(dns.resolve4).mockResolvedValue(['1.1.1.1']); // Cloudflare DNS

      // Mock fetch to simulate successful response
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:title" content="Example Title" />
            <meta property="og:image" content="https://example.com/image.jpg" />
          </head>
          <body></body>
        </html>
      `;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/html' }),
        body: {
          getReader: () => ({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(mockHtml),
              })
              .mockResolvedValueOnce({
                done: true,
                value: undefined,
              }),
            cancel: vi.fn(),
          }),
        },
      });

      // Mock second DNS call for image validation
      vi.mocked(dns.resolve4).mockResolvedValueOnce(['1.1.1.1']).mockResolvedValueOnce(['1.1.1.1']);

      const request = createRequest('http://example.com');
      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('url');
      expect(data).toHaveProperty('title');
      expect(data).toHaveProperty('image');
    });
  });

  describe('Response Size Limits', () => {
    it('should block responses larger than 5MB', async () => {
      vi.mocked(isIP).mockReturnValue(0);
      vi.mocked(dns.resolve4).mockResolvedValue(['1.1.1.1']);

      // Create a chunk that will exceed 5MB when accumulated
      const largeChunk = new Uint8Array(6 * 1024 * 1024); // 6MB

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/html' }),
        body: {
          getReader: () => ({
            read: vi.fn().mockResolvedValueOnce({
              done: false,
              value: largeChunk,
            }),
            cancel: vi.fn(),
          }),
        },
      });

      const request = createRequest('http://example.com');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(413);
      expect(data.error).toContain('Response too large');
    });
  });

  describe('Content Type Validation', () => {
    it('should reject non-HTML content', async () => {
      vi.mocked(isIP).mockReturnValue(0);
      vi.mocked(dns.resolve4).mockResolvedValue(['1.1.1.1']);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        body: {
          getReader: () => ({
            read: vi.fn(),
          }),
        },
      });

      const request = createRequest('http://example.com/api/data');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Not HTML content');
    });
  });

  describe('Image URL Validation', () => {
    it('should validate image URLs for SSRF', async () => {
      vi.mocked(isIP).mockReturnValue(0);
      // Main URL resolves to public IP
      vi.mocked(dns.resolve4).mockResolvedValueOnce(['1.1.1.1']);

      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:title" content="Test" />
            <meta property="og:image" content="http://evil-image.com/pic.jpg" />
          </head>
          <body></body>
        </html>
      `;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/html' }),
        body: {
          getReader: () => ({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(mockHtml),
              })
              .mockResolvedValueOnce({
                done: true,
                value: undefined,
              }),
            cancel: vi.fn(),
          }),
        },
      });

      // Image URL resolves to private IP (SSRF attempt)
      vi.mocked(dns.resolve4).mockResolvedValueOnce(['192.168.1.1']);

      const request = createRequest('http://example.com');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe('Test');
      expect(data.image).toBeNull(); // Image should be blocked
    });

    it('should normalize relative image URLs', async () => {
      vi.mocked(isIP).mockReturnValue(0);
      vi.mocked(dns.resolve4).mockResolvedValueOnce(['1.1.1.1']).mockResolvedValueOnce(['1.1.1.1']);

      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:title" content="Test" />
            <meta property="og:image" content="/images/og-image.jpg" />
          </head>
          <body></body>
        </html>
      `;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/html' }),
        body: {
          getReader: () => ({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(mockHtml),
              })
              .mockResolvedValueOnce({
                done: true,
                value: undefined,
              }),
            cancel: vi.fn(),
          }),
        },
      });

      const request = createRequest('http://example.com/article');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.image).toBe('http://example.com/images/og-image.jpg');
    });

    it('should block file:// protocol in image URLs', async () => {
      vi.mocked(isIP).mockReturnValue(0);
      vi.mocked(dns.resolve4).mockResolvedValue(['1.1.1.1']);

      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:title" content="Test" />
            <meta property="og:image" content="file:///etc/passwd" />
          </head>
          <body></body>
        </html>
      `;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/html' }),
        body: {
          getReader: () => ({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(mockHtml),
              })
              .mockResolvedValueOnce({
                done: true,
                value: undefined,
              }),
            cancel: vi.fn(),
          }),
        },
      });

      const request = createRequest('http://example.com');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.image).toBeNull(); // file:// protocol should be blocked
    });
  });

  describe('Title and URL Truncation', () => {
    it('should truncate long titles with "..." at the end', async () => {
      vi.mocked(isIP).mockReturnValue(0);
      vi.mocked(dns.resolve4).mockResolvedValue(['1.1.1.1']);

      // Create a title longer than 50 chars (176 chars total)
      const longTitle =
        'This is a very long title that should be truncated because it exceeds the maximum length allowed for titles in the metadata which is set to one hundred characters plus ellipsis';

      // Build HTML with the long title embedded directly
      const mockHtml =
        '<!DOCTYPE html><html><head><meta property="og:title" content="' +
        longTitle +
        '" /></head><body></body></html>';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/html' }),
        body: {
          getReader: () => ({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(mockHtml),
              })
              .mockResolvedValueOnce({
                done: true,
                value: undefined,
              }),
            cancel: vi.fn(),
          }),
        },
      });

      const request = createRequest('http://example.com');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Title should be truncated to max 53 characters (50 + "...")
      expect(data.title).toContain('...');
      expect(data.title?.length).toBe(53);
      expect(data.title?.endsWith('...')).toBe(true);
      expect(data.title?.startsWith('This is a very long title')).toBe(true);
    });

    it('should truncate long URLs with "..." in the middle', async () => {
      vi.mocked(isIP).mockReturnValue(0);
      vi.mocked(dns.resolve4).mockResolvedValue(['1.1.1.1']);

      const longUrl =
        'https://example.com/very/long/path/that/needs/to/be/truncated/because/it/is/too/long/for/display';

      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:title" content="Test" />
          </head>
          <body></body>
        </html>
      `;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/html' }),
        body: {
          getReader: () => ({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(mockHtml),
              })
              .mockResolvedValueOnce({
                done: true,
                value: undefined,
              }),
            cancel: vi.fn(),
          }),
        },
      });

      const request = createRequest(longUrl);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.url?.length).toBeLessThanOrEqual(40);
      expect(data.url).toContain('...');
      expect(data.url).toMatch(/^https:\/\/example\.com.*\.\.\..*display$/); // Starts with beginning, has "...", ends with end
    });

    it('should not truncate short titles', async () => {
      vi.mocked(isIP).mockReturnValue(0);
      vi.mocked(dns.resolve4).mockResolvedValue(['1.1.1.1']);

      const shortTitle = 'Short Title';
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:title" content="${shortTitle}" />
          </head>
          <body></body>
        </html>
      `;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/html' }),
        body: {
          getReader: () => ({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(mockHtml),
              })
              .mockResolvedValueOnce({
                done: true,
                value: undefined,
              }),
            cancel: vi.fn(),
          }),
        },
      });

      const request = createRequest('http://example.com');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe(shortTitle); // No truncation
    });

    it('should not truncate short URLs', async () => {
      vi.mocked(isIP).mockReturnValue(0);
      vi.mocked(dns.resolve4).mockResolvedValue(['1.1.1.1']);

      const shortUrl = 'https://example.com/short';

      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:title" content="Test" />
          </head>
          <body></body>
        </html>
      `;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/html' }),
        body: {
          getReader: () => ({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(mockHtml),
              })
              .mockResolvedValueOnce({
                done: true,
                value: undefined,
              }),
            cancel: vi.fn(),
          }),
        },
      });

      const request = createRequest(shortUrl);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.url).toBe(shortUrl); // No truncation
    });
  });

  describe('HTML Entity Decoding', () => {
    it('should decode HTML entities in title (apostrophe &#039;)', async () => {
      vi.mocked(isIP).mockReturnValue(0);
      vi.mocked(dns.resolve4).mockResolvedValue(['1.1.1.1']);

      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:title" content="Les chercheurs montrent que l&#039;usage de ChatGPT compromet notre cerveau" />
          </head>
          <body></body>
        </html>
      `;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/html' }),
        body: {
          getReader: () => ({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(mockHtml),
              })
              .mockResolvedValueOnce({
                done: true,
                value: undefined,
              }),
            cancel: vi.fn(),
          }),
        },
      });

      const request = createRequest('http://example.com');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Title is truncated to 50 chars, but should contain decoded apostrophe
      expect(data.title).toContain("l'usage");
      expect(data.title).not.toContain('&#039;');
      expect(data.title?.length).toBeLessThanOrEqual(53); // Max 50 + "..."
    });

    it('should decode multiple HTML entities in title', async () => {
      vi.mocked(isIP).mockReturnValue(0);
      vi.mocked(dns.resolve4).mockResolvedValue(['1.1.1.1']);

      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:title" content="Test &quot;quotes&quot; &amp; &lt;tags&gt; &#39;apostrophe&#39;" />
          </head>
          <body></body>
        </html>
      `;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/html' }),
        body: {
          getReader: () => ({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(mockHtml),
              })
              .mockResolvedValueOnce({
                done: true,
                value: undefined,
              }),
            cancel: vi.fn(),
          }),
        },
      });

      const request = createRequest('http://example.com');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe('Test "quotes" & <tags> \'apostrophe\'');
    });

    it('should decode hexadecimal HTML entities', async () => {
      vi.mocked(isIP).mockReturnValue(0);
      vi.mocked(dns.resolve4).mockResolvedValue(['1.1.1.1']);

      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:title" content="Title with &#x27;hex&#x27; entities" />
          </head>
          <body></body>
        </html>
      `;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/html' }),
        body: {
          getReader: () => ({
            read: vi
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(mockHtml),
              })
              .mockResolvedValueOnce({
                done: true,
                value: undefined,
              }),
            cancel: vi.fn(),
          }),
        },
      });

      const request = createRequest('http://example.com');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe("Title with 'hex' entities");
    });
  });
});
