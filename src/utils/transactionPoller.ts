export interface PollOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  horizonUrl?: string;
}

export interface TransactionConfirmation {
  confirmed: boolean;
  hash: string;
  ledger?: number;
  createdAt?: string;
  feeCharged?: number;
}

/**
 * Exponential backoff sleep helper
 */
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Polls Stellar Horizon for transaction finality and ledger inclusion with exponential backoff.
 */
export async function pollTransactionConfirmation(
  txHash: string,
  options: PollOptions = {}
): Promise<TransactionConfirmation> {
  const {
    maxAttempts = 8,
    initialDelayMs = 1000,
    maxDelayMs = 6000,
    backoffFactor = 1.5,
    horizonUrl = 'https://horizon-testnet.stellar.org',
  } = options;

  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`${horizonUrl}/transactions/${txHash}`);
      if (response.ok) {
        const data = await response.json();
        return {
          confirmed: data.successful !== false,
          hash: txHash,
          ledger: data.ledger,
          createdAt: data.created_at,
          feeCharged: data.fee_charged ? parseInt(data.fee_charged, 10) : undefined,
        };
      } else if (response.status !== 404) {
        // Non-404 error (e.g. 400 bad request, 500 server error)
        throw new Error(`Horizon transaction lookup error (HTTP ${response.status})`);
      }
    } catch (err: any) {
      if (err?.message?.includes('HTTP')) {
        throw err;
      }
      // Network glitch or timeout - allow retry
    }

    if (attempt < maxAttempts) {
      await wait(delay);
      delay = Math.min(delay * backoffFactor, maxDelayMs);
    }
  }

  throw new Error(`Transaction ${txHash} confirmation timed out after ${maxAttempts} attempts.`);
}
