/**
 * Email obfuscation utilities to protect against spam bots
 * Uses base64 encoding and reversal to make email addresses harder for bots to scrape
 */

// Encode email for storage in DOM (reversed + base64)
export function encodeEmail(email: string): string {
  const reversed = email.split('').reverse().join('');
  return btoa(reversed);
}

// Decode email when user interacts (reverse the encoding)
export function decodeEmail(encoded: string): string {
  try {
    const decoded = atob(encoded);
    return decoded.split('').reverse().join('');
  } catch {
    return '';
  }
}

// Generate obfuscated display text (e.g., "m***@g***.com")
export function obfuscateEmailDisplay(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!domain) return email;
  
  const [domainName, tld] = domain.split('.');
  if (!tld) return email;
  
  const obfuscatedLocal = localPart.charAt(0) + '•••';
  const obfuscatedDomain = domainName.charAt(0) + '•••';
  
  return `${obfuscatedLocal}@${obfuscatedDomain}.${tld}`;
}

// Component helper for click-to-reveal email
export function handleEmailClick(encodedEmail: string): void {
  const email = decodeEmail(encodedEmail);
  if (email) {
    window.location.href = `mailto:${email}`;
  }
}
