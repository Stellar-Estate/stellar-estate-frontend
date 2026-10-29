/**
 * SEP-0007: URI Scheme to Facilitate Delegated Signing and Payments
 * Specification: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md
 */

export interface Sep0007PayParams {
  destination: string;
  amount?: number | string;
  assetCode?: string;
  assetIssuer?: string;
  memo?: string;
  memoType?: 'MEMO_TEXT' | 'MEMO_ID' | 'MEMO_HASH';
  msg?: string;
  originDomain?: string;
}

/**
 * Builds a valid web+stellar:pay URI following SEP-0007 specifications
 */
export function buildSep0007PayUri(params: Sep0007PayParams): string {
  const url = new URL('web+stellar:pay');

  url.searchParams.set('destination', params.destination.trim());

  if (params.amount !== undefined && params.amount !== null) {
    url.searchParams.set('amount', params.amount.toString());
  }

  if (params.assetCode && params.assetCode !== 'XLM') {
    url.searchParams.set('asset_code', params.assetCode);
    if (params.assetIssuer) {
      url.searchParams.set('asset_issuer', params.assetIssuer);
    }
  }

  if (params.memo) {
    url.searchParams.set('memo', params.memo);
    url.searchParams.set('memo_type', params.memoType || 'MEMO_TEXT');
  }

  if (params.msg) {
    url.searchParams.set('msg', params.msg);
  }

  if (params.originDomain) {
    url.searchParams.set('origin_domain', params.originDomain);
  }

  return url.toString();
}
