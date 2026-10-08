# Security Policy — Stellar Estate Frontend

The Stellar Estate team is committed to ensuring the safety, privacy, and non-custodial integrity of the **Stellar Estate Frontend** web application. We appreciate the responsible disclosure of any security vulnerabilities discovered by the community.

---

## Supported Versions

Only the latest production deployment on Netlify and the current `main` branch of `stellar-estate-frontend` receive security patches and updates.

| Branch / Deployment | Status |
| :--- | :--- |
| `main` branch | :white_check_mark: Supported |
| Production ([https://stellar-estate-app.netlify.app](https://stellar-estate-app.netlify.app)) | :white_check_mark: Supported |
| Outdated forks / local builds | :x: Unsupported |

---

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues or public discussions.**

If you discover a security flaw or vulnerability affecting the frontend application:

1. **Email:** Send your report to **`security@stellar-estate.org`**.
2. **GitHub Security Advisory:** Submit a private report via the [Security Advisories](https://github.com/Stellar-Estate/stellar-estate-frontend/security/advisories) tab on GitHub.

### What to Include in Your Report
* **Summary:** Detailed explanation of the vulnerability and its potential impact.
* **Component:** Affected page (`SettlementsPage`, `AgreementsPage`, `RevenueDepositModal`), wallet context, or client service.
* **Reproduction Steps:** Clear, reproducible steps or video showing how the vulnerability is triggered.
* **Impact:** Whether the issue involves client-side secret exposure, cross-site scripting (XSS), wallet signing spoofing, or clickjacking.

---

## Response Timeline

* **Initial Acknowledgment:** Within **24 hours**.
* **Triage & Assessment:** Within **48 hours**, confirming severity and assigning priority.
* **Remediation & Patch:** Fix pushed to `main` and automatically deployed to production on Netlify within **3 to 7 business days** (or faster for critical issues).
* **Coordinated Disclosure:** Security advisory released once the production site is safe.

---

## Frontend Security Principles & Invariants

Maintainers and contributors must follow these strict security principles:

### 1. Non-Custodial Architecture & Key Safety
* **Zero Secret Storage:** The frontend application **never** generates, stores, transmits, or logs secret keys (`S...` keys) or seed phrases in `localStorage`, `sessionStorage`, cookies, or browser console logs.
* **Delegated Wallet Signing:** Transaction signing is delegated exclusively to browser extension wallets (e.g. Freighter) or simulated strictly in ephemeral memory for test accounts.
* **Visual Transaction Confirmation:** All transaction operations (deposits, agreement locks, settlement executions) require explicit user confirmation with visible amount and recipient breakdown before invocation.

### 2. Client-Side Security Practices
* **Content Security & Sanitization:** All dynamic user inputs (property names, custom descriptions, transaction hashes) are sanitized to prevent Cross-Site Scripting (XSS).
* **External Links:** All links leading to external block explorers (Stellar.Expert) use `rel="noreferrer noopener"` and `target="_blank"` to protect against tab-nabbing.
* **Dependency Auditing:** Automated npm vulnerability scanning runs as part of every CI build (`npm audit`).

---

## Acknowledgments

We thank researchers who practice responsible disclosure and will credit you in our release notes and GitHub Security Advisories.
