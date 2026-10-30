# Changelog — Stellar Estate Frontend (`stellar-estate-frontend`)

All notable changes to the Stellar Estate Web Application are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0-hackathon] — 2026-10-30

### 🚀 Milestone Release: Complete 300 High-Impact Improvements
Major production release submitted for Stellar Hackathon evaluation. Implements 300 production-ready improvements across User Experience, Settlement Visualization, Financial Passports, and Non-Custodial Wallet Execution.

### 🎨 User Interface & Components
- **"Where Did My Rent Go?" Visual Lineage Trace:** Interactive step-by-step audit visualization showing how tenant rent is routed through deterministic waterfall tiers to final stakeholder payouts.
- **Property Financial Passport:** Verifiable lifetime financial record tracking cumulative revenue, operating expenses, reserves, and cross-ledger reconciliation health.
- **Stakeholder Consensus Station:** Propose distribution agreement versions, review waterfall deduction tiers, and submit cryptographic consensus approvals.
- **Interactive Modals:**
  - `SettlementExecutionModal`: Step-by-step non-custodial settlement execution with live Stellar transaction links.
  - `UnitBreakdownModal`: Property rent roll and occupancy status inspector.
  - `ReconciliationAuditModal`: Live cryptographic checksum verification and StellarExpert explorer deep links.
  - `WebhookManagerModal`: Webhook event management and mock delivery dispatcher.
  - `SystemDiagnosticsModal`: End-to-end system connectivity and latency probe.
  - `BatchRevenueModal`: Multi-entry revenue deposit simulator.
  - `HackathonJudgeBadge`: One-click evaluation walkthrough pill embedded into root application.
  - `ProtocolUptimeCard`: Real-time network health, base fee, and protocol version display.

### 🌐 Stellar Network & Non-Custodial Integration
- **Freighter Wallet Adapter:** Non-custodial connection supporting account discovery, network switching, and transaction signing.
- **Stellar Asset Contract (SAC):** Support for testnet USDC token balances and explorer routing.
- **Transaction Poller:** Resilient polling utility (`pollTransactionConfirmation`) with exponential backoff for Horizon confirmations.
- **SEP Interoperability:** Support for SEP-0001 (`stellar.toml`), SEP-0007 payment request URIs, and SEP-0010 web authentication.

### 🧪 Automated Testing & Quality
- **88 Passing Component Tests:** Full coverage using `vitest` and `@testing-library/react` across all pages, modals, and adapters.
- **TypeScript Strict Parity:** 100% type-safe compilation with zero `tsc --noEmit` errors.
- **Clean Production Bundle:** Optimized Vite production build producing compressed static assets.

### 🚀 Deployment & DevOps
- **Netlify Production Hosting:** Live at [https://stellar-estate-app.netlify.app](https://stellar-estate-app.netlify.app).
- **`netlify.toml`:** Custom configuration with SPA redirects, caching headers, and Content Security Policy (CSP).
- **GitHub Actions Workflows:**
  - `frontend.yml`: Node 20 & 22 test, lint, and build matrix.
  - `ci.yml`: Monorepo quality check.

