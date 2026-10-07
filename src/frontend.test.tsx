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

describe('Level 2: Property Distribution Agreements & Waterfall Tests', () => {
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

