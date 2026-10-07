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
    has_locked_agreement?: boolean;
    active_agreement_version?: number | null;
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

// ==============================================================================
// LEVEL 2: PROPERTY DISTRIBUTION AGREEMENT TYPES
// ==============================================================================

export type AgreementStatus =
  | 'DRAFT'
  | 'PENDING_APPROVALS'
  | 'PARTIALLY_APPROVED'
  | 'READY_TO_LOCK'
  | 'LOCKED'
  | 'SUPERSEDED'
  | 'REJECTED';

export type WaterfallRuleType = 'FIXED_AMOUNT' | 'PERCENTAGE_BASIS_POINTS' | 'RESIDUAL_DISTRIBUTION';

export interface WaterfallRule {
  id: string;
  agreement_version_id: string;
  priority: number;
  rule_type: WaterfallRuleType;
  name: string;
  amount_or_bps: number; // In currency units if FIXED_AMOUNT or basis points (500 = 5.00%)
  description: string;
}

export interface AgreementStakeholder {
  id: string;
  agreement_version_id: string;
  wallet_address: string;
  name: string;
  role: string;
  basis_points: number; // 0 to 10,000 (10,000 = 100.00%)
  has_approved: boolean;
  approved_at?: string;
  approval_signature?: string;
}

export interface AgreementApproval {
  id: string;
  agreement_version_id: string;
  wallet_address: string;
  agreement_hash: string;
  approval_type: 'STELLAR_WALLET';
  signature_or_proof: string;
  timestamp: string;
}

export interface DistributionAgreementVersion {
  id: string;
  agreement_id: string;
  version_number: number;
  revenue_source: string;
  accepted_asset: string;
  effective_date: string;
  expiration_date?: string;
  canonical_representation: string;
  agreement_hash: string;
  status: AgreementStatus;
  contract_reference?: string;
  created_at: string;
  locked_at?: string;
  waterfall_rules: WaterfallRule[];
  stakeholders: AgreementStakeholder[];
  approvals: AgreementApproval[];
}

export interface DistributionAgreement {
  id: string;
  property_id: string;
  agreement_identifier: string;
  current_version: number;
  status: AgreementStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  versions: DistributionAgreementVersion[];
}

export interface SettlementPreviewItem {
  name: string;
  category: 'EXPENSE' | 'RESERVE' | 'FEE' | 'DISTRIBUTION';
  rule_type: WaterfallRuleType;
  rate_or_amount: string;
  deducted_amount: number;
  recipient_or_destination: string;
}

export interface StakeholderPreviewAllocation {
  wallet_address: string;
  name: string;
  role: string;
  basis_points: number;
  percentage: string;
  allocated_amount: number;
}

export interface SettlementPreviewResult {
  property_id: string;
  agreement_id: string;
  version: number;
  agreement_hash: string;
  gross_revenue_input: number;
  asset: string;
  total_waterfall_deductions: number;
  net_distributable_revenue: number;
  waterfall_breakdown: SettlementPreviewItem[];
  stakeholder_allocations: StakeholderPreviewAllocation[];
  accounting_balanced: boolean;
  precision_model: string;
  disclaimer: string;
}
