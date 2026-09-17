import net from 'node:net';
import dns from 'node:dns/promises';
import { AppError } from '../errors/AppError';

/**
 * Checks whether an IP address belongs to private, loopback, link-local,
 * or reserved ranges that must not be reached by an external URL fetching service.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) return true;

    // 0.0.0.0/8 (Current network)
    if (parts[0] === 0) return true;

    // 127.0.0.0/8 (Loopback addresses)
    if (parts[0] === 127) return true;

    // 10.0.0.0/8 (Private-Use RFC 1918)
    if (parts[0] === 10) return true;

    // 172.16.0.0/12 (Private-Use RFC 1918: 172.16.0.0 - 172.31.255.255)
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;

    // 192.168.0.0/16 (Private-Use RFC 1918)
    if (parts[0] === 192 && parts[1] === 168) return true;

    // 169.254.0.0/16 (Link-Local / AWS & GCP cloud metadata like 169.254.169.254)
    if (parts[0] === 169 && parts[1] === 254) return true;

    // 100.64.0.0/10 (Shared Address Space / CGNAT)
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;

    // 192.0.0.0/24 (IETF Protocol Assignments)
    // 192.0.2.0/24 (TEST-NET-1)
    if (parts[0] === 192 && parts[1] === 0 && (parts[2] === 0 || parts[2] === 2)) return true;

    // 198.18.0.0/15 (Benchmarking)
    if (parts[0] === 198 && parts[1] >= 18 && parts[1] <= 19) return true;

    // 198.51.100.0/24 (TEST-NET-2)
    if (parts[0] === 198 && parts[1] === 51 && parts[2] === 100) return true;

    // 203.0.113.0/24 (TEST-NET-3)
    if (parts[0] === 203 && parts[1] === 0 && parts[2] === 113) return true;

    // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
    if (parts[0] >= 224) return true;

    // 255.255.255.255 (Broadcast)
    if (ip === '255.255.255.255') return true;

    return false;
  }

  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase().trim();

    // ::1 (Loopback) or :: (Unspecified)
    if (normalized === '::1' || normalized === '::') return true;

    // fc00::/7 (Unique local address)
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;

    // fe80::/10 (Link-local unicast)
    if (
      normalized.startsWith('fe8') ||
      normalized.startsWith('fe9') ||
      normalized.startsWith('fea') ||
      normalized.startsWith('feb')
    ) {
      return true;
    }

    // IPv4-mapped IPv6 address (::ffff:127.0.0.1)
    if (normalized.startsWith('::ffff:')) {
      const ipv4Part = normalized.replace('::ffff:', '');
      return isPrivateOrReservedIp(ipv4Part);
    }

    return false;
  }

  return true;
}

/**
 * Validates a target URL against SSRF threats.
 * Resolves all DNS A/AAAA records for the hostname and ensures none point to private/internal networks.
 */
export async function validateSafeFetchTarget(urlStr: string): Promise<{
  parsedUrl: URL;
  resolvedIp: string;
}> {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw AppError.badRequest('Invalid target URL format.');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw AppError.badRequest(`Unsupported protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.`);
  }

  const hostname = parsed.hostname.toLowerCase();

  // Guard against known internal hostnames
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan') ||
    hostname.endsWith('.corp')
  ) {
    throw AppError.badRequest(`Target hostname "${hostname}" is an internal address and cannot be audited.`);
  }

  // If hostname is directly an IP literal
  if (net.isIP(hostname)) {
    if (isPrivateOrReservedIp(hostname)) {
      throw AppError.badRequest(`Target IP address "${hostname}" is in a private or restricted network range.`);
    }
    return { parsedUrl: parsed, resolvedIp: hostname };
  }

  // Resolve DNS records
  let addresses: Array<{ address: string; family: number }>;
  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'DNS resolution failed';
    throw AppError.badRequest(`Could not resolve domain "${hostname}": ${message}`);
  }

  if (!addresses || addresses.length === 0) {
    throw AppError.badRequest(`Domain "${hostname}" does not resolve to any IP address.`);
  }

  // Check every resolved IP address
  for (const addr of addresses) {
    if (isPrivateOrReservedIp(addr.address)) {
      throw AppError.badRequest(
        `Domain "${hostname}" resolves to a private or restricted IP address (${addr.address}). Request blocked for SSRF protection.`
      );
    }
  }

  return { parsedUrl: parsed, resolvedIp: addresses[0].address };
}
