# 🏠 Stellar Estate Frontend (`stellar-estate-frontend`)

> **Programmable Real-Estate Financial Infrastructure — Web Application & Settlement Explorer**

[![Netlify Status](https://api.netlify.com/api/v1/badges/bc5fc4fd-0dfb-4954-8a2d-f4fabc7e3402/deploy-status)](https://stellar-estate-app.netlify.app)
**🌐 Live Production Deployment:** [https://stellar-estate-app.netlify.app](https://stellar-estate-app.netlify.app)

Part of the **Stellar Estate** architecture in organization [`Stellar-Estate`](https://github.com/Stellar-Estate).

```text
Stellar-Estate/
├── stellar-estate-frontend   (Web application & user experience)
└── stellar-estate-core       (Backend API, Soroban contracts, database, reconciliation)
```

---

## 1. Product Vision

Stellar Estate makes property revenue transparent, traceable, and ready for programmable settlement on the Stellar network.

$$\text{Property} \longrightarrow \text{Revenue} \quad [\longrightarrow \text{Financial Rules} \longrightarrow \text{Settlement}]$$

> **“Every property has a story. We make its money programmable.”**

Level 1 establishes the **Property → Revenue** foundation:
* Discover verified properties and inspect institutional capital structures.
* Connect a Stellar Testnet wallet (Freighter or instant Friendbot-funded developer account).
* Deposit live property revenue transactions directly to dedicated property vaults.
* Independently verify transactions on-chain via Stellar Horizon.
* Trace immutable financial records and inspect on Stellar.Expert Explorer.

---

## 2. Architecture & Design Principles

* **Real Transactions Only:** Zero fake blockchain transactions, fake balances, or simulated confirmations.
* **Separation of Concerns:** Frontend presents and orchestrates the experience. Backend independently verifies transactions and manages accounting state. Soroban contracts enforce financial vault rules.
* **Non-Custodial Architecture:** Private keys and secrets are never requested or stored.
* **Future-Ready Roadmap:** Clearly displays planned Level 2 (Distribution Agreements & Waterfall Tranches) and Level 3 (Atomic Settlement Engine) modules without premature simulation.

```text
                    STELLAR ESTATE
                          │
             ┌────────────┴────────────┐
             │                         │
        FRONTEND                  CORE REPOSITORY
             │                         │
             │                 ┌───────┴────────┐
             │                 │                │
             │             BACKEND          SOROBAN
             │                 │                │
             │                 │          Property Vault
             │                 │                │
             │                 └───────┬────────┘
             │                         │
             └─────────────────────────┘
                          │
                     STELLAR TESTNET
```

---

## 3. Key Features

### Level 1 Foundation
1. **Property Discovery (`/properties`):**
   * Filterable directory of commercial and residential assets.
   * Real metrics: Valuation, Units, Occupancy rate, Monthly revenue, and Vault address.
2. **Property Financial Profile (`/detail`):**
   * Physical specs (Year built, GFA, Energy rating).
   * Capital structure (Valuation, Reserve provisions, Distributable revenue).
   * Registered ownership/operator participation records.
   * On-chain revenue activity table with Stellar.Expert Explorer links.
3. **Property Revenue Deposit Flow:**
   * Explicit 9-stage lifecycle: `READY` $\rightarrow$ `WALLET_REQUIRED` $\rightarrow$ `REVIEW` $\rightarrow$ `SIGNING` $\rightarrow$ `SUBMITTING` $\rightarrow$ `CONFIRMING` $\rightarrow$ `CONFIRMED`.
   * Real Stellar Testnet payment execution verified against Horizon validators.
4. **Revenue & Settlement Dashboard (`/dashboard`):**
   * Portfolio-wide metrics, revenue trend chart, and reconciliation status.
5. **Cryptographic Revenue Provenance (`/audit`):**
   * 5-stage interactive pipeline: Property $\rightarrow$ Revenue Event $\rightarrow$ Stellar Transaction $\rightarrow$ Verification $\rightarrow$ Financial Record.

### Level 2 Programmable Distribution Agreements
6. **Property Distribution Agreements Dashboard (`/agreements`):**
   * View property agreements with version badges (`v1 LOCKED`, `v2 PARTIALLY_APPROVED`).
   * Displays canonical agreement SHA-256 hash, authoritative Soroban contract reference, and lock timestamps.
   * Strictly enforces immutability: locked agreements are read-only and cannot be altered.
7. **Interactive Waterfall Builder:**
   * Visual drag-and-order cascade: Gross Property Revenue $\rightarrow$ Operating Expenses $\rightarrow$ Maintenance Reserve $\rightarrow$ Management Fee $\rightarrow$ Net Distributable Revenue $\rightarrow$ Stakeholder Allocations.
   * Deterministic financial validation: strict basis-point invariants ($10,000 \text{ bps} = 100.00\%$) with zero floating-point math.
8. **Multi-Party Stellar Wallet Approval Flow:**
   * Material terms review modal displaying exact rules and SHA-256 canonical hash.
   * Non-custodial signature recording using connected Freighter or testnet wallet.
   * Progressively updates status: `PENDING_APPROVALS` $\rightarrow$ `PARTIALLY_APPROVED` $\rightarrow$ `READY_TO_LOCK`.
9. **On-Chain Agreement Locking:**
   * Disables any term mutation on backend and enforces immutability via Soroban.
   * Any change requires proposing a new deterministic agreement version.
10. **Deterministic Settlement Preview:**
    * Interactive simulation calculating safe-integer waterfall cascades against custom revenue amounts.
    * Explicitly labeled as: *"Settlement Preview — Calculated from Locked Agreement Rules (Level 3 Execution Target)"*.
11. **Agreement Version Comparison:**
    * Side-by-side diff comparing allocations, expense tranches, and effective dates across versions.

---

## 4. Wallet Support (Stellar Testnet)

* **Freighter Extension:** Connects to the official Stellar non-custodial browser extension. Verifies that the network is set to Stellar Testnet.
* **Instant Testnet Account:** For reviewers or developers without the extension installed, 1-click generation and funding of 10,000 Testnet XLM via Stellar Friendbot.

---

## 5. Local Setup & Development

### Prerequisites
* Node.js $\ge$ 20
* npm $\ge$ 10

### Installation
```bash
git clone https://github.com/Stellar-Estate/stellar-estate-frontend.git
cd stellar-estate-frontend
npm install
```

### Run Locally
```bash
npm run dev
# Starts local development server on http://localhost:3000
```

### Run Tests
```bash
npm test
# Runs automated Vitest test suite
```

### Production Build
```bash
npm run build
```

---

## 6. Environment Variables

Create a `.env` file in the root if custom API routing is needed:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

*(Note: The frontend includes a standalone fallback client with identical prototype data so it remains fully functional and reviewer-ready even before the backend server is launched).*

---

## 7. Legal & Technical Disclaimer

> **IMPORTANT DISCLAIMER:**
> This prototype demonstrates programmable real-estate financial infrastructure on the Stellar network. It does **not** constitute a transfer of legal title to physical property, an offer of securities, financial advice, or an investment solicitation. Legal title remains governed exclusively by jurisdiction-specific real-estate registries and applicable law.
