import React, { createContext, useContext, useState, useEffect } from 'react';
import { WalletState } from '../types/index.ts';
import { stellarService } from '../services/stellarService.ts';

interface WalletContextType {
  wallet: WalletState;
  connectFreighter: () => Promise<void>;
  connectTestnetKeypair: (secretKey?: string) => Promise<{ publicKey: string; secretKey: string }>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  cachedSecretKey: string | null;
}

const initialWalletState: WalletState = {
  isConnected: false,
  address: null,
  balanceXlm: null,
  network: 'TESTNET',
  isTestnet: true,
  walletType: null,
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletState>(initialWalletState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedSecretKey, setCachedSecretKey] = useState<string | null>(null);

  // Restore session
  useEffect(() => {
    const savedType = localStorage.getItem('se_wallet_type');
    const savedAddress = localStorage.getItem('se_wallet_address');
    const savedSecret = localStorage.getItem('se_wallet_secret');

    if (savedAddress && savedType) {
      setWallet({
        isConnected: true,
        address: savedAddress,
        balanceXlm: null,
        network: 'TESTNET',
        isTestnet: true,
        walletType: savedType as any,
      });
      if (savedSecret) {
        setCachedSecretKey(savedSecret);
      }
      stellarService.fetchLiveBalance(savedAddress).then((bal) => {
        setWallet((prev) => ({ ...prev, balanceXlm: bal }));
      });
    }
  }, []);

  const connectFreighter = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { address } = await stellarService.connectFreighter();
      const bal = await stellarService.fetchLiveBalance(address);

      setWallet({
        isConnected: true,
        address,
        balanceXlm: bal,
        network: 'TESTNET',
        isTestnet: true,
        walletType: 'FREIGHTER',
      });
      setCachedSecretKey(null);
      localStorage.setItem('se_wallet_type', 'FREIGHTER');
      localStorage.setItem('se_wallet_address', address);
      localStorage.removeItem('se_wallet_secret');
    } catch (err: any) {
      setError(err.message || 'Failed to connect Freighter wallet.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const connectTestnetKeypair = async (secret?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      let pub = '';
      let sec = '';

      if (secret) {
        sec = secret.trim();
        // derive pub
        const kp = (await import('@stellar/stellar-sdk')).Keypair.fromSecret(sec);
        pub = kp.publicKey();
      } else {
        const generated = await stellarService.createAndFundTestnetKeypair();
        pub = generated.publicKey;
        sec = generated.secretKey;
      }

      const bal = await stellarService.fetchLiveBalance(pub);

      setWallet({
        isConnected: true,
        address: pub,
        balanceXlm: bal,
        network: 'TESTNET',
        isTestnet: true,
        walletType: 'KEYPAIR_TESTNET',
      });
      setCachedSecretKey(sec);
      localStorage.setItem('se_wallet_type', 'KEYPAIR_TESTNET');
      localStorage.setItem('se_wallet_address', pub);
      localStorage.setItem('se_wallet_secret', sec);

      return { publicKey: pub, secretKey: sec };
    } catch (err: any) {
      setError(err.message || 'Failed to create Testnet keypair.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setWallet(initialWalletState);
    setCachedSecretKey(null);
    localStorage.removeItem('se_wallet_type');
    localStorage.removeItem('se_wallet_address');
    localStorage.removeItem('se_wallet_secret');
  };

  const refreshBalance = async () => {
    if (!wallet.address) return;
    const bal = await stellarService.fetchLiveBalance(wallet.address);
    setWallet((prev) => ({ ...prev, balanceXlm: bal }));
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connectFreighter,
        connectTestnetKeypair,
        disconnect,
        refreshBalance,
        isLoading,
        error,
        clearError: () => setError(null),
        cachedSecretKey,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
