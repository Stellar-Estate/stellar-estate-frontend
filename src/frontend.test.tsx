import { describe, it, expect } from 'vitest';
import { apiService } from './services/apiService.ts';

describe('Stellar Estate Frontend Logic & Data Tests', () => {
  it('apiService.getProperties should return populated property list with vaults', async () => {
    const props = await apiService.getProperties();
    expect(props.length).toBeGreaterThan(0);

    const meridian = props.find((p) => p.name === 'The Meridian');
    expect(meridian).toBeDefined();
    expect(meridian?.vault_stellar_address).toBeDefined();
    expect(meridian?.valuation).toBe(500000);
    expect(meridian?.unit_count).toBe(10);
  });

  it('apiService.getProperty should return full financial structure and participations', async () => {
    const data = await apiService.getProperty('prop-meridian-abuja');
    expect(data.property.name).toBe('The Meridian');
    expect(data.financials.valuation).toBe(500000);
    expect(data.units.length).toBe(10);
    expect(data.participations.length).toBe(2);
    expect(data.financials.reserve_balance).toBeGreaterThanOrEqual(0);
  });

  it('apiService.initiateDeposit should return valid deposit intent with target vault', async () => {
    const intent = await apiService.initiateDeposit({
      propertyId: 'prop-meridian-abuja',
      source: 'RENTAL_REVENUE',
      amount: 100.0,
      asset: 'XLM',
    });

    expect(intent.propertyName).toBe('The Meridian');
    expect(intent.suggestedAmount).toBe(100.0);
    expect(intent.destinationVaultAddress).toBe('GAU6PZRLYQZCRG6E4V7P6E4J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD');
    expect(intent.network).toBe('TESTNET');
  });

  it('apiService.verifyDeposit should persist verified revenue on client-side', async () => {
    const hash = 'a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef';
    const result = await apiService.verifyDeposit({
      propertyId: 'prop-meridian-abuja',
      transactionHash: hash,
      source: 'RENTAL_REVENUE',
    });

    expect(result.success).toBe(true);
    expect(result.data.verification.verified).toBe(true);
    expect(result.data.verification.transactionHash).toBe(hash);

    const history = await apiService.getPropertyRevenue('prop-meridian-abuja');
    const recorded = history.find((h) => h.transaction_hash === hash);
    expect(recorded).toBeDefined();
    expect(recorded?.status).toBe('CONFIRMED');
  });

  it('apiService.getReconciliationReport should report balanced status', async () => {
    const report = await apiService.getReconciliationReport();
    expect(report.status).toBe('BALANCED');
    expect(report.discrepancies_found).toBe(0);
  });
});

