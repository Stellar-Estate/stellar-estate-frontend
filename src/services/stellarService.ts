import {
  Horizon,
  Keypair,
  Asset,
  Networks,
  TransactionBuilder,
  Operation,
  Memo,
  FeeBumpTransaction,
  Transaction,
} from '@stellar/stellar-sdk';
import {
  isConnected as freighterIsConnected,
  isAllowed as freighterIsAllowed,
  setAllowed as freighterSetAllowed,
  getAddress as freighterGetAddress,
  getNetwork as freighterGetNetwork,
  signTransaction as freighterSignTransaction,
} from '@stellar/freighter-api';

export const STELLAR_TESTNET_HORIZON = 'https://horizon-testnet.stellar.org';
export const STELLAR_TESTNET_PASSPHRASE = Networks.TESTNET;
export const STELLAR_EXPERT_EXPLORER = 'https://stellar.expert/explorer/testnet/tx';

export class StellarService {
  private server: Horizon.Server;

  constructor() {
    this.server = new Horizon.Server(STELLAR_TESTNET_HORIZON);
  }

  /**
   * Check if Freighter extension is available in browser
   */
  async checkFreighterAvailability(): Promise<boolean> {
    try {
      const res = await freighterIsConnected();
      return typeof res === 'boolean' ? res : !!(res as any)?.isConnected;
    } catch {
      return false;
    }
  }

  /**
   * Connect using Freighter wallet
   */
  async connectFreighter(): Promise<{ address: string; network: string }> {
    const isConn = await this.checkFreighterAvailability();
    if (!isConn) {
      throw new Error('Freighter extension not detected in your browser.');
    }

    const allowed = await freighterIsAllowed();
    const isAllowedVal = typeof allowed === 'boolean' ? allowed : !!(allowed as any)?.isAllowed;
    if (!isAllowedVal) {
      await freighterSetAllowed();
    }

    const addrRes = await freighterGetAddress();
    const address = typeof addrRes === 'string' ? addrRes : (addrRes as any)?.address;
    if (!address) {
      throw new Error('No public key returned by Freighter.');
    }

    // Verify network
    let network = 'TESTNET';
    try {
      const netRes = await freighterGetNetwork();
      const netStr = typeof netRes === 'string' ? netRes : (netRes as any)?.network || '';
      if (netStr && !netStr.toUpperCase().includes('TESTNET')) {
        throw new Error(`Freighter is connected to ${netStr}. Please switch your Freighter wallet network to Stellar Testnet.`);
      }
      network = netStr || 'TESTNET';
    } catch (e: any) {
      if (e.message?.includes('Please switch')) throw e;
    }

    return { address, network };
  }

  /**
   * Fetch live XLM balance from Stellar Testnet Horizon
   */
  async fetchLiveBalance(publicKey: string): Promise<string> {
    try {
      const account = await this.server.loadAccount(publicKey);
      const nativeBalance = account.balances.find((b) => b.asset_type === 'native');
      return nativeBalance ? parseFloat(nativeBalance.balance).toFixed(2) : '0.00';
    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        return '0.00 (Unfunded)';
      }
      return '0.00';
    }
  }

  /**
   * Fund a Testnet account via Stellar Friendbot
   */
  async fundWithFriendbot(publicKey: string): Promise<boolean> {
    try {
      const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Generate a fresh Testnet Demo Keypair funded by Friendbot
   */
  async createAndFundTestnetKeypair(): Promise<{ keypair: Keypair; publicKey: string; secretKey: string }> {
    const keypair = Keypair.random();
    const funded = await this.fundWithFriendbot(keypair.publicKey());
    if (!funded) {
      // Retry once
      await new Promise((r) => setTimeout(r, 1500));
      await this.fundWithFriendbot(keypair.publicKey());
    }
    return {
      keypair,
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    };
  }

  /**
   * Submit a real Testnet Payment Transaction
   */
  async submitRevenuePayment(params: {
    sourceSecretKey?: string;
    sourcePublicKey: string;
    destinationVault: string;
    amount: string;
    memoText?: string;
    useFreighter?: boolean;
  }): Promise<{ hash: string; ledger: number }> {
    const { sourceSecretKey, sourcePublicKey, destinationVault, amount, memoText, useFreighter } = params;

    // Load source account from Horizon
    const sourceAccount = await this.server.loadAccount(sourcePublicKey);

    // Build transaction
    let txBuilder = new TransactionBuilder(sourceAccount, {
      fee: '1000',
      networkPassphrase: STELLAR_TESTNET_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination: destinationVault,
          asset: Asset.native(),
          amount: parseFloat(amount).toFixed(7),
        })
      )
      .setTimeout(30);

    if (memoText) {
      txBuilder = txBuilder.addMemo(Memo.text(memoText.substring(0, 28)));
    }

    const transaction = txBuilder.build();

    let signedTx: Transaction | FeeBumpTransaction;

    if (useFreighter) {
      const signRes = await freighterSignTransaction(transaction.toXDR(), {
        networkPassphrase: STELLAR_TESTNET_PASSPHRASE,
      });
      const xdr = typeof signRes === 'string' ? signRes : (signRes as any)?.signedTxXdr || transaction.toXDR();
      signedTx = TransactionBuilder.fromXDR(xdr, STELLAR_TESTNET_PASSPHRASE);
    } else {
      if (!sourceSecretKey) {
        throw new Error('Secret key required for local testnet signing.');
      }
      const signer = Keypair.fromSecret(sourceSecretKey);
      transaction.sign(signer);
      signedTx = transaction;
    }

    // Submit to live Stellar Horizon Testnet
    const result = await this.server.submitTransaction(signedTx);
    return {
      hash: result.hash,
      ledger: result.ledger,
    };
  }
}

export const stellarService = new StellarService();
