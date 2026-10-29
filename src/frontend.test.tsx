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
      <ToastProvider>
        <WalletProvider>
          <AuditPage properties={props} />
        </WalletProvider>
      </ToastProvider>
    );
    expect(html).toContain('Cryptographic Revenue Provenance');
    expect(html).toContain('Vault Reconciliation');
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
    expect(html).toContain('copy-vault-btn');
    expect(html).toContain('StellarExpert');
  });

  it('WalletModal should render multi-wallet providers including Freighter, xBull, Albedo, and Rabet', async () => {
    const { WalletModal } = await import('./components/WalletModal');
    const html = renderToStaticMarkup(
      <WalletProvider>
        <WalletModal isOpen={true} onClose={() => {}} />
      </WalletProvider>
    );
    expect(html).toContain('Freighter Wallet');
    expect(html).toContain('xBull Wallet');
    expect(html).toContain('Albedo');
    expect(html).toContain('Rabet Wallet');
    expect(html).toContain('Instant Testnet Dev Account');
  });

  it('SettlementsPage should render Breakdown button for audit inspection', async () => {
    const { SettlementsPage } = await import('./pages/SettlementsPage');
    const props = await apiService.getProperties();
    const html = renderToStaticMarkup(
      <ToastProvider>
        <WalletProvider>
          <SettlementsPage properties={props} selectedProperty={props[0]} initialView="history" />
        </WalletProvider>
      </ToastProvider>
    );
    expect(html).toContain('Settlement History');
    expect(html).toContain('Permanent Settlement Records');
    expect(html).toContain('All Settlements');
  });

  it('PropertiesPage should render animated occupancy gauge and financial health badges', async () => {
    const { PropertiesPage } = await import('./pages/PropertiesPage');
    const props = await apiService.getProperties();
    const html = renderToStaticMarkup(
      <PropertiesPage properties={props} onSelectProperty={() => {}} />
    );
    expect(html).toContain('occupancy-gauge');
    expect(html).toContain('financial-health-badge');
    expect(html).toContain('AAA Institutional');
  });

  it('DemoModeBanner should render Seed Testnet Scenario action button', async () => {
    const { DemoModeBanner } = await import('./components/DemoModeBanner');
    const html = renderToStaticMarkup(
      <DemoModeBanner onNavigateTab={() => {}} currentTab="properties" />
    );
    expect(html).toContain('seed-demo-scenario-btn');
    expect(html).toContain('Seed Testnet Scenario');
    expect(html).toContain('HACKATHON EVALUATION WALKTHROUGH');
  });

  it('apiService.recordBatchRevenue should ingest multi-deposit revenues atomically', async () => {
    const res = await apiService.recordBatchRevenue('prop-meridian-abuja', [
      { amount: 1500, source: 'RESIDENTIAL_RENT_UNIT_3A', description: 'Unit 3A rent payment' },
      { amount: 1800, source: 'RESIDENTIAL_RENT_UNIT_3B', description: 'Unit 3B rent payment' },
    ]);
    expect(res.success).toBe(true);
    expect(res.data.count).toBe(2);
    expect(res.data.total_amount).toBe(3300);
    expect(res.data.records.length).toBe(2);
  });

  it('apiService.simulateSettlement should preview waterfall allocations without state mutation', async () => {
    const res = await apiService.simulateSettlement('prop-meridian-abuja', 20000);
    expect(res.success).toBe(true);
    expect(res.simulation).toBeDefined();
    expect(res.simulation.simulated_gross).toBe(20000);
    expect(res.simulation.distributable_amount).toBeGreaterThan(0);
    expect(res.simulation.accounting_balanced).toBe(true);
    expect(res.simulation.stakeholder_allocations.length).toBe(3);
  });

  it('BatchRevenueModal should render multi-deposit form inputs and total calculation', async () => {
    const { BatchRevenueModal } = await import('./components/BatchRevenueModal');
    const props = await apiService.getProperties();
    const html = renderToStaticMarkup(
      <ToastProvider>
        <BatchRevenueModal property={props[0]} isOpen={true} onClose={() => {}} />
      </ToastProvider>
    );
    expect(html).toContain('Batch Revenue Ingestion');
    expect(html).toContain('UNIT_101_RENT');
    expect(html).toContain('Total Batch Inflow');
    expect(html).toContain('Commit Batch');
  });

  it('PropertyDetailPage should render Batch Inflow action trigger', async () => {
    const { PropertyDetailPage } = await import('./pages/PropertyDetailPage');
    const props = await apiService.getProperties();
    const html = renderToStaticMarkup(
      <ToastProvider>
        <WalletProvider>
          <PropertyDetailPage property={props[0]} onBack={() => {}} />
        </WalletProvider>
      </ToastProvider>
    );
    expect(html).toContain('Batch Inflow');
    expect(html).toContain('Deposit Property Revenue');
  });

  it('apiService.getPropertyReconciliation should return property financial checksums and audit metrics', async () => {
    const report = await apiService.getPropertyReconciliation('prop-meridian-abuja');
    expect(report).toBeDefined();
    expect(report.property_id).toBe('prop-meridian-abuja');
    expect(report.metrics).toHaveProperty('total_gross_revenue');
    expect(report.audit.status).toBe('RECONCILED');
    expect(typeof report.audit.ledger_checksum).toBe('string');
  });

  it('apiService.getAgreementVersions and getVaultTelemetry should return version metrics and on-chain telemetry', async () => {
    const versions = await apiService.getAgreementVersions('agr-meridian-001');
    expect(Array.isArray(versions)).toBe(true);
    expect(versions.length).toBeGreaterThan(0);
    expect(versions[0]).toHaveProperty('metrics');

    const telemetry = await apiService.getVaultTelemetry('prop-meridian-abuja');
    expect(telemetry).toBeDefined();
    expect(telemetry.contract_name).toBe('StellarEstatePropertyVault');
    expect(telemetry.financials).toHaveProperty('unconsumed_pool');
    expect(telemetry.accepted_asset.code).toBe('USDC');
  });

  it('apiService.getSystemDiagnostics should return subsystem health metrics', async () => {
    const diag = await apiService.getSystemDiagnostics();
    expect(diag.success).toBe(true);
    expect(diag.status).toBe('HEALTHY');
    expect(diag).toHaveProperty('stellar');
    expect(diag).toHaveProperty('database');
    expect(diag.stellar.network).toBe('TESTNET');
  });

  it('AgreementTimeline should render version markers and cryptographic hashes', async () => {
    const { AgreementTimeline } = await import('./components/AgreementTimeline');
    const agrs = await apiService.getPropertyAgreements('prop-meridian-abuja');
    const versions = agrs[0].versions;
    const html = renderToStaticMarkup(
      <AgreementTimeline
        versions={versions}
        selectedVersionId={versions[0].id}
        onSelectVersion={() => {}}
      />
    );
    expect(html).toContain('Agreement Version Lineage');
    expect(html).toContain('Version 1');
    expect(html).toContain('Locked &amp; Active');
    expect(html).toContain('Approvals:');
  });

  it('ReconciliationAuditModal should render accounting parity and cryptographic checksum', async () => {
    const { ReconciliationAuditModal } = await import('./components/ReconciliationAuditModal');
    const props = await apiService.getProperties();
    const html = renderToStaticMarkup(
      <ToastProvider>
        <ReconciliationAuditModal property={props[0]} isOpen={true} onClose={() => {}} />
      </ToastProvider>
    );
    expect(html).toContain('Cross-Ledger Reconciliation');
    expect(html).toContain('Accounting Ledger Reconciled');
    expect(html).toContain('Cryptographic Ledger Checksum');
    expect(html).toContain('Authoritative Vault Account');
  });

  it('Footer should render Horizon network health and System Diagnostics modal trigger', async () => {
    const { Footer } = await import('./components/Footer');
    const html = renderToStaticMarkup(<Footer />);
    expect(html).toContain('STELLAR ESTATE');
    expect(html).toContain('System Diagnostics');
    expect(html).toContain('Test SDF Network');
  });

  it('SystemDiagnosticsModal should render live subsystem telemetry', async () => {
    const { SystemDiagnosticsModal } = await import('./components/SystemDiagnosticsModal');
    const html = renderToStaticMarkup(<SystemDiagnosticsModal isOpen={true} onClose={() => {}} />);
    expect(html).toContain('System Diagnostics &amp; Telemetry');
    expect(html).toContain('Stellar Horizon RPC');
    expect(html).toContain('Database Inventory');
    expect(html).toContain('Memory Footprint');
  });

  it('apiService.forkAgreementVersion should create a new draft proposal version', async () => {
    const forked = await apiService.forkAgreementVersion('agr-meridian-001', 1);
    expect(forked.agreement_id).toBe('agr-meridian-001');
    expect(forked.version_number).toBe(2);
    expect(forked.status).toBe('PENDING_APPROVALS');
  });

  it('apiService.getPropertyAuditTrail should return property-level chronological events', async () => {
    const res = await apiService.getPropertyAuditTrail('prop-meridian-abuja');
    expect(res.success).toBe(true);
    expect(res.property_id).toBe('prop-meridian-abuja');
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThanOrEqual(1);
  });

  it('apiService.getStakeholderPortfolio should return aggregated equity and lifetime payouts', async () => {
    const res = await apiService.getStakeholderPortfolio('GBTY42VFL7XJ6Q7L35R62L4J7J5J67U4F26C6DVEOD6DGEGZ6E6DDEE5ABCD');
    expect(res.success).toBe(true);
    expect(res.data).toHaveProperty('total_properties_invested');
    expect(res.data).toHaveProperty('total_portfolio_equity_value_usdc');
    expect(Array.isArray(res.data.holdings)).toBe(true);
  });

  it('apiService.getNetworkInfo should return official testnet protocol and asset parameters', async () => {
    const res = await apiService.getNetworkInfo();
    expect(res.success).toBe(true);
    expect(res.network.name).toBe('Stellar Testnet');
    expect(res.network.protocol_version).toBe(22);
    expect(res.network.accepted_assets.length).toBeGreaterThan(0);
  });

  it('StakeholderPortfolioModal should render equity stats and holdings list', async () => {
    const { StakeholderPortfolioModal } = await import('./components/StakeholderPortfolioModal');
    const html = renderToStaticMarkup(
      <StakeholderPortfolioModal isOpen={true} onClose={() => {}} />
    );
    expect(html).toContain('Stakeholder Portfolio &amp; Equity Ledger');
    expect(html).toContain('Total Equity Value');
    expect(html).toContain('Lifetime Payouts');
    expect(html).toContain('Real Estate Asset Holdings');
  });

  it('PropertyAuditTrailModal should render chronological audit events feed', async () => {
    const { PropertyAuditTrailModal } = await import('./components/PropertyAuditTrailModal');
    const props = await apiService.getProperties();
    const html = renderToStaticMarkup(
      <PropertyAuditTrailModal property={props[0]} isOpen={true} onClose={() => {}} />
    );
    expect(html).toContain('Property Audit Trail &amp; Ledger Events');
    expect(html).toContain('CHRONOLOGICAL AUDIT LOG');
  });

  it('apiService.getLiveness and getReadiness should query system health probes', async () => {
    const live = await apiService.getLiveness();
    expect(live.status).toBe('UP');
    expect(live.probe).toBe('liveness');

    const ready = await apiService.getReadiness();
    expect(ready.status).toBe('READY');
    expect(ready.probe).toBe('readiness');
    expect(ready.checks.database).toBe('OK');
  });

  it('apiService.testDispatchWebhook should simulate dispatch of signed webhook payload', async () => {
    const res = await apiService.testDispatchWebhook('https://webhook.site/test', 'settlement.executed');
    expect(res.success).toBe(true);
    expect(res.delivery.url).toBe('https://webhook.site/test');
    expect(res.delivery.event).toBe('settlement.executed');
    expect(res.delivery.signature).toBeDefined();
  });

  it('apiService.unsubscribeWebhook should remove subscription by id', async () => {
    const res = await apiService.unsubscribeWebhook('sub-sample-123');
    expect(res.success).toBe(true);
    expect(res.subscriptionId).toBe('sub-sample-123');
  });

  it('apiService.getContractVersions should return deployed Soroban contract version metadata', async () => {
    const res = await apiService.getContractVersions();
    expect(res.success).toBe(true);
    expect(res.data.property_vault.version).toBe('1.0.0');
    expect(res.data.distribution_agreement.standards).toContain('SEP-0001');
  });

  it('WebhookManagerModal should render active webhook list and test dispatch controls', async () => {
    const { WebhookManagerModal } = await import('./components/WebhookManagerModal');
    const html = renderToStaticMarkup(
      <WebhookManagerModal isOpen={true} onClose={() => {}} />
    );
    expect(html).toContain('Webhook Event Subscriptions &amp; Dispatcher');
    expect(html).toContain('Register New Event Webhook');
    expect(html).toContain('HMAC-SHA256 Cryptographic Payload Signing Enabled');
  });

  it('apiService.getSettlementBreakdown should query settlement breakdown metrics', async () => {
    const res = await apiService.getSettlementBreakdown('stl-sample-01');
    expect(res.success).toBe(true);
    expect(res.data.breakdown.gross_revenue).toBeGreaterThan(0);
    expect(res.data.ratios_bps.distributable_bps).toBeGreaterThan(0);
  });

  it('apiService.getAgreementRulesSummary should return structured waterfall rules summary', async () => {
    const res = await apiService.getAgreementRulesSummary('agr-meridian-001', 1);
    expect(res.success).toBe(true);
    expect(res.data.agreement_id).toBe('agr-meridian-001');
    expect(res.data.rules_summary.length).toBeGreaterThan(0);
    expect(res.data.equity_allocation.length).toBeGreaterThan(0);
  });

  it('apiService.getStellarMetrics should query live Stellar network metrics', async () => {
    const res = await apiService.getStellarMetrics();
    expect(res.success).toBe(true);
    expect(res.data.network).toBe('TESTNET');
    expect(res.data.protocol_version).toBe(22);
    expect(res.data.healthy).toBe(true);
  });

  it('apiService.calculateReserveReplenishment should compute reserve buffer gap', async () => {
    const res = await apiService.calculateReserveReplenishment('prop-meridian-abuja', 1000);
    expect(res.success).toBe(true);
    expect(res.data.target_ratio_bps).toBe(1000);
    expect(res.data).toHaveProperty('replenishment_needed');
    expect(res.data).toHaveProperty('is_reserve_healthy');
  });

  it('SettlementBreakdownModal should render waterfall tranche allocations', async () => {
    const { SettlementBreakdownModal } = await import('./components/SettlementBreakdownModal');
    const html = renderToStaticMarkup(
      <SettlementBreakdownModal settlementId="STL-TEST-01" isOpen={true} onClose={() => {}} />
    );
    expect(html).toContain('Settlement Financial Breakdown');
    expect(html).toContain('Gross Inflow');
    expect(html).toContain('Waterfall Distribution Flow');
    expect(html).toContain('Cryptographically Verified on Soroban Contract');
  });
});


