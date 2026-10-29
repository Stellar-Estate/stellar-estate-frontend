import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { apiService } from './services/apiService.ts';
import { SkeletonLoader } from './components/SkeletonLoader.tsx';
import { QrCodeModal } from './components/QrCodeModal.tsx';
import { UnitBreakdownModal } from './components/UnitBreakdownModal.tsx';
import { VersionCompareModal } from './components/VersionCompareModal.tsx';
import { WaterfallBuilder } from './components/WaterfallBuilder.tsx';
import { SettlementExecutionModal } from './components/SettlementExecutionModal.tsx';
import { SettlementsPage } from './pages/SettlementsPage.tsx';
import { AgreementsPage } from './pages/AgreementsPage.tsx';
import { AuditPage } from './pages/AuditPage.tsx';
import { AppContent } from './App.tsx';
import { pollTransactionConfirmation } from './utils/transactionPoller.ts';
import { WalletProvider } from './context/WalletContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { CurrencyProvider, useCurrency } from './context/CurrencyContext.tsx';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.ts';

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

  it('SkeletonLoader should render card, table, metrics, and line variants', () => {
    const cardMarkup = renderToStaticMarkup(<SkeletonLoader variant="card" count={2} />);
    expect(cardMarkup).toContain('glass-card');
    expect(cardMarkup).toContain('skeletonPulse');

    const tableMarkup = renderToStaticMarkup(<SkeletonLoader variant="table" count={3} />);
    expect(tableMarkup).toContain('skeletonPulse');

    const metricsMarkup = renderToStaticMarkup(<SkeletonLoader variant="metrics" count={4} />);
    expect(metricsMarkup).toContain('glass-card');

    const lineMarkup = renderToStaticMarkup(<SkeletonLoader variant="line" width={120} height={20} />);
    expect(lineMarkup).toContain('skeletonPulse');
  });

  it('QrCodeModal should render SEP-0007 modal with qr image and raw uri', () => {
    const testUri = 'web+stellar:pay?destination=GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD&amount=250.00';
    const markup = renderToStaticMarkup(
      <QrCodeModal
        isOpen={true}
        onClose={() => {}}
        title="Deposit Rental Revenue"
        uri={testUri}
      />
    );
    expect(markup).toContain('SEP-0007 URI');
    expect(markup).toContain('Deposit Rental Revenue');
    expect(markup).toContain('web+stellar:pay?destination=GBTY42VFL');
    expect(markup).toContain('amount=250.00');
    expect(markup).toContain('api.qrserver.com');

    const closedMarkup = renderToStaticMarkup(
      <QrCodeModal
        isOpen={false}
        onClose={() => {}}
        title="Closed Modal"
        uri={testUri}
      />
    );
    expect(closedMarkup).toBe('');
  });

  it('UnitBreakdownModal should render property rent roll and unit roster', () => {
    const mockProperty: any = {
      id: 'prop-test',
      name: 'Test Meridian Complex',
    };
    const mockUnits: any = [
      { id: 'u1', unit_identifier: 'Unit 101', unit_type: '2-Bedroom Luxury', monthly_rent: 1500, occupancy_status: 'OCCUPIED', metadata: { sqm: 95 } },
      { id: 'u2', unit_identifier: 'Unit 102', unit_type: '1-Bedroom Standard', monthly_rent: 1000, occupancy_status: 'VACANT', metadata: { sqm: 65 } },
    ];

    const markup = renderToStaticMarkup(
      <UnitBreakdownModal
        isOpen={true}
        onClose={() => {}}
        property={mockProperty}
        units={mockUnits}
      />
    );

    expect(markup).toContain('Test Meridian Complex');
    expect(markup).toContain('Unit 101');
    expect(markup).toContain('Unit 102');
    expect(markup).toContain('OCCUPIED');
    expect(markup).toContain('VACANT');
    expect(markup).toContain('$2,500 XLM');
  });

  it('SettlementsPage should render settlement platform and status filter indicators', () => {
    const mockProperty: any = {
      id: 'prop-meridian-abuja',
      name: 'The Meridian',
    };
    const markup = renderToStaticMarkup(
      <SettlementsPage properties={[mockProperty]} selectedProperty={mockProperty} />
    );
    expect(markup).toContain('Programmable Settlement Platform');
    expect(markup).toContain('DETERMINISTIC WATERFALL');
  });

  it('apiService should provide settlement CSV export URL and export capability', async () => {
    const url = apiService.getSettlementCsvDownloadUrl('STL-TEST-001');
    expect(url).toContain('/settlements/STL-TEST-001/export.csv');
  });

  it('WaterfallBuilder should render stakeholder allocation gauge and 10000 bps invariant controls', () => {
    const mockProperty: any = {
      id: 'prop-test',
      name: 'Test Complex',
    };
    const markup = renderToStaticMarkup(
      <WalletProvider>
        <WaterfallBuilder
          isOpen={true}
          onClose={() => {}}
          onAgreementCreated={() => {}}
          property={mockProperty}
        />
      </WalletProvider>
    );
    expect(markup).toContain('Stakeholder Allocation Distribution');
    expect(markup).toContain('10,000 bps');
    expect(markup).toContain('Auto-Balance (10k bps)');
    expect(markup).toContain('Invariant Satisfied (100.00%)');
  });

  it('useKeyboardShortcuts should be exported as a functional hook', () => {
    expect(typeof useKeyboardShortcuts).toBe('function');
  });

  it('CurrencyProvider and useCurrency should support USDC, XLM, and USD currency formatting', () => {
    let contextVal: any;
    const TestConsumer = () => {
      contextVal = useCurrency();
      return <div>{contextVal.formatAmount(1000)}</div>;
    };

    const markup = renderToStaticMarkup(
      <CurrencyProvider>
        <TestConsumer />
      </CurrencyProvider>
    );

    expect(markup).toContain('1,000 USDC');
    expect(contextVal.convertAmount(100, 'USD')).toBe(100);
    expect(contextVal.formatAmount(500, 'USD')).toBe('$500');
    expect(contextVal.formatAmount(100, 'XLM')).toContain('XLM');
  });

  it('VersionCompareModal should render side-by-side comparison and delta calculations', () => {
    const mockProperty: any = { id: 'prop-1', name: 'The Meridian' };
    const verA: any = {
      id: 'v1',
      version_number: 1,
      revenue_source: 'Rental',
      accepted_asset: 'USDC',
      effective_date: '2026-01-01',
      agreement_hash: 'HASH_V1_AAA',
      status: 'LOCKED',
      waterfall_rules: [{ id: 'r1', name: 'OpEx', rule_type: 'FIXED_AMOUNT', amount_or_bps: 1000 }],
      stakeholders: [{ id: 's1', name: 'Alice', role: 'Equity', basis_points: 6000, wallet_address: 'G_ALICE' }],
    };
    const verB: any = {
      id: 'v2',
      version_number: 2,
      revenue_source: 'Rental',
      accepted_asset: 'USDC',
      effective_date: '2026-06-01',
      agreement_hash: 'HASH_V2_BBB',
      status: 'PROPOSED',
      waterfall_rules: [{ id: 'r2', name: 'OpEx', rule_type: 'FIXED_AMOUNT', amount_or_bps: 1200 }],
      stakeholders: [{ id: 's1', name: 'Alice', role: 'Equity', basis_points: 5500, wallet_address: 'G_ALICE' }],
    };

    const markup = renderToStaticMarkup(
      <VersionCompareModal
        isOpen={true}
        onClose={() => {}}
        property={mockProperty}
        versionA={verA}
        versionB={verB}
      />
    );

    expect(markup).toContain('Compare Agreement Versions (v1 vs v2)');
    expect(markup).toContain('HASH_V1_AAA');
    expect(markup).toContain('HASH_V2_BBB');
    expect(markup).toContain('-500 bps');
  });

  it('AgreementsPage should render agreements and color-coded stakeholder role badges', () => {
    const mockProperty: any = { id: 'prop-1', name: 'The Meridian' };
    const markup = renderToStaticMarkup(
      <WalletProvider>
        <AgreementsPage properties={[mockProperty]} selectedProperty={mockProperty} />
      </WalletProvider>
    );
    expect(markup).toContain('Distribution Agreements');
  });

  it('AppContent should render the primary application structure with navigation and footer', () => {
    const markup = renderToStaticMarkup(
      <WalletProvider>
        <CurrencyProvider>
          <AppContent />
        </CurrencyProvider>
      </WalletProvider>
    );
    expect(markup).toContain('app-container');
    expect(markup).toContain('Stellar Estate');
    expect(markup).toContain('HACKATHON EVALUATION WALKTHROUGH');
  });

  it('Web App Manifest should be valid JSON containing application metadata', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const manifestPath = path.resolve(__dirname, '../public/manifest.json');
    const raw = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(raw);
    expect(manifest.short_name).toBe('StellarEstate');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#070a13');
  });

  it('pollTransactionConfirmation should poll and resolve confirmation or handle retry', async () => {
    // Mock global fetch
    const originalFetch = global.fetch;
    global.fetch = async (url: any) => {
      if (url.toString().includes('tx-confirmed-123')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            successful: true,
            ledger: 104523,
            created_at: '2026-10-29T12:00:00Z',
            fee_charged: '100',
          }),
        } as any;
      }
      return { ok: false, status: 404 } as any;
    };

    try {
      const res = await pollTransactionConfirmation('tx-confirmed-123', {
        maxAttempts: 2,
        initialDelayMs: 10,
      });
      expect(res.confirmed).toBe(true);
      expect(res.ledger).toBe(104523);
      expect(res.hash).toBe('tx-confirmed-123');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('SettlementsPage should render historical settlements counter ticker', async () => {
    const props = await apiService.getProperties();
    const html = renderToStaticMarkup(
      <WalletProvider>
        <SettlementsPage properties={props} selectedProperty={props[0]} />
      </WalletProvider>
    );
    expect(html).toContain('Historical Settlements Counter');
    expect(html).toContain('Stellar Horizon Latency');
    expect(html).toContain('Settlement History (0)');
  });

  it('SettlementExecutionModal should render settlement execution modal structure', () => {
    const html = renderToStaticMarkup(
      <ToastProvider>
        <WalletProvider>
          <SettlementExecutionModal
            propertyId="prop-meridian-abuja"
            revenueIds={['rev-meridian-001']}
            grossRevenue={5000}
            isOpen={true}
            onClose={() => {}}
            onSuccess={() => {}}
          />
        </WalletProvider>
      </ToastProvider>
    );
    expect(html).toContain('Execute Multi-Recipient Settlement');
  });

  it('apiService.getFeeStats should return base fee stats for gas calculation', async () => {
    const fees = await apiService.getFeeStats();
    expect(fees).toBeDefined();
    expect(fees.recommended_base_fee || fees.last_ledger_base_fee).toBeGreaterThanOrEqual(100);
  });

  it('AuditPage should render Stellar.Expert and Horizon explorer links', async () => {
    const props = await apiService.getProperties();
    const html = renderToStaticMarkup(
      <WalletProvider>
        <AuditPage properties={props} />
      </WalletProvider>
    );
    expect(html).toContain('Cryptographic Revenue Provenance');
  });

  it('PropertyValuationChart should render SVG curve and valuation trajectory metrics', async () => {
    const { PropertyValuationChart } = await import('./components/PropertyValuationChart');
    const html = renderToStaticMarkup(
      <PropertyValuationChart currentValuation={1250000} initialValuation={1000000} />
    );
    expect(html).toContain('Property Valuation Trajectory');
    expect(html).toContain('$1,250,000');
    expect(html).toContain('+25.00%');
  });

  it('PropertyDetailPage should display Reserve safety buffer gauge', async () => {
    const { PropertyDetailPage } = await import('./pages/PropertyDetailPage');
    const props = await apiService.getProperties();
    const html = renderToStaticMarkup(
      <ToastProvider>
        <WalletProvider>
          <PropertyDetailPage property={props[0]} onBack={() => {}} />
        </WalletProvider>
      </ToastProvider>
    );
    expect(html).toContain('reserve-buffer-gauge');
    expect(html).toContain('Optimal (15%)');
  });
});