describe('Property Distribution Agreements & Waterfall Tests', () => {
  it('apiService.getPropertyAgreements should return agreement versions with canonical hashes', async () => {
    const agreements = await apiService.getPropertyAgreements('prop-meridian-abuja');
    expect(agreements.length).toBeGreaterThan(0);

    const ag = agreements[0];
    expect(ag.agreement_identifier).toBe('MERIDIAN-REV-001');
    expect(ag.property_id).toBe('prop-meridian-abuja');
    expect(ag.versions.length).toBeGreaterThanOrEqual(2);

    const v1 = ag.versions.find((v) => v.version_number === 1);
    expect(v1).toBeDefined();
    expect(v1?.status).toBe('LOCKED');
    expect(v1?.agreement_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(v1?.contract_reference).toBeDefined();
  });

  it('Waterfall rules and stakeholder allocations should satisfy 10,000 basis points invariant', async () => {
    const agreements = await apiService.getPropertyAgreements('prop-meridian-abuja');
    const v1 = agreements[0].versions.find((v) => v.version_number === 1)!;

    // Check waterfall rules
    expect(v1.waterfall_rules.length).toBe(3);
    expect(v1.waterfall_rules[0].name).toBe('Operating Expenses');
    expect(v1.waterfall_rules[0].amount_or_bps).toBe(1000); // $1,000 fixed
    expect(v1.waterfall_rules[1].name).toBe('Maintenance Reserve');
    expect(v1.waterfall_rules[1].amount_or_bps).toBe(1000); // $1,000 fixed
    expect(v1.waterfall_rules[2].name).toBe('Management Fee');
    expect(v1.waterfall_rules[2].amount_or_bps).toBe(500); // 500 bps = 5%

    // Check stakeholders: 4,000 + 3,500 + 2,500 = 10,000 bps (100%)
    const totalBps = v1.stakeholders.reduce((sum, s) => sum + s.basis_points, 0);
    expect(totalBps).toBe(10000);

    // Verify all 3 required approvers have approved v1
    expect(v1.stakeholders.every((s) => s.has_approved)).toBe(true);
  });

  it('Deterministic settlement preview should compute exact waterfall deductions and allocations', async () => {
    const agreements = await apiService.getPropertyAgreements('prop-meridian-abuja');
    const v1 = agreements[0].versions.find((v) => v.version_number === 1)!;

    // Run preview for $10,000 gross revenue
    const preview = await apiService.previewSettlement(v1.id, 10000);

    expect(preview.gross_revenue_input).toBe(10000);
    expect(preview.waterfall_breakdown.length).toBe(3);

    // Rule 1: Operating expenses = $1,000
    expect(preview.waterfall_breakdown[0].deducted_amount).toBe(1000);
    // Rule 2: Maintenance reserve = $1,000
    expect(preview.waterfall_breakdown[1].deducted_amount).toBe(1000);
    // Rule 3: Management fee (5% of remaining $8,000 = $400)
    expect(preview.waterfall_breakdown[2].deducted_amount).toBe(400);

    // Distributable = 10,000 - 1,000 - 1,000 - 400 = 7,600
    expect(preview.net_distributable_revenue).toBe(7600);

    // Stakeholder payouts:
    // Alice 40% of 7,600 = $3,040
    // Bob 35% of 7,600 = $2,660
    // Charlie 25% of 7,600 = $1,900
    const alice = preview.stakeholder_allocations.find((p) => p.name.includes('Alice'));
    const bob = preview.stakeholder_allocations.find((p) => p.name.includes('Bob'));
    const charlie = preview.stakeholder_allocations.find((p) => p.name.includes('Charlie'));

    expect(alice?.allocated_amount).toBe(3040);
    expect(bob?.allocated_amount).toBe(2660);
    expect(charlie?.allocated_amount).toBe(1900);

    // Invariant: sum of payouts must equal distributable amount
    const totalPayouts = preview.stakeholder_allocations.reduce((sum, p) => sum + p.allocated_amount, 0);
    expect(totalPayouts).toBe(preview.net_distributable_revenue);
  });

  it('apiService.approveAgreementVersion should record wallet signature against exact agreement hash', async () => {
    const agreements = await apiService.getPropertyAgreements('prop-meridian-abuja');
    const v2 = agreements[0].versions.find((v) => v.version_number === 2)!;

    const charlie = v2.stakeholders.find((s) => s.name.includes('Charlie'));
    const bob = v2.stakeholders.find((s) => s.name.includes('Bob'));
    expect(charlie).toBeDefined();
    expect(bob).toBeDefined();

    // 1. Charlie approves -> still PARTIALLY_APPROVED because Bob has not yet approved
    const partial = await apiService.approveAgreementVersion(v2.id, {
      stakeholderAddress: charlie!.wallet_address,
      agreementHash: v2.agreement_hash,
    });

    const updatedCharlie = partial.stakeholders.find((s) => s.wallet_address === charlie!.wallet_address);
    expect(updatedCharlie?.has_approved).toBe(true);
    expect(partial.status).toBe('PARTIALLY_APPROVED');

    // 2. Bob approves -> all 3 (Alice, Charlie, Bob) approved -> READY_TO_LOCK
    const ready = await apiService.approveAgreementVersion(v2.id, {
      stakeholderAddress: bob!.wallet_address,
      agreementHash: v2.agreement_hash,
    });

    const updatedBob = ready.stakeholders.find((s) => s.wallet_address === bob!.wallet_address);
    expect(updatedBob?.has_approved).toBe(true);
    expect(ready.status).toBe('READY_TO_LOCK');
  });

  it('apiService.lockAgreementVersion should lock agreement on-chain and prevent further edits', async () => {
    const agreements = await apiService.getPropertyAgreements('prop-meridian-abuja');
    const v2 = agreements[0].versions.find((v) => v.version_number === 2)!;

    const lockedVer = await apiService.lockAgreementVersion(
      v2.id,
      'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD'
    );
    expect(lockedVer.status).toBe('LOCKED');
    expect(lockedVer.locked_at).toBeDefined();
  });
});

describe('Programmable Settlement Platform Tests', () => {
  it('apiService.getRevenuePool should return verified revenue pool metrics', async () => {
    const pool = await apiService.getRevenuePool('prop-meridian-abuja');
    expect(pool.property_id).toBe('prop-meridian-abuja');
    expect(pool.total_confirmed_revenue).toBeGreaterThan(0);
    expect(pool.available_for_settlement).toBeGreaterThanOrEqual(0);
  });

  it('apiService.previewLevel3Settlement should calculate deterministic $10,000 waterfall', async () => {
    const preview = await apiService.previewLevel3Settlement('prop-meridian-abuja', ['rev-01']);
    expect(preview.gross_revenue).toBe(10000);
    expect(preview.expenses).toBe(1000);
    expect(preview.reserve).toBe(1000);
    expect(preview.fees).toBe(400);
    expect(preview.distributable_amount).toBe(7600);
    expect(preview.accounting_balanced).toBe(true);
    expect(preview.stakeholder_allocations.length).toBe(3);

    // Sum of stakeholder allocations must equal distributable revenue
    const sum = preview.stakeholder_allocations.reduce((acc: number, s: any) => acc + s.allocated_amount, 0);
    expect(sum).toBe(7600);
  });

  it('apiService.executeSettlement should execute settlement, confirm on Stellar, and reconcile', async () => {
    const settlement = await apiService.executeSettlement({
      propertyId: 'prop-meridian-abuja',
      revenueIds: ['rev-01'],
      executorAddress: 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD',
    });

    expect(settlement.id).toContain('STL-MERIDIAN');
    expect(settlement.status).toBe('RECONCILED');
    expect(settlement.reconciliation_status).toBe('MATCHED');
    expect(settlement.payouts.length).toBe(3);
    expect(settlement.distributable_amount).toBe(7600);
  });

  it('apiService.getSettlementTrace should return "Where Did My Rent Go?" full audit flow', async () => {
    const trace = await apiService.getSettlementTrace('STL-MERIDIAN-001');
    expect(trace.settlement_id).toBe('STL-MERIDIAN-001');
    expect(trace.property.name).toBe('The Meridian');
    expect(trace.waterfall_flow.gross_revenue).toBe(10000);
    expect(trace.waterfall_flow.operating_expenses).toBe(1000);
    expect(trace.waterfall_flow.maintenance_reserve).toBe(1000);
    expect(trace.waterfall_flow.management_fee).toBe(400);
    expect(trace.waterfall_flow.net_distributable).toBe(7600);
    expect(trace.recipient_allocations.length).toBe(3);
  });

  it('apiService.getPropertyFinancialPassport should return lifetime financial history', async () => {
    const passport = await apiService.getPropertyFinancialPassport('prop-meridian-abuja');
    expect(passport.property_id).toBe('prop-meridian-abuja');
    expect(passport.total_lifetime_revenue).toBeGreaterThan(0);
    expect(passport.reconciliation_status).toBe('CURRENT');
    expect(passport.active_agreement_id).toBe('MERIDIAN-REV-001');
  });

  it('apiService.getStakeholderEarnings should return verified earnings for Alice', async () => {
    const alice = 'GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD';
    const earnings = await apiService.getStakeholderEarnings(alice);
    expect(earnings.wallet_address).toBe(alice);
    expect(earnings.stakeholder_name).toContain('Alice');
    expect(earnings.total_settled).toBeGreaterThan(0);
    expect(earnings.settlements.length).toBeGreaterThan(0);
  });
});


