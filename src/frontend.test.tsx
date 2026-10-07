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
