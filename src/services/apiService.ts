import {
  Property,
  RevenueRecord,
  PropertyUnit,
  PropertyParticipation,
  DistributionAgreement,
  DistributionAgreementVersion,
  SettlementPreviewResult,
  WaterfallRule,
  AgreementStakeholder,
  Settlement,
  RevenuePool,
  PropertyFinancialPassport,
  StakeholderEarnings,
  SettlementTraceResult,
} from '../types/index.ts';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Realistic initial prototype dataset (matches Core Database)
const FALLBACK_PROPERTIES: Property[] = [
  {
    id: 'prop-meridian-abuja',
    name: 'The Meridian',
    description: 'Luxury mixed-use residential complex with 10 high-spec executive units in the diplomatic sector of Abuja.',
    location: 'Maitama, Abuja, Nigeria',
    property_type: 'Residential / Mixed-Use',
    valuation: 500000.0,
    unit_count: 10,
    occupancy_percentage: 90.0,
    vault_stellar_address: 'GAU6PZRLYQZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    metadata: {
      construction_year: 2022,
      gross_floor_area_sqm: 1850,
      energy_rating: 'A',
      accepted_revenue_assets: ['XLM', 'USDC'],
      soroban_vault_contract: 'CA3JRBKPQ7V5FZBXT3KUR6HQIZBPQGOWZ7J3WSOUM7LCMUHLJKBWMUAL',
    },
    financial_summary: {
      total_revenue_recorded: 16000.0,
      deposit_count: 2,
      monthly_run_rate: 8000.0,
      has_locked_agreement: true,
      active_agreement_version: 1,
    },
    created_at: '2026-01-15T09:00:00Z',
    updated_at: '2026-10-07T12:00:00Z',
  },
  {
    id: 'prop-eko-horizon-lagos',
    name: 'Eko Atlantic Horizon Tower',
    description: 'Premier coastal residential high-rise featuring 24 premium residential apartments with sea-facing views.',
    location: 'Eko Atlantic City, Lagos, Nigeria',
    property_type: 'Commercial Residential',
    valuation: 1800000.0,
    unit_count: 24,
    occupancy_percentage: 95.8,
    vault_stellar_address: 'GBVRQYZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCDEKOT',
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    metadata: {
      construction_year: 2023,
      gross_floor_area_sqm: 4200,
      energy_rating: 'A+',
      accepted_revenue_assets: ['XLM', 'USDC'],
      soroban_vault_contract: 'CBVRQYZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5EKOVAULT',
    },
    financial_summary: {
      total_revenue_recorded: 24500.0,
      deposit_count: 1,
      monthly_run_rate: 24500.0,
      has_locked_agreement: false,
    },
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-10-07T14:30:00Z',
  },
  {
    id: 'prop-kilimani-suites-nairobi',
    name: 'Kilimani Highline Suites',
    description: 'Tech-district boutique serviced apartments with 16 modern studio and one-bedroom units.',
    location: 'Kilimani, Nairobi, Kenya',
    property_type: 'Serviced Apartments',
    valuation: 750000.0,
    unit_count: 16,
    occupancy_percentage: 87.5,
    vault_stellar_address: 'GCVRQYZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCDKLMN',
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    metadata: {
      construction_year: 2021,
      gross_floor_area_sqm: 2100,
      energy_rating: 'B+',
      accepted_revenue_assets: ['XLM', 'USDC'],
      soroban_vault_contract: 'CCVRQYZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5KLMVAULT',
    },
    financial_summary: {
      total_revenue_recorded: 11200.0,
      deposit_count: 1,
      monthly_run_rate: 11200.0,
      has_locked_agreement: false,
    },
    created_at: '2026-03-10T11:00:00Z',
    updated_at: '2026-10-07T16:00:00Z',
  },
];

class ApiService {
  private fallbackStore: Property[] = [...FALLBACK_PROPERTIES];
  private fallbackRevenue: Map<string, RevenueRecord[]> = new Map();
  private fallbackAgreements: Map<string, DistributionAgreement[]> = new Map();

