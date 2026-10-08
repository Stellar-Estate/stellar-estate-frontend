# 🏠 Stellar Estate Frontend (`stellar-estate-frontend`)

> **Programmable Property-Revenue Settlement Platform — Web Application, Interactive Trace & Financial Passport**

[![Netlify Status](https://api.netlify.com/api/v1/badges/bc5fc4fd-0dfb-4954-8a2d-f4fabc7e3402/deploy-status)](https://stellar-estate-app.netlify.app)
**🌐 Live Production Platform:** [https://stellar-estate-app.netlify.app](https://stellar-estate-app.netlify.app)

Part of the **Stellar Estate** architecture in organization [`Stellar-Estate`](https://github.com/Stellar-Estate).

```text
Stellar-Estate/
├── stellar-estate-frontend   (Web Application, Settlement Execution, Interactive Trace & Financial Passport)
└── stellar-estate-core       (Backend API, Soroban Contracts, Settlement Engine & Reconciliation Service)
```

---

## 1. Product Thesis

Stellar Estate transforms property revenue into programmable, traceable, and settleable financial flows on the Stellar network.

$$\text{Property} \longrightarrow \text{Revenue} \longrightarrow \text{Vault} \longrightarrow \text{Locked Agreement} \longrightarrow \text{Waterfall} \longrightarrow \text{Multi-Recipient Settlement} \longrightarrow \text{Proof}$$

> **“Every property has a story. We make its money programmable.”**

The user experience empowers property owners, operators, and investors to answer:
> **“Property revenue came in. According to the locked agreement, where exactly did the money go?”**

---

## 2. Key Modules & User Experience

### 1. "Where Did My Rent Go?" Interactive Trace (`/settlements`)
* Complete step-by-step audit trail showing how verified tenant revenue progresses through deterministic waterfall rules into multi-recipient payouts:
  $$\$10,000 \text{ Rent} \longrightarrow -\$1,000 \text{ OpEx} \longrightarrow -\$1,000 \text{ Reserve} \longrightarrow -\$400 \text{ Mgmt Fee} \longrightarrow \$7,600 \text{ Distributable}$$
* Direct links to:
  * Tenant revenue transaction on Stellar.Expert Explorer
  * Locked distribution agreement version and canonical SHA-256 hash
  * Individual recipient payments (Alice: 40%, Bob: 35%, Charlie: 25%) with transaction hashes
  * On-chain mathematical invariant verification badge

### 2. Multi-Recipient Settlement Execution
* Preview deterministic waterfall before money moves.
* Non-custodial execution flow: `PREVIEW` $\rightarrow$ `SIGNING` $\rightarrow$ `SUBMITTING` $\rightarrow$ `CONFIRMING` $\rightarrow$ `SETTLED` $\rightarrow$ `RECONCILED`.
* Double-spending protection: Revenue records are consumed once and cannot be settled twice.

### 3. Property Financial Passport
* Permanent verifiable financial history tracking lifetime statistics:
  * Total Lifetime Revenue
  * Total Operating Expenses Deducted
  * Total Maintenance Reserves Held in Vault
  * Total Management Fees Paid
  * Total Distributed to Stakeholders
  * Total Settlements Executed
  * Active Agreement Version & Canonical Hash
  * Reconciliation Health (`✓ CURRENT • 100% Balanced`)

### 4. Stakeholder Earnings
* Granular stakeholder dashboard for equity participants (Alice, Bob, Charlie).
* Displays current basis points allocation, lifetime revenue allocated, lifetime settled, pending funds, and individual payout receipts with Explorer links.

### 5. Distribution Agreements & Governance (`/agreements`)
* Propose agreement versions with waterfall deductions and stakeholder basis points ($10,000 \text{ bps} = 100\%$).
* Multi-stakeholder cryptographic approvals against the exact canonical SHA-256 agreement hash.
* Immutable locking on Soroban smart contract once all approvals are received.

### 6. Property Profiles & Vault Ingestion (`/properties`, `/detail`)
* Physical property specs (Valuation, Units, Occupancy rate, Location).
* Dedicated Stellar Testnet vault addresses.
* Live revenue deposit modal supporting real payments via Freighter wallet or instant developer test accounts.

---

## 3. Technology Stack

* **Framework:** React 18, TypeScript, Vite
* **Styling:** Vanilla CSS design system with custom HSL dark mode, glassmorphism, and micro-animations
* **Icons & UI:** Lucide React
* **Stellar Integration:** `@stellar/stellar-sdk` (Testnet Horizon & Soroban RPC)
* **Testing:** Vitest automated test suite (16/16 passing)
* **Hosting:** Netlify with automated SPA routing (`_redirects`)

---

## 4. Local Development & Testing

```bash
# Install dependencies
npm install

# Run automated unit and integration tests (16/16 passing)
npm test

# Typecheck and build production bundle
npm run lint
npm run build

# Start local development server
npm run dev
```

---

## 5. Live Production Deployment

The frontend is live and accessible at:
👉 **[https://stellar-estate-app.netlify.app](https://stellar-estate-app.netlify.app)**

Netlify Site ID: `bc5fc4fd-0dfb-4954-8a2d-f4fabc7e3402`

---

## 6. Legal & Prototype Boundary

> **System Notice:** Stellar Estate is a prototype programmable real-estate financial infrastructure. It records financial agreements, waterfall allocations, and cash flows on Stellar Testnet. It does **not** transfer legal title to physical property, represent a regulated securities offering, or constitute financial/investment advice. Physical property title remains governed by jurisdiction-specific real-estate registries.

---

## 7. Community, Contributing & License

* **Contributing:** We welcome contributions! Please review our [Contributing Guidelines](CONTRIBUTING.md) and check out our [Good First Issues](https://github.com/Stellar-Estate/stellar-estate-frontend/issues).
* **Code of Conduct:** All community participants are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).
* **Security Policy:** For reporting vulnerabilities and non-custodial key safety practices, please consult [SECURITY.md](SECURITY.md).
* **License:** This project is licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.

