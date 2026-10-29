/**
 * StellarExpert Block Explorer URL and Address Formatting Utilities
 */

export type StellarEntityType = 'tx' | 'account' | 'contract';

export function getStellarExpertUrl(
  type: StellarEntityType,
  identifier: string,
  network: 'testnet' | 'public' = 'testnet'
): string {
  const base = network === 'testnet'
    ? 'https://stellar.expert/explorer/testnet'
    : 'https://stellar.expert/explorer/public';

  const sanitized = encodeURIComponent(identifier.trim());

  switch (type) {
    case 'tx':
      return `${base}/tx/${sanitized}`;
    case 'account':
      return `${base}/account/${sanitized}`;
    case 'contract':
      return `${base}/contract/${sanitized}`;
    default:
      return `${base}/search?term=${sanitized}`;
  }
}

/**
 * Truncates a Stellar G... public key or C... contract ID for compact UI presentation
 * e.g., 'GBTY4...ABCD'
 */
export function formatStellarAddress(address: string, sliceLength = 4): string {
  if (!address || address.length < sliceLength * 2 + 3) {
    return address || '';
  }
  return `${address.slice(0, sliceLength)}...${address.slice(-sliceLength)}`;
}

/**
 * Determines whether an address is an Ed25519 Account or a Soroban Contract ID
 */
export function getStellarAddressType(address: string): 'account' | 'contract' | 'unknown' {
  if (address.startsWith('G') && address.length === 56) return 'account';
  if (address.startsWith('C') && address.length === 56) return 'contract';
  return 'unknown';
}