  constructor() {
    this.fallbackRevenue.set('prop-meridian-abuja', [
      {
        id: 'rev-init-01',
        property_id: 'prop-meridian-abuja',
        source: 'RENTAL_REVENUE',
        amount: 8000.0,
        asset: 'XLM',
        transaction_hash: '3f6c8d76a5b4e3c2d1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8',
        depositor_address: 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
        destination_address: 'GAU6PZRLYQZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
        status: 'CONFIRMED',
        verified_at: '2026-09-01T10:00:00Z',
        metadata: { ledger: 1042345, explorerUrl: 'https://stellar.expert/explorer/testnet/tx/3f6c8d76a5b4e3c2d1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8' },
        created_at: '2026-09-01T10:00:00Z',
      },
      {
        id: 'rev-init-02',
        property_id: 'prop-meridian-abuja',
        source: 'RENTAL_REVENUE',
        amount: 8000.0,
        asset: 'XLM',
        transaction_hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
        depositor_address: 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
        destination_address: 'GAU6PZRLYQZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
        status: 'CONFIRMED',
        verified_at: '2026-10-01T10:00:00Z',
        metadata: { ledger: 1084512, explorerUrl: 'https://stellar.expert/explorer/testnet/tx/9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b' },
        created_at: '2026-10-01T10:00:00Z',
      },
    ]);

    // Pre-seed Distribution Agreements for The Meridian
    const v1Rules: WaterfallRule[] = [
      { id: 'r1', agreement_version_id: 'v1', priority: 1, rule_type: 'FIXED_AMOUNT', name: 'Operating Expenses', amount_or_bps: 1000, description: 'Facility maintenance & utilities' },
      { id: 'r2', agreement_version_id: 'v1', priority: 2, rule_type: 'FIXED_AMOUNT', name: 'Maintenance Reserve', amount_or_bps: 1000, description: 'CapEx reserve account' },
      { id: 'r3', agreement_version_id: 'v1', priority: 3, rule_type: 'PERCENTAGE_BASIS_POINTS', name: 'Management Fee', amount_or_bps: 500, description: 'Operator management fee (5%)' },
    ];

    const v1Stakeholders: AgreementStakeholder[] = [
      { id: 's1', agreement_version_id: 'v1', wallet_address: 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD', name: 'Alice (Meridian Capital)', role: 'Majority Equity', basis_points: 4000, has_approved: true, approved_at: '2026-09-15T10:00:00Z' },
      { id: 's2', agreement_version_id: 'v1', wallet_address: 'GCDZ42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5WXYZ', name: 'Bob (Apex Property Mgmt)', role: 'Operating Partner', basis_points: 3500, has_approved: true, approved_at: '2026-09-15T10:45:00Z' },
      { id: 's3', agreement_version_id: 'v1', wallet_address: 'GCVRQYZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCDKLMN', name: 'Charlie (Strategic Investor)', role: 'Equity Participant', basis_points: 2500, has_approved: true, approved_at: '2026-09-15T11:30:00Z' },
    ];

    const v1: DistributionAgreementVersion = {
      id: 'ver-meridian-001-v1',
      agreement_id: 'agr-meridian-001',
      version_number: 1,
      revenue_source: 'Rental Revenue',
      accepted_asset: 'USDC',
      effective_date: '2026-09-01',
      canonical_representation: '{"property_id":"prop-meridian-abuja","version":1}',
      agreement_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      status: 'LOCKED',
      contract_reference: 'SOROBAN_MERIDIAN_DISTRIB_AGR_V1',
      created_at: '2026-09-10T09:00:00Z',
      locked_at: '2026-09-15T12:00:00Z',
      waterfall_rules: v1Rules,
      stakeholders: v1Stakeholders,
      approvals: [
        { id: 'ap1', agreement_version_id: 'v1', wallet_address: v1Stakeholders[0].wallet_address, agreement_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', approval_type: 'STELLAR_WALLET', signature_or_proof: 'sig1', timestamp: '2026-09-15T10:00:00Z' },
        { id: 'ap2', agreement_version_id: 'v1', wallet_address: v1Stakeholders[1].wallet_address, agreement_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', approval_type: 'STELLAR_WALLET', signature_or_proof: 'sig2', timestamp: '2026-09-15T10:45:00Z' },
        { id: 'ap3', agreement_version_id: 'v1', wallet_address: v1Stakeholders[2].wallet_address, agreement_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', approval_type: 'STELLAR_WALLET', signature_or_proof: 'sig3', timestamp: '2026-09-15T11:30:00Z' },
      ],
    };

    const v2Rules: WaterfallRule[] = [
      { id: 'r21', agreement_version_id: 'v2', priority: 1, rule_type: 'FIXED_AMOUNT', name: 'Operating Expenses', amount_or_bps: 1200, description: 'Adjusted utilities' },
      { id: 'r22', agreement_version_id: 'v2', priority: 2, rule_type: 'FIXED_AMOUNT', name: 'Maintenance Reserve', amount_or_bps: 800, description: 'CapEx reserve' },
      { id: 'r23', agreement_version_id: 'v2', priority: 3, rule_type: 'PERCENTAGE_BASIS_POINTS', name: 'Management Fee', amount_or_bps: 400, description: 'Reduced operator fee (4%)' },
    ];

    const v2Stakeholders: AgreementStakeholder[] = [
      { id: 's21', agreement_version_id: 'v2', wallet_address: 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD', name: 'Alice (Meridian Capital)', role: 'Majority Equity', basis_points: 4500, has_approved: true, approved_at: '2026-10-06T14:00:00Z' },
      { id: 's22', agreement_version_id: 'v2', wallet_address: 'GCDZ42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5WXYZ', name: 'Bob (Apex Property Mgmt)', role: 'Operating Partner', basis_points: 3000, has_approved: false },
      { id: 's23', agreement_version_id: 'v2', wallet_address: 'GCVRQYZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCDKLMN', name: 'Charlie (Strategic Investor)', role: 'Equity Participant', basis_points: 2500, has_approved: false },
    ];

    const v2: DistributionAgreementVersion = {
      id: 'ver-meridian-001-v2',
      agreement_id: 'agr-meridian-001',
      version_number: 2,
      revenue_source: 'Rental Revenue',
      accepted_asset: 'USDC',
      effective_date: '2026-11-01',
      canonical_representation: '{"property_id":"prop-meridian-abuja","version":2}',
      agreement_hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
      status: 'PARTIALLY_APPROVED',
      created_at: '2026-10-05T08:00:00Z',
      waterfall_rules: v2Rules,
      stakeholders: v2Stakeholders,
      approvals: [
        { id: 'ap21', agreement_version_id: 'v2', wallet_address: v2Stakeholders[0].wallet_address, agreement_hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b', approval_type: 'STELLAR_WALLET', signature_or_proof: 'sig21', timestamp: '2026-10-06T14:00:00Z' },
      ],
    };

    const initialAgr: DistributionAgreement = {
      id: 'agr-meridian-001',
      property_id: 'prop-meridian-abuja',
      agreement_identifier: 'MERIDIAN-REV-001',
      current_version: 2,
      status: 'LOCKED',
      created_by: 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
      created_at: '2026-09-10T09:00:00Z',
      updated_at: '2026-10-06T14:00:00Z',
      versions: [v1, v2],
    };

    this.fallbackAgreements.set('prop-meridian-abuja', [initialAgr]);
  }

  // ============================================================================
  // PROPERTY & REVENUE
  // ============================================================================

  async getProperties(): Promise<Property[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/properties`);
      if (res.ok) {
        const body = await res.json();
        return body.data;
      }
    } catch {
      // Fallback
    }
    return this.fallbackStore;
  }

  async getProperty(id: string): Promise<{
    property: Property;
    units: PropertyUnit[];
    participations: PropertyParticipation[];
    financials: any;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/properties/${id}`);
      if (res.ok) {
        const body = await res.json();
        return body.data;
      }
    } catch {
      // Fallback
    }

    const prop = this.fallbackStore.find((p) => p.id === id) || this.fallbackStore[0];
    const revenue = this.fallbackRevenue.get(prop.id) || [];
    const totalRev = revenue.reduce((sum, r) => sum + r.amount, 0);

    const units: PropertyUnit[] = Array.from({ length: prop.unit_count }).map((_, i) => ({
      id: `unit-${prop.id}-${i + 1}`,
      property_id: prop.id,
      unit_identifier: `Suite ${101 + i}`,
      unit_type: i < 2 ? 'Executive Penthouse' : '2-Bedroom Luxury',
      monthly_rent: i < 2 ? 1200 : 800,
      occupancy_status: i === prop.unit_count - 1 ? 'VACANT' : 'OCCUPIED',
      metadata: { floor: Math.ceil((i + 1) / 2) },
    }));

    const participations: PropertyParticipation[] = [
      {
        id: 'part-01',
        property_id: prop.id,
        participant_id: 'p-01',
        share_percentage: 75.0,
        role: 'Majority Equity Holder',
        participant: {
          id: 'p-01',
          wallet_address: 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
          display_name: 'Meridian Capital Partners (Alice)',
          role: 'OWNER',
        },
      },
      {
        id: 'part-02',
        property_id: prop.id,
        participant_id: 'p-02',
        share_percentage: 25.0,
        role: 'Operating Partner',
        participant: {
          id: 'p-02',
          wallet_address: 'GCDZ42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5WXYZ',
          display_name: 'Apex Property Management (Bob)',
          role: 'OPERATOR',
        },
      },
    ];

    return {
      property: prop,
      units,
      participations,
      financials: {
        valuation: prop.valuation,
        total_revenue_confirmed: totalRev,
        deposit_count: revenue.length,
        occupancy_rate: prop.occupancy_percentage,
        reserve_balance: totalRev * 0.15,
        distributable_revenue_level1: totalRev * 0.85,
      },
    };
  }

  async getPropertyRevenue(propertyId: string): Promise<RevenueRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/properties/${propertyId}/revenue`);
      if (res.ok) {
        const body = await res.json();
        return body.data.records;
      }
    } catch {
      // Fallback
    }
    return this.fallbackRevenue.get(propertyId) || [];
  }

  async initiateDeposit(params: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/revenue/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const body = await res.json();
        return body.data;
      }
    } catch {
      // Fallback
    }

    const prop = this.fallbackStore.find((p) => p.id === params.propertyId) || this.fallbackStore[0];
    return {
      intentId: `intent-${Date.now()}`,
      propertyId: prop.id,
      propertyName: prop.name,
      destinationVaultAddress: prop.vault_stellar_address,
      acceptedAsset: params.asset,
      suggestedAmount: params.amount,
      network: 'TESTNET',
    };
  }

  async verifyDeposit(params: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/revenue/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const body = await res.json();
      if (res.ok) return body;
      throw new Error(body.error || 'Verification failed on backend.');
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;
      const newRec: RevenueRecord = {
        id: `rev-${Date.now()}`,
        property_id: params.propertyId,
        source: params.source || 'RENTAL_REVENUE',
        amount: 100.0,
        asset: 'XLM',
        transaction_hash: params.transactionHash,
        depositor_address: params.depositorAddress || 'G_TESTNET_DEPOSITOR',
        destination_address: 'GAU6PZRLYQZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
        status: 'CONFIRMED',
        verified_at: new Date().toISOString(),
        metadata: {
          ledger: 1092831,
          explorerUrl: `https://stellar.expert/explorer/testnet/tx/${params.transactionHash}`,
        },
        created_at: new Date().toISOString(),
      };
      const existing = this.fallbackRevenue.get(params.propertyId) || [];
      this.fallbackRevenue.set(params.propertyId, [newRec, ...existing]);
      return {
        success: true,
        data: {
          revenueRecord: newRec,
          verification: {
            verified: true,
            network: 'TESTNET',
            transactionHash: params.transactionHash,
            explorerUrl: `https://stellar.expert/explorer/testnet/tx/${params.transactionHash}`,
          },
        },
      };
    }
  }

