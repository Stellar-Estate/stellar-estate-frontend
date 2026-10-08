# Contributing to Stellar Estate Frontend

Thank you for helping build **Stellar Estate Frontend**! We welcome community contributions, UI/UX polish, accessibility improvements, and documentation enhancements.

---

## Code of Conduct

All contributors are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat all community members with respect and kindness.

---

## Application Architecture

The web application is built with React 18, TypeScript, and Vite:

```text
stellar-estate-frontend/
├── public/                 # Static assets and Netlify SPA redirects
├── src/
│   ├── components/         # Reusable UI components & modals
│   │   ├── Navbar.tsx      # Navigation header & wallet status
│   │   ├── Footer.tsx      # Technical network specs & legal disclaimers
│   │   ├── WhereDidMyRentGo.tsx     # Interactive settlement trace flow
│   │   ├── WaterfallBuilder.tsx     # Agreement rule composition
│   │   ├── FinancialPassportModal.tsx # Verifiable property history modal
│   │   ├── SettlementExecutionModal.tsx # Multi-recipient execution runner
│   │   └── SettlementPreviewModal.tsx   # Deterministic waterfall preview
│   ├── pages/              # Primary route views (Home, Properties, Detail, Agreements, Settlements, Audit)
│   ├── context/            # Global React context (WalletContext for Freighter / Testnet)
│   ├── services/           # API and Stellar Horizon / Soroban RPC communication
│   ├── types/              # Comprehensive TypeScript interfaces
│   └── index.css           # Vanilla CSS design tokens & glassmorphic styling
```

---

## Design System & Style Guidelines

* **Vanilla CSS:** Use CSS variables defined in `src/index.css` (`var(--bg-primary)`, `var(--accent-gold)`, `var(--border-subtle)`). Avoid introducing heavy external CSS utility libraries.
* **Glassmorphism:** Use `.glass-card` classes and subtle border gradients for modern financial clarity.
* **Accessibility (WCAG AA):**
  - Ensure all interactive buttons and modals have descriptive `aria-label` tags.
  - Maintain high color contrast against dark backgrounds.
  - Provide visible keyboard focus indicators (`:focus-visible`).
* **Non-Custodial Wallet Integration:** Maintain clean fallbacks for users without a connected wallet so all public audit and trace features remain fully browsable.

---

## Local Development Workflow

### Prerequisites
* **Node.js**: v20+ with npm v10+
* **Git**: with conventional commit discipline

### Setup & Local Server
```bash
# 1. Install dependencies
npm install

# 2. Run unit and integration tests (16/16 Vitest passing)
npm test

# 3. Validate TypeScript types & production bundle
npm run lint
npm run build

# 4. Start local development server
npm run dev
```

---

## Submitting Pull Requests

1. **Pick an Issue:** Check our [Issue Tracker](https://github.com/Stellar-Estate/stellar-estate-frontend/issues). Look for issues labeled `good first issue` or `ux`. Leave a comment to claim the task.
2. **Create a Feature Branch:**
   ```bash
   git checkout -b feat/export-settlement-csv
   ```
3. **Commit Messages:** Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat(ui): add loading skeleton to WhereDidMyRentGo`
   - `fix(a11y): add escape key listener to FinancialPassportModal`
   - `test(waterfall): add basis points validation test`
4. **Local Verification:** Always run tests and build locally before submitting:
   ```bash
   npm test
   npm run build
   ```
5. **Open Pull Request:** Describe the UX/UI improvement, include screenshots or GIFs where appropriate, and reference the issue (`Closes #1`).

---

## License

By contributing to Stellar Estate Frontend, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).
