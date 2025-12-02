/**
 * Network utility functions for security and validation
 */

/**
 * Validates if an IP address is safe to fetch from
 * Blocks localhost, private IP ranges, and link-local addresses
 *
 * @param ip - The IP address to validate (IPv4 format)
 * @returns true if IP is safe to fetch from, false otherwise
 *
 * @security SSRF Prevention
 * This function is critical for preventing SSRF attacks.
 * It blocks all private IP ranges defined in RFC 1918, RFC 3927, RFC 4193, and RFC 6598.
 *
 * @example
 * isIpSafe('1.1.1.1') // true - Public IP
 * isIpSafe('127.0.0.1') // false - Localhost
 * isIpSafe('192.168.1.1') // false - Private network
 */
export function isIpSafe(ip: string): boolean {
  // Block localhost
  if (ip === '127.0.0.1' || ip === '::1' || ip === '0.0.0.0') {
    return false;
  }

  // Parse IPv4 octets
  const octets = ip.split('.').map(Number);

  // Validate IPv4 format
  if (octets.length !== 4 || octets.some((octet) => isNaN(octet) || octet < 0 || octet > 255)) {
    // Invalid IPv4, block it (could be IPv6 or malformed)
    return false;
  }

  // Block private IP ranges (RFC 1918)
  if (octets[0] === 10) return false; // 10.0.0.0/8
  if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return false; // 172.16.0.0/12
  if (octets[0] === 192 && octets[1] === 168) return false; // 192.168.0.0/16

  // Block link-local addresses (RFC 3927)
  if (octets[0] === 169 && octets[1] === 254) return false; // 169.254.0.0/16

  // Block IPv6 private ranges (basic check for common formats)
  if (ip.startsWith('fd') || ip.startsWith('fc')) return false; // fc00::/7 (unique local)
  if (ip.startsWith('fe80')) return false; // fe80::/10 (link-local)

  // Block carrier-grade NAT (RFC 6598)
  if (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127) return false; // 100.64.0.0/10

  return true;
}