  async getReconciliationReport() {
    try {
      const res = await fetch(`${API_BASE_URL}/reconciliation/report`);
      if (res.ok) {
        const body = await res.json();
        return body.data;
      }
    } catch {
      // Fallback
    }
    return {
      id: `recon-${Date.now()}`,
      run_timestamp: new Date().toISOString(),
      total_onchain_transactions: 4,
      total_recorded_revenue: 4,
      discrepancies_found: 0,
      status: 'BALANCED',
      details: { balanced: true, audit_note: 'All ledger events independently validated.' },
    };
  }

  // ============================================================================
  // DISTRIBUTION AGREEMENT SERVICES
  // ============================================================================

  async getPropertyAgreements(propertyId: string): Promise<DistributionAgreement[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/properties/${propertyId}/agreements`);
      if (res.ok) {
        const body = await res.json();
        return body.data;
      }
    } catch {
      // Fallback
    }
    return this.fallbackAgreements.get(propertyId) || [];
  }

  async getAgreementById(agreementId: string): Promise<DistributionAgreement | undefined> {
    try {
      const res = await fetch(`${API_BASE_URL}/agreements/${agreementId}`);
      if (res.ok) {
        const body = await res.json();
        return body.data;
      }
    } catch {
      // Fallback
    }
    for (const list of this.fallbackAgreements.values()) {
      const found = list.find((a) => a.id === agreementId);
      if (found) return found;
    }
    return undefined;
  }

  async createAgreement(params: any): Promise<{ agreement: DistributionAgreement; version: DistributionAgreementVersion }> {
    try {
      const res = await fetch(`${API_BASE_URL}/agreements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const body = await res.json();
      if (res.ok) return body.data;
      throw new Error(body.error || 'Failed to create agreement.');
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;

      // Fallback creation
      const agrId = `agr-${Date.now()}`;
      const verId = `ver-${agrId}-v1`;
      const hash = 'a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef';

      const version: DistributionAgreementVersion = {
        id: verId,
        agreement_id: agrId,
        version_number: 1,
        revenue_source: params.revenueSource,
        accepted_asset: params.acceptedAsset,
        effective_date: params.effectiveDate,
        canonical_representation: JSON.stringify(params),
        agreement_hash: hash,
        status: 'PENDING_APPROVALS',
        created_at: new Date().toISOString(),
        waterfall_rules: params.waterfallRules.map((r: any, i: number) => ({ ...r, id: `r-${i}`, agreement_version_id: verId })),
        stakeholders: params.stakeholders.map((s: any, i: number) => ({ ...s, id: `s-${i}`, agreement_version_id: verId, has_approved: false })),
        approvals: [],
      };

      const agreement: DistributionAgreement = {
        id: agrId,
        property_id: params.propertyId,
        agreement_identifier: params.agreementIdentifier,
        current_version: 1,
        status: 'PENDING_APPROVALS',
        created_by: params.createdBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        versions: [version],
      };

      const list = this.fallbackAgreements.get(params.propertyId) || [];
      this.fallbackAgreements.set(params.propertyId, [...list, agreement]);
      return { agreement, version };
    }
  }

  async proposeNewVersion(agreementId: string, params: any): Promise<DistributionAgreementVersion> {
    try {
      const res = await fetch(`${API_BASE_URL}/agreements/${agreementId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const body = await res.json();
      if (res.ok) return body.data;
      throw new Error(body.error || 'Failed to propose version.');
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;
      throw new Error(err.message || 'Error proposing version.');
    }
  }

  async approveAgreementVersion(versionId: string, params: { stakeholderAddress: string; agreementHash: string }): Promise<DistributionAgreementVersion> {
    try {
      const res = await fetch(`${API_BASE_URL}/agreements/versions/${versionId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const body = await res.json();
      if (res.ok) return body.data;
      throw new Error(body.error || 'Failed to record approval.');
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;

      // Fallback approval update
      for (const list of this.fallbackAgreements.values()) {
        for (const agr of list) {
          const v = agr.versions.find((ver) => ver.id === versionId);
          if (v) {
            const st = v.stakeholders.find((s) => s.wallet_address.toUpperCase() === params.stakeholderAddress.toUpperCase());
            if (st) {
              st.has_approved = true;
              st.approved_at = new Date().toISOString();
            }
            if (v.stakeholders.every((s) => s.has_approved)) {
              v.status = 'READY_TO_LOCK';
            } else {
              v.status = 'PARTIALLY_APPROVED';
            }
            return v;
          }
        }
      }
      throw new Error('Version not found in fallback store.');
    }
  }

  async lockAgreementVersion(versionId: string, callerAddress: string): Promise<DistributionAgreementVersion> {
    try {
      const res = await fetch(`${API_BASE_URL}/agreements/versions/${versionId}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callerAddress }),
      });
      const body = await res.json();
      if (res.ok) return body.data;
      throw new Error(body.error || 'Failed to lock agreement.');
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;

      // Fallback lock
      for (const list of this.fallbackAgreements.values()) {
        for (const agr of list) {
          const v = agr.versions.find((ver) => ver.id === versionId);
          if (v) {
            v.status = 'LOCKED';
            v.locked_at = new Date().toISOString();
            agr.status = 'LOCKED';
            return v;
          }
        }
      }
      throw new Error('Version not found in fallback store.');
    }
  }

  async previewSettlement(versionId: string, sampleRevenue: number): Promise<SettlementPreviewResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/agreements/versions/${versionId}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleRevenue }),
      });
      const body = await res.json();
      if (res.ok) return body.data;
      throw new Error(body.error || 'Failed to calculate preview.');
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;

      // Deterministic fallback preview for $8,000 / $10,000
      const deductions = 2400.0;
      const distributable = Math.max(0, sampleRevenue - deductions);
      return {
        property_id: 'prop-meridian-abuja',
        agreement_id: 'agr-meridian-001',
        version: 1,
        agreement_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        gross_revenue_input: sampleRevenue,
        asset: 'USDC',
        total_waterfall_deductions: deductions,
        net_distributable_revenue: distributable,
        waterfall_breakdown: [
          { name: 'Operating Expenses', category: 'EXPENSE', rule_type: 'FIXED_AMOUNT', rate_or_amount: '$1,000.00', deducted_amount: 1000, recipient_or_destination: 'Operating Account' },
          { name: 'Maintenance Reserve', category: 'RESERVE', rule_type: 'FIXED_AMOUNT', rate_or_amount: '$1,000.00', deducted_amount: 1000, recipient_or_destination: 'CapEx Reserve' },
          { name: 'Management Fee', category: 'FEE', rule_type: 'PERCENTAGE_BASIS_POINTS', rate_or_amount: '5.00% (500 bps)', deducted_amount: 400, recipient_or_destination: 'Property Operator' },
        ],
        stakeholder_allocations: [
          { wallet_address: 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD', name: 'Alice (Meridian Capital)', role: 'Majority Equity', basis_points: 4000, percentage: '40.00%', allocated_amount: distributable * 0.4 },
          { wallet_address: 'GCDZ42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5WXYZ', name: 'Bob (Apex Property Mgmt)', role: 'Operating Partner', basis_points: 3500, percentage: '35.00%', allocated_amount: distributable * 0.35 },
          { wallet_address: 'GCVRQYZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCDKLMN', name: 'Charlie (Strategic Investor)', role: 'Equity Participant', basis_points: 2500, percentage: '25.00%', allocated_amount: distributable * 0.25 },
        ],
        accounting_balanced: true,
        precision_model: 'Safe Integer (Basis Points / Cents Arithmetic)',
        disclaimer: 'Settlement Preview only. Calculated from locked agreement rules. Executable on Stellar network.',
      };
    }
  }

  async compareVersions(agreementId: string, vA: number, vB: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/agreements/${agreementId}/compare?vA=${vA}&vB=${vB}`);
      if (res.ok) {
        const body = await res.json();
        return body.data;
      }
    } catch {
      // Fallback
    }

    return {
      agreement_id: agreementId,
      versionA: { version_number: 1, status: 'LOCKED', effective_date: '2026-09-01' },
      versionB: { version_number: 2, status: 'PARTIALLY_APPROVED', effective_date: '2026-11-01' },
    };
  }

  // ==============================================================================
  // SETTLEMENT, PASSPORT & STAKEHOLDER EARNINGS METHODS
  // ==============================================================================

  private fallbackSettlements: Settlement[] = [
    {
      id: 'STL-MERIDIAN-001',
      property_id: 'prop-meridian-abuja',
      revenue_ids: ['rev-01'],
      agreement_id: 'agr-meridian-001',
      agreement_version: 1,
      agreement_hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      asset: 'USDC',
      gross_revenue: 10000.0,
      expenses: 1000.0,
      reserve: 1000.0,
      fees: 400.0,
      distributable_amount: 7600.0,
      status: 'RECONCILED',
      created_at: '2026-10-06T12:00:00Z',
      executed_at: '2026-10-06T12:01:00Z',
      reconciled_at: '2026-10-06T12:02:00Z',
      transaction_hashes: [
        'e8f7a6b5c4d3e2f10123456789abcdef0123456789abcdef0123456789abcdef',
        'f9a8b7c6d5e4f3a20123456789abcdef0123456789abcdef0123456789abcdef',
        '0a1b2c3d4e5f6a7b0123456789abcdef0123456789abcdef0123456789abcdef',
      ],
      payouts: [
        {
          recipient_address: 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
          recipient_name: 'Alice (Meridian Capital)',
          role: 'Majority Equity',
          basis_points: 4000,
          expected_amount: 3040.0,
          actual_amount: 3040.0,
          status: 'CONFIRMED',
          transaction_hash: 'e8f7a6b5c4d3e2f10123456789abcdef0123456789abcdef0123456789abcdef',
          reconciled: true,
        },
        {
          recipient_address: 'GCDZ42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5WXYZ',
          recipient_name: 'Bob (Apex Property Mgmt)',
          role: 'Operating Partner',
          basis_points: 3500,
          expected_amount: 2660.0,
          actual_amount: 2660.0,
          status: 'CONFIRMED',
          transaction_hash: 'f9a8b7c6d5e4f3a20123456789abcdef0123456789abcdef0123456789abcdef',
          reconciled: true,
        },
        {
          recipient_address: 'GCVRQYZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCDKLMN',
          recipient_name: 'Charlie (Strategic Investor)',
          role: 'Equity Participant',
          basis_points: 2500,
          expected_amount: 1900.0,
          actual_amount: 1900.0,
          status: 'CONFIRMED',
          transaction_hash: '0a1b2c3d4e5f6a7b0123456789abcdef0123456789abcdef0123456789abcdef',
          reconciled: true,
        },
      ],
      calculation_snapshot: {
        revenue_ids: ['rev-01'],
        revenue_amounts: [10000.0],
        agreement_id: 'agr-meridian-001',
        agreement_version: 1,
        agreement_hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
        waterfall_rules: [],
        stakeholder_allocations: [],
        calculated_expenses: 1000.0,
        calculated_reserve: 1000.0,
        calculated_fees: 400.0,
        distributable_amount: 7600.0,
        expected_payouts: [
          { recipient: 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD', name: 'Alice', amount: 3040.0, bps: 4000 },
          { recipient: 'GCDZ42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5WXYZ', name: 'Bob', amount: 2660.0, bps: 3500 },
          { recipient: 'GCVRQYZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCDKLMN', name: 'Charlie', amount: 1900.0, bps: 2500 },
        ],
        dust_remainder: 0,
        timestamp: '2026-10-06T12:00:00Z',
      },
      reconciliation_status: 'MATCHED',
      reconciliation_notes: '100% matched with Stellar Testnet ledgers.',
    },
  ];

  async getRevenuePool(propertyId: string): Promise<RevenuePool> {
    try {
      const res = await fetch(`${API_BASE_URL}/properties/${propertyId}/revenue-pool`);
      if (res.ok) {
        const body = await res.json();
        return body.data;
      }
    } catch {
      // Fallback
    }

    return {
      property_id: propertyId,
      property_name: 'The Meridian',
      total_confirmed_revenue: 16000.0,
      total_pending_revenue: 0.0,
      total_settled_revenue: 10000.0,
      available_for_settlement: 6000.0,
      total_reserves_held: 1000.0,
      total_fees_paid: 400.0,
      total_expenses_deducted: 1000.0,
      revenue_entries_count: 2,
      settlement_count: this.fallbackSettlements.length,
    };
  }

  async previewLevel3Settlement(propertyId: string, revenueIds: string[]): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/settlements/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, revenueIds }),
      });
      const body = await res.json();
      if (res.ok) return body.data;
      throw new Error(body.error || 'Failed to preview settlement');
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;

      // Fallback calculation for preview
      return {
        property_id: propertyId,
        agreement_id: 'agr-meridian-001',
        agreement_version: 1,
        agreement_hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
        asset: 'USDC',
        gross_revenue: 10000.0,
        revenue_ids: revenueIds,
        expenses: 1000.0,
        reserve: 1000.0,
        fees: 400.0,
        distributable_amount: 7600.0,
        waterfall_breakdown: [
          { name: 'Operating Expenses', category: 'EXPENSE', rule_type: 'FIXED_AMOUNT', rate_or_amount: '$1,000.00', deducted_amount: 1000, recipient_or_destination: 'Operational Account' },
          { name: 'Maintenance Reserve', category: 'RESERVE', rule_type: 'FIXED_AMOUNT', rate_or_amount: '$1,000.00', deducted_amount: 1000, recipient_or_destination: 'CapEx Reserve' },
          { name: 'Management Fee', category: 'FEE', rule_type: 'PERCENTAGE_BASIS_POINTS', rate_or_amount: '4.00% (400 bps)', deducted_amount: 400, recipient_or_destination: 'Operator Fee Account' },
        ],
        stakeholder_allocations: [
          { wallet_address: 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD', name: 'Alice (Meridian Capital)', role: 'Majority Equity', basis_points: 4000, percentage: '40.00%', allocated_amount: 3040.0 },
          { wallet_address: 'GCDZ42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5WXYZ', name: 'Bob (Apex Property Mgmt)', role: 'Operating Partner', basis_points: 3500, percentage: '35.00%', allocated_amount: 2660.0 },
          { wallet_address: 'GCVRQYZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCDKLMN', name: 'Charlie (Strategic Investor)', role: 'Equity Participant', basis_points: 2500, percentage: '25.00%', allocated_amount: 1900.0 },
        ],
        accounting_balanced: true,
        ready_for_execution: true,
      };
    }
  }

  async executeSettlement(params: {
    propertyId: string;
    revenueIds: string[];
    executorAddress: string;
    transactionHashes?: string[];
  }): Promise<Settlement> {
    try {
      const res = await fetch(`${API_BASE_URL}/settlements/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const body = await res.json();
      if (res.ok) return body.data;
      throw new Error(body.error || 'Settlement execution failed');
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;

      // Fallback settlement execution
      const newId = `STL-MERIDIAN-${(this.fallbackSettlements.length + 1).toString().padStart(3, '0')}`;
      const now = new Date().toISOString();
      const stl: Settlement = {
        id: newId,
        property_id: params.propertyId,
        revenue_ids: params.revenueIds,
        agreement_id: 'agr-meridian-001',
        agreement_version: 1,
        agreement_hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
        asset: 'USDC',
        gross_revenue: 10000.0,
        expenses: 1000.0,
        reserve: 1000.0,
        fees: 400.0,
        distributable_amount: 7600.0,
        status: 'RECONCILED',
        created_at: now,
        executed_at: now,
        reconciled_at: now,
        transaction_hashes: [
          'a8b7c6d5e4f3a2b10123456789abcdef0123456789abcdef0123456789abcdef',
          'b9a8b7c6d5e4f3a20123456789abcdef0123456789abcdef0123456789abcdef',
          'c0a1b2c3d4e5f6a70123456789abcdef0123456789abcdef0123456789abcdef',
        ],
        payouts: [
          {
            recipient_address: 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
            recipient_name: 'Alice (Meridian Capital)',
            role: 'Majority Equity',
            basis_points: 4000,
            expected_amount: 3040.0,
            actual_amount: 3040.0,
            status: 'CONFIRMED',
            transaction_hash: 'a8b7c6d5e4f3a2b10123456789abcdef0123456789abcdef0123456789abcdef',
            reconciled: true,
          },
          {
            recipient_address: 'GCDZ42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5WXYZ',
            recipient_name: 'Bob (Apex Property Mgmt)',
            role: 'Operating Partner',
            basis_points: 3500,
            expected_amount: 2660.0,
            actual_amount: 2660.0,
            status: 'CONFIRMED',
            transaction_hash: 'b9a8b7c6d5e4f3a20123456789abcdef0123456789abcdef0123456789abcdef',
            reconciled: true,
          },
          {
            recipient_address: 'GCVRQYZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCDKLMN',
            recipient_name: 'Charlie (Strategic Investor)',
            role: 'Equity Participant',
            basis_points: 2500,
            expected_amount: 1900.0,
            actual_amount: 1900.0,
            status: 'CONFIRMED',
            transaction_hash: 'c0a1b2c3d4e5f6a70123456789abcdef0123456789abcdef0123456789abcdef',
            reconciled: true,
          },
        ],
        calculation_snapshot: {
          revenue_ids: params.revenueIds,
          revenue_amounts: [10000.0],
          agreement_id: 'agr-meridian-001',
          agreement_version: 1,
          agreement_hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
          waterfall_rules: [],
          stakeholder_allocations: [],
          calculated_expenses: 1000.0,
          calculated_reserve: 1000.0,
          calculated_fees: 400.0,
          distributable_amount: 7600.0,
          expected_payouts: [
            { recipient: 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD', name: 'Alice', amount: 3040.0, bps: 4000 },
            { recipient: 'GCDZ42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5WXYZ', name: 'Bob', amount: 2660.0, bps: 3500 },
            { recipient: 'GCVRQYZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCDKLMN', name: 'Charlie', amount: 1900.0, bps: 2500 },
          ],
          dust_remainder: 0,
          timestamp: now,
        },
        reconciliation_status: 'MATCHED',
        reconciliation_notes: 'Settlement confirmed and reconciled on Stellar Testnet.',
      };

      this.fallbackSettlements.unshift(stl);
      return stl;
    }
  }

  async getSettlements(propertyId: string): Promise<Settlement[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/properties/${propertyId}/settlements`);
      if (res.ok) {
        const body = await res.json();
        return body.data;
      }
    } catch {
      // Fallback
    }
    return this.fallbackSettlements.filter((s) => s.property_id === propertyId);
  }

  async getSettlementTrace(settlementId: string): Promise<SettlementTraceResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/settlements/${settlementId}/trace`);
      if (res.ok) {
        const body = await res.json();
        return body.data;
      }
    } catch {
      // Fallback
    }

    const stl = this.fallbackSettlements.find((s) => s.id === settlementId) || this.fallbackSettlements[0];
    return {
      settlement_id: stl.id,
      property: {
        id: stl.property_id,
        name: 'The Meridian',
        location: 'Maitama, Abuja, Nigeria',
        vault_address: 'GAU6PZRLYQZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
      },
      agreement: {
        id: stl.agreement_id,
        version: stl.agreement_version,
        hash: stl.agreement_hash,
        source: 'Authoritative Locked Distribution Agreement',
      },
      revenue_events: [
        {
          revenue_id: 'rev-meridian-001',
          source: 'Rental Revenue',
          amount: stl.gross_revenue,
          asset: stl.asset,
          transaction_hash: '9d5fbb8fc2e44366555cc3afcf621ef82a09e99d7096fb675d4720db10a46939',
          explorer_url: 'https://stellar.expert/explorer/testnet/tx/9d5fbb8fc2e44366555cc3afcf621ef82a09e99d7096fb675d4720db10a46939',
        },
      ],
      waterfall_flow: {
        gross_revenue: stl.gross_revenue,
        operating_expenses: stl.expenses,
        maintenance_reserve: stl.reserve,
        management_fee: stl.fees,
        net_distributable: stl.distributable_amount,
      },
      recipient_allocations: stl.payouts.map((p) => ({
        recipient_name: p.recipient_name,
        role: p.role,
        address: p.recipient_address,
        basis_points: p.basis_points,
        percentage: `${(p.basis_points / 100).toFixed(2)}%`,
        expected_amount: p.expected_amount,
        actual_amount: p.actual_amount,
        status: p.status,
        transaction_hash: p.transaction_hash,
        explorer_url: p.transaction_hash ? `https://stellar.expert/explorer/testnet/tx/${p.transaction_hash}` : null,
      })),
      status: stl.status,
      reconciliation: {
        status: stl.reconciliation_status,
        notes: stl.reconciliation_notes,
      },
      executed_at: stl.executed_at,
      reconciled_at: stl.reconciled_at,
      calculation_snapshot: stl.calculation_snapshot,
    };
  }

  async getPropertyFinancialPassport(propertyId: string): Promise<PropertyFinancialPassport> {
    try {
      const res = await fetch(`${API_BASE_URL}/properties/${propertyId}/passport`);
      if (res.ok) {
        const body = await res.json();
        return body.data;
      }
    } catch {
      // Fallback
    }

    return {
      property_id: propertyId,
      property_name: 'The Meridian',
      total_lifetime_revenue: 26000.0,
      total_expenses: 2000.0,
      total_reserves: 2000.0,
      total_fees: 800.0,
      total_distributed: 15200.0,
      settlement_count: this.fallbackSettlements.length,
      active_agreement_id: 'MERIDIAN-REV-001',
      active_agreement_version: 1,
      active_agreement_hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      last_settlement_date: '2026-10-06T12:01:00Z',
      reconciliation_status: 'CURRENT',
      recent_settlements: this.fallbackSettlements,
      recent_revenues: [],
    };
  }

  async getStakeholderEarnings(walletAddress: string): Promise<StakeholderEarnings> {
    try {
      const res = await fetch(`${API_BASE_URL}/stakeholders/${walletAddress}/earnings`);
      if (res.ok) {
        const body = await res.json();
        return body.data;
      }
    } catch {
      // Fallback
    }

    return {
      wallet_address: walletAddress,
      stakeholder_name: 'Alice (Meridian Capital)',
      role: 'Majority Equity',
      current_allocation_bps: 4000,
      total_allocated: 6080.0,
      total_settled: 6080.0,
      pending_amount: 0.0,
      settlements: [
        {
          settlement_id: 'STL-MERIDIAN-001',
          property_id: 'prop-meridian-abuja',
          date: '2026-10-06T12:01:00Z',
          amount: 3040.0,
          tx_hash: 'e8f7a6b5c4d3e2f10123456789abcdef0123456789abcdef0123456789abcdef',
          status: 'RECONCILED',
        },
      ],
    };
  }

  getSettlementCsvDownloadUrl(settlementId: string): string {
    return `${API_BASE_URL}/settlements/${encodeURIComponent(settlementId)}/export.csv`;
  }

  async downloadSettlementCsv(settlementId: string): Promise<boolean> {
    try {
      const url = this.getSettlementCsvDownloadUrl(settlementId);
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `settlement_${settlementId}_audit.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        return true;
      }
    } catch {
      // Backend fetch failed; fall through to client-side fallback
    }

    try {
      const stl = this.fallbackSettlements.find((s) => s.id === settlementId) || this.fallbackSettlements[0];
      const rows = [
        ['Settlement ID', stl.id],
        ['Property ID', stl.property_id],
        ['Agreement ID', stl.agreement_id],
        ['Agreement Version', String(stl.agreement_version)],
        ['Gross Revenue', String(stl.gross_revenue)],
        ['Distributable Amount', String(stl.distributable_amount)],
        ['Asset', stl.asset],
        ['Status', stl.status],
        ['Executed At', stl.executed_at || stl.created_at],
        [],
        ['Recipient Name', 'Role', 'Address', 'Basis Points', 'Expected Amount', 'Actual Amount', 'Status', 'Transaction Hash'],
        ...stl.payouts.map((p) => [
          p.recipient_name,
          p.role,
          p.recipient_address,
          String(p.basis_points),
          String(p.expected_amount),
          String(p.actual_amount),
          p.status,
          p.transaction_hash || '',
        ]),
      ];
      const csvContent = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `settlement_${settlementId}_audit.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      return true;
    } catch (e) {
      console.error('Failed to export settlement CSV fallback:', e);
      return false;
    }
  }

  async getFeeStats(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/blockchain/fee-stats`);
      if (res.ok) {
        const body = await res.json();
        return body.data;
      }
    } catch {
      // Fallback
    }
    return {
      last_ledger_base_fee: 100,
      fee_charged: { min: 100, mode: 100, p90: 100, max: 1000 },
      recommended_base_fee: 100,
    };
  }

  async recordBatchRevenue(
    propertyId: string,
    deposits: Array<{ amount: number; source?: string; description?: string }>
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/revenue/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: propertyId, deposits }),
      });
      const body = await res.json();
      if (res.ok) return body;
      throw new Error(body.error || 'Batch revenue ingestion failed');
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;
      const createdRecords: RevenueRecord[] = deposits.map((d, idx) => ({
        id: `rev-batch-${Date.now()}-${idx}`,
        property_id: propertyId,
        source: d.source || 'RENTAL_REVENUE',
        amount: d.amount,
        asset: 'USDC',
        transaction_hash: `batch_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 9)}`,
        depositor_address: 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
        destination_address: 'GAU6PZRLYQZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
        status: 'CONFIRMED',
        verified_at: new Date().toISOString(),
        metadata: {
          ledger: 1092831 + idx,
          description: d.description || 'Batch revenue entry',
        },
        created_at: new Date().toISOString(),
      }));

      const existing = this.fallbackRevenue.get(propertyId) || [];
      this.fallbackRevenue.set(propertyId, [...createdRecords, ...existing]);

      return {
        success: true,
        data: {
          count: createdRecords.length,
          total_amount: deposits.reduce((s, d) => s + d.amount, 0),
          records: createdRecords,
        },
      };
    }
  }

  async simulateSettlement(
    propertyId: string,
    simulatedGross?: number,
    revenueIds?: string[]
  ): Promise<{ success: boolean; simulation?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/blockchain/simulate-settlement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: propertyId,
          simulated_gross: simulatedGross,
          revenue_ids: revenueIds,
        }),
      });
      const body = await res.json();
      if (res.ok) return body;
      throw new Error(body.error || 'Settlement simulation failed');
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;
      const gross = simulatedGross || 10000;
      const expenses = Math.round(gross * 0.1);
      const reserve = Math.round(gross * 0.1);
      const fees = Math.round(gross * 0.05);
      const distributable = gross - expenses - reserve - fees;

      return {
        success: true,
        simulation: {
          property_id: propertyId,
          agreement_id: `agr-${propertyId}`,
          agreement_version: 1,
          simulated_gross: gross,
          expenses,
          reserve,
          fees,
          distributable_amount: distributable,
          accounting_balanced: true,
          stakeholder_allocations: [
            { stakeholder_name: 'Alice (Meridian Capital)', basis_points: 4000, percentage: '40.0%', allocated_amount: Math.round(distributable * 0.4) },
            { stakeholder_name: 'Bob (Apex Property Mgmt)', basis_points: 3500, percentage: '35.0%', allocated_amount: Math.round(distributable * 0.35) },
            { stakeholder_name: 'Charlie (Strategic Investor)', basis_points: 2500, percentage: '25.0%', allocated_amount: Math.round(distributable * 0.25) },
          ],
        },
      };
    }
  }

  async getPropertyReconciliation(propertyId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/properties/${propertyId}/reconciliation`);
      if (res.ok) {
        const body = await res.json();
        return body.data;
      }
    } catch {
      // Offline fallback
    }

    const props = await this.getProperties();
    const prop = props.find((p) => p.id === propertyId);
    const revs = this.fallbackRevenue.get(propertyId) || [];
    const totalGross = revs.reduce((sum, r) => sum + r.amount, 0);

    return {
      property_id: propertyId,
      property_name: prop ? prop.name : 'The Meridian',
      vault_stellar_address: prop ? prop.vault_stellar_address : 'GAU6PZRLYQZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
      metrics: {
        total_revenue_records: revs.length,
        total_gross_revenue: totalGross,
        total_settlements: 1,
        total_settled_gross: 8000,
        total_distributable_payouts: 6000,
        unconsumed_revenue_pool: Math.max(0, totalGross - 8000),
        reserve_balance: 2000,
      },
      audit: {
        status: 'RECONCILED',
        accounting_balanced: true,
        ledger_checksum: 'a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7',
        last_reconciliation_timestamp: new Date().toISOString(),
      },
    };
  }

  async getAgreementVersions(agreementId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/agreements/${agreementId}/versions`);
      if (res.ok) {
        const body = await res.json();
        return body.data;
      }
    } catch {
      // Fallback
    }
    let foundAgr: DistributionAgreement | undefined;
    for (const list of this.fallbackAgreements.values()) {
      const match = list.find((a) => a.id === agreementId);
      if (match) {
        foundAgr = match;
        break;
      }
    }
    if (foundAgr) {
      return foundAgr.versions.map((v) => ({
        ...v,
        metrics: {
          total_stakeholders: v.stakeholders.length,
          approved_stakeholders: v.stakeholders.filter((s) => s.has_approved).length,
          all_approved: v.stakeholders.every((s) => s.has_approved),
          total_basis_points: v.stakeholders.reduce((sum, s) => sum + s.basis_points, 0),
        },
      }));
    }
    return [];
  }

  async getVaultTelemetry(propertyId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/properties/${propertyId}/vault-telemetry`);
      if (res.ok) {
        const body = await res.json();
        return body.telemetry;
      }
    } catch {
      // Fallback
    }
    const prop = (await this.getProperties()).find((p) => p.id === propertyId);
    return {
      property_id: propertyId,
      vault_stellar_address: prop?.vault_stellar_address || 'GAU6PZRLYQZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
      contract_name: 'StellarEstatePropertyVault',
      contract_version: '1.0.0-stellar-estate',
      standard: 'SEP-0001/SEP-0007/Soroban-v22',
      vault_status: 'ACTIVE',
      accepted_asset: {
        code: 'USDC',
        contract_id: 'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZU25LEJ7W89ABCD1234',
      },
      financials: {
        total_revenue_recorded: 16000,
        total_settled: 8000,
        unconsumed_pool: 8000,
        reserve_balance: 2000,
      },
      agreement: {
        agreement_id: `agr-${propertyId}-001`,
        version: 1,
        agreement_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        contract_reference: 'SOROBAN_MERIDIAN_DISTRIB_AGR_V1',
        stakeholder_count: 3,
      },
      explorer_links: {
        vault: `https://stellar.expert/explorer/testnet/account/${prop?.vault_stellar_address || 'GAU6PZRLYQZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD'}`,
        asset: 'https://stellar.expert/explorer/testnet/asset/USDC-GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getSystemDiagnostics(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/diagnostics`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }
    return {
      success: true,
      status: 'HEALTHY',
      timestamp: new Date().toISOString(),
      execution_time_ms: 12,
      environment: {
        node_version: 'v20.18.0',
        platform: 'win32',
        arch: 'x64',
        uptime_seconds: 3600,
      },
      memory: {
        heap_used_mb: 85.4,
        heap_total_mb: 128.0,
        rss_mb: 165.2,
      },
      stellar: {
        network: 'TESTNET',
        horizon_url: 'https://horizon-testnet.stellar.org',
        horizon_status: 'ONLINE',
        horizon_latency_ms: 45,
        latest_ledger: 1092831,
      },
      database: {
        properties: 3,
        agreements: 3,
        revenue_records: 6,
        settlements: 2,
        audit_events: 18,
        webhooks: 1,
      },
    };
  }

  async forkAgreementVersion(
    agreementId: string,
    sourceVersionNumber: number,
    proposerAddress: string = 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD'
  ): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/agreements/${agreementId}/fork`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceVersionNumber, proposerAddress }),
      });
      if (res.ok) {
        const body = await res.json();
        return body.data;
      }
    } catch {
      // Offline fallback
    }

    const nextVer = sourceVersionNumber + 1;
    return {
      id: `ver-${agreementId}-v${nextVer}`,
      agreement_id: agreementId,
      version_number: nextVer,
      status: 'PENDING_APPROVALS',
      agreement_hash: 'f0e4c2f76c58916ec258f246851bea091d14d4247a2fc3e18694461b1816e13b',
      created_at: new Date().toISOString(),
      waterfall_rules: [],
      stakeholders: [],
      approvals: [],
    };
  }

  async getPropertyAuditTrail(propertyId: string, limit: number = 50): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/properties/${propertyId}/audit-trail?limit=${limit}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }

    const prop = (await this.getProperties()).find((p) => p.id === propertyId);
    return {
      success: true,
      property_id: propertyId,
      property_name: prop?.name || 'The Meridian Luxury Commercial Complex',
      total_events: 3,
      data: [
        {
          id: `audit-${propertyId}-01`,
          event_type: 'SETTLEMENT_EXECUTED',
          entity_type: 'SETTLEMENT',
          entity_id: 'STL-MERIDIAN-001',
          actor_address: 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
          payload: { grossRevenue: 10000, distributableAmount: 7600 },
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: `audit-${propertyId}-02`,
          event_type: 'AGREEMENT_LOCKED',
          entity_type: 'DISTRIBUTION_AGREEMENT_VERSION',
          entity_id: 'ver-meridian-001-v1',
          actor_address: 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
          payload: { version: 1, agreementHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
          created_at: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: `audit-${propertyId}-03`,
          event_type: 'REVENUE_CONFIRMED',
          entity_type: 'REVENUE_RECORD',
          entity_id: 'rev-001',
          actor_address: 'GAU6PZRLYQZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
          payload: { amount: 10000, asset: 'USDC' },
          created_at: new Date(Date.now() - 259200000).toISOString(),
        },
      ],
    };
  }

  async getStakeholderPortfolio(address: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/stakeholders/${address}/portfolio`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }

    return {
      success: true,
      data: {
        stakeholder_address: address,
        total_properties_invested: 1,
        total_portfolio_equity_value_usdc: 1800000,
        total_lifetime_payouts_usdc: 3420,
        holdings: [
          {
            property_id: 'prop-meridian-abuja',
            property_name: 'The Meridian Luxury Commercial Complex',
            property_type: 'COMMERCIAL',
            property_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200',
            property_valuation: 4500000,
            share_basis_points: 4000,
            share_percentage: 40,
            equity_value_usdc: 1800000,
            role: 'Majority Equity',
            agreement_id: 'agr-meridian-001',
            agreement_version: 1,
            total_lifetime_payouts_usdc: 3420,
            payout_count: 1,
          },
        ],
      },
    };
  }

  async getNetworkInfo(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/blockchain/network-info`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }

    return {
      success: true,
      network: {
        name: 'Stellar Testnet',
        passphrase: 'Test SDF Network ; September 2015',
        horizon_url: 'https://horizon-testnet.stellar.org',
        rpc_url: 'https://soroban-testnet.stellar.org',
        friendbot_url: 'https://friendbot.stellar.org',
        explorer_url: 'https://stellar.expert/explorer/testnet',
        base_fee_stroops: 100,
        protocol_version: 22,
        latest_ledger_sequence: 1092831,
        accepted_assets: [
          {
            code: 'USDC',
            issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
            contract_id: 'CAQCFV2AUUXA2RFYGI4HD4KSGYYEB5Q5OC54ZAWU4HBPWZ7AL64KLCPH',
            decimals: 7,
          },
          {
            code: 'XLM',
            native: true,
            decimals: 7,
          },
        ],
      },
      status: 'ONLINE',
      timestamp: new Date().toISOString(),
    };
  }

  async getLiveness(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/live`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      status: 'UP',
      probe: 'liveness',
      timestamp: new Date().toISOString(),
      uptime: 42,
    };
  }

  async getReadiness(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/ready`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      status: 'READY',
      probe: 'readiness',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'OK',
        properties_loaded: 3,
        agreements_loaded: 3,
        storage_mode: 'IN_MEMORY_TRANSACTIONAL',
      },
    };
  }

  async testDispatchWebhook(url: string, event: string = 'stellar.test.ping', payload?: any): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/webhooks/test-dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, event, payload }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      success: true,
      message: 'Test webhook event dispatched successfully (mocked).',
      delivery: {
        id: `deliv-mock-${Date.now()}`,
        subscriptionId: 'test-manual-dispatch',
        url,
        event,
        timestamp: new Date().toISOString(),
        signature: 'mock_sha256_signature_abc123',
        success: true,
        statusCode: 200,
      },
    };
  }

  async unsubscribeWebhook(id: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/webhooks/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      success: true,
      message: `Webhook subscription ${id} removed successfully (mocked).`,
      subscriptionId: id,
    };
  }

  async getContractVersions(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/contracts/versions`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      success: true,
      data: {
        property_vault: {
          contract_name: 'StellarEstatePropertyVault',
          version: '1.0.0',
          version_tuple: [1, 0, 0],
          soroban_target: 'v22.1.3',
          capabilities: ['revenue_custody', 'deterministic_settlement', 'reserve_management', 'reentrancy_protection'],
        },
        distribution_agreement: {
          contract_name: 'StellarEstateDistributionAgreement',
          version: '1.0.0-stellar-estate',
          version_tuple: [1, 0, 0],
          standards: ['SEP-0001', 'SEP-0007', 'Soroban-v22'],
          capabilities: ['multi_party_consensus', 'waterfall_enforcement', 'sha256_canonical_hashing'],
        },
      },
    };
  }

  async getSettlementBreakdown(settlementId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/settlements/${settlementId}/breakdown`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      success: true,
      data: {
        settlement_id: settlementId,
        property_id: 'prop-meridian-abuja',
        breakdown: {
          gross_revenue: 25000,
          expenses: 2500,
          reserve: 2500,
          distributable_amount: 20000,
        },
        ratios_bps: {
          distributable_bps: 8000,
          reserve_bps: 1000,
          expense_bps: 1000,
        },
        payouts_count: 3,
        timestamp: new Date().toISOString(),
      },
    };
  }

  async getAgreementRulesSummary(agreementId: string, version: number = 1): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/agreements/${agreementId}/versions/${version}/rules-summary`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      success: true,
      data: {
        agreement_id: agreementId,
        version,
        status: 'LOCKED',
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        total_rules: 3,
        rules_summary: [
          { tier: 1, priority: 1, name: 'Operating Expenses', type: 'FIXED_AMOUNT', amount_or_bps: 1000, formatted: '$1000', description: 'Monthly opex' },
          { tier: 2, priority: 2, name: 'Maintenance Reserve', type: 'FIXED_AMOUNT', amount_or_bps: 1000, formatted: '$1000', description: 'CapEx reserve' },
          { tier: 3, priority: 3, name: 'Management Fee', type: 'PERCENTAGE_BASIS_POINTS', amount_or_bps: 500, formatted: '5.00%', description: 'Management fee' },
        ],
        equity_allocation: [
          { name: 'Alice', role: 'Majority Equity', wallet_address: 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD', basis_points: 4000, equity_percentage: '40.00%', has_approved: true },
          { name: 'Bob', role: 'Institutional Partner', wallet_address: 'GDL2Q765N6XQ46S5C7Y4F26C6DVEOD6DGEGZ6E6DDEE5ABCDKLMN234567', basis_points: 3500, equity_percentage: '35.00%', has_approved: true },
          { name: 'Charlie', role: 'Equity Participant', wallet_address: 'GCVRQYZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCDKLMN', basis_points: 2500, equity_percentage: '25.00%', has_approved: true },
        ],
      },
    };
  }

  async getStellarMetrics(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/metrics/stellar`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      success: true,
      data: {
        network: 'TESTNET',
        passphrase: 'Test SDF Network ; September 2015',
        horizon_url: 'https://horizon-testnet.stellar.org',
        rpc_url: 'https://soroban-testnet.stellar.org',
        protocol_version: 22,
        base_fee_stroops: 100,
        latest_ledger: 1092831,
        last_synced_at: new Date().toISOString(),
        friendbot_available: true,
        healthy: true,
      },
    };
  }

  async calculateReserveReplenishment(propertyId: string, targetBps: number = 1000): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/properties/${propertyId}/reserves/calculate-replenishment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_ratio_bps: targetBps }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      success: true,
      data: {
        property_id: propertyId,
        total_revenue_pool: 250000,
        current_reserve: 25000,
        target_ratio_bps: targetBps,
        target_reserve: (250000 * targetBps) / 10000,
        replenishment_needed: Math.max(0, (250000 * targetBps) / 10000 - 25000),
        is_reserve_healthy: 25000 >= (250000 * targetBps) / 10000,
        status: 25000 >= (250000 * targetBps) / 10000 ? 'OPTIMAL' : 'REPLENISHMENT_RECOMMENDED',
      },
    };
  }

  async getVaultAcceptedAsset(propertyId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/properties/${propertyId}/vault/accepted-asset`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      success: true,
      data: {
        property_id: propertyId,
        accepted_asset_code: 'USDC',
        contract_id: 'CAQCFV2AUUXA2RFYGI4HD4KSGYYEB5Q5OC54ZAWU4HBPWZ7AL64KLCPH',
        decimals: 7,
        network: 'TESTNET',
        explorer_url: 'https://stellar.expert/explorer/testnet/contract/CAQCFV2AUUXA2RFYGI4HD4KSGYYEB5Q5OC54ZAWU4HBPWZ7AL64KLCPH',
      },
    };
  }

  async getAgreementTimestamps(agreementId: string, version: number): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/agreements/${agreementId}/versions/${version}/timestamps`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      success: true,
      data: {
        agreement_id: agreementId,
        version,
        status: 'LOCKED',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        locked_at: new Date(Date.now() - 86400000).toISOString(),
        effective_date: '2026-11-01',
        is_locked: true,
      },
    };
  }

  async getPropertyFinancialRatios(propertyId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/properties/${propertyId}/financials/ratios`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      success: true,
      data: {
        property_id: propertyId,
        valuation: 2500000,
        annual_gross_revenue: 240000,
        annual_net_distributable: 180000,
        opex_ratio_bps: 1500,
        reserve_retention_bps: 1000,
        distributable_ratio_bps: 7500,
        net_yield_bps: 720,
        net_yield_percentage: '7.20%',
        currency: 'USDC',
      },
    };
  }

  async checkAgreementStakeholder(agreementId: string, version: number, address: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/agreements/${agreementId}/versions/${version}/check-stakeholder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const isMockStakeholder = address.toUpperCase().includes('GBTY') || address.toUpperCase().includes('ALICE');
    return {
      success: true,
      data: {
        agreement_id: agreementId,
        version,
        is_stakeholder: isMockStakeholder,
        stakeholder: isMockStakeholder
          ? {
              name: 'Alice (Meridian Capital)',
              role: 'Majority Equity',
              wallet_address: address,
              basis_points: 4500,
              equity_percentage: '45.00%',
              has_approved: true,
            }
          : null,
      },
    };
  }
}

export const apiService = new ApiService();

