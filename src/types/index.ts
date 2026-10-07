export interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  property_type: string;
  valuation: number;
  unit_count: number;
  occupancy_percentage: number;
  vault_stellar_address: string;
  status: 'ACTIVE' | 'PENDING' | 'MAINTENANCE';
  image_url: string;
  metadata?: {
    construction_year?: number;
    gross_floor_area_sqm?: number;
    energy_rating?: string;
    accepted_revenue_assets?: string[];
    soroban_vault_contract?: string;
  };
  financial_summary?: {
    total_revenue_recorded: number;
    deposit_count: number;
    monthly_run_rate: number;
  };
  created_at: string;
  updated_at: string;
}

export interface PropertyUnit {
  id: string;
  property_id: string;
  unit_identifier: string;
  unit_type: string;
  monthly_rent: number;
  occupancy_status: 'OCCUPIED' | 'VACANT';
  metadata: Record<string, any>;
}

export interface Participant {
  id: string;
  wallet_address: string;
  display_name: string;
  role: 'OWNER' | 'OPERATOR' | 'INVESTOR' | 'CUSTODIAN';
}

export interface PropertyParticipation {
  id: string;
  property_id: string;
  participant_id: string;
  share_percentage: number;
  role: string;
  participant?: Participant;
}

export interface RevenueRecord {
  id: string;
  property_id: string;
  source: string;
  amount: number;
  asset: string;
  transaction_hash: string;
  depositor_address: string;
  destination_address: string;
  status: 'PENDING' | 'CONFIRMED' | 'RECONCILED' | 'FLAGGED';
  verified_at: string;
  metadata?: {
    ledger?: number;
    explorerUrl?: string;
  };
  created_at: string;
}

export interface BlockchainTransaction {
  id: string;
  transaction_hash: string;
  network: 'TESTNET' | 'PUBLIC';
  asset: string;
  amount: number;
  sender: string;
  recipient: string;
  operation_type: string;
  status: 'SUCCESS' | 'FAILED';
  ledger_sequence: number;
  confirmed_at: string;
}

export type DepositLifecycleState =
  | 'READY'
  | 'WALLET_REQUIRED'
  | 'REVIEW'
  | 'SIGNING'
  | 'SUBMITTING'
  | 'CONFIRMING'
  | 'CONFIRMED'
  | 'FAILED'
  | 'REJECTED';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balanceXlm: string | null;
  network: 'TESTNET';
  isTestnet: boolean;
  walletType: 'FREIGHTER' | 'KEYPAIR_TESTNET' | null;
}
