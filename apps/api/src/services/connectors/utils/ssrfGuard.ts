import { URL } from 'url';

export class SSRFError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SSRFError';
  }
}

export class SSRFGuard {
  private static readonly BLOCKED_HOSTNAMES = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    '169.254.169.254', // AWS/GCP instance metadata endpoint
    'metadata.google.internal',
  ];

  /**
   * Validate destination URL against SSRF and private IP ranges.
   */
  public static validateDestinationUrl(destinationUrl: string): URL {
    if (!destinationUrl || typeof destinationUrl !== 'string') {
      throw new SSRFError('Webhook destination URL is required');
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(destinationUrl.trim());
    } catch {
      throw new SSRFError(`Invalid URL format: ${destinationUrl}`);
    }

    // Enforce HTTP / HTTPS protocol
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new SSRFError(`Forbidden protocol '${parsedUrl.protocol}'. Webhooks must use http: or https:`);
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    // Check forbidden hostnames
    if (this.BLOCKED_HOSTNAMES.includes(hostname)) {
      throw new SSRFError(`SSRF Blocked: Internal or loopback destination '${hostname}' is prohibited`);
    }

    // Check private TLDs (.local, .internal, .lan, .localhost)
    if (/\.(local|internal|lan|localhost)$/i.test(hostname)) {
      throw new SSRFError(`SSRF Blocked: Private domain '${hostname}' is prohibited`);
    }

    // Check private IPv4 address blocks
    if (this.isPrivateIPv4(hostname)) {
      throw new SSRFError(`SSRF Blocked: Destination IP '${hostname}' belongs to a private network range`);
    }

    return parsedUrl;
  }

  /**
   * Check if an IPv4 address falls within private/loopback ranges (RFC 1918, RFC 3927, RFC 5735).
   */
  private static isPrivateIPv4(ip: string): boolean {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      return false; // Not a numeric IPv4 address
    }

    const [a, b] = parts;

    // 127.0.0.0/8 (Loopback)
    if (a === 127) return true;
    // 10.0.0.0/8 (Private Network)
    if (a === 10) return true;
    // 172.16.0.0/12 (Private Network)
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16 (Private Network)
    if (a === 192 && b === 168) return true;
    // 169.254.0.0/16 (Link-Local / Cloud Metadata)
    if (a === 169 && b === 254) return true;

    return false;
  }
}
