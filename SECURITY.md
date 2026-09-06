# SECURITY.md — Personal Gemini Journal Threat Model & Security Architecture

This document formalizes the threat model, isolation guarantees, and operational security boundaries for the **Personal Gemini Journal** application, in accordance with the project's zero-trust security standards.

---

## 1. Threat Model & Trust Boundaries

### 1.1 Identified Trust Boundaries
- **Untrusted Browser Client**: The frontend runs in the user's browser (or sandboxed iframe) and must be assumed to be potentially compromised, inspected, or manipulated by an adversary. No client-asserted `uid`, role, or resource ownership is ever trusted.
- **Trusted Express Backend**: The backend is the single authorized intermediary between the client, the database, and the Gemini AI service. It executes token verification, identity derivation, input sanitization, rate limiting, and administrative Firestore writes.
- **AI Processing Boundary (Google GenAI / Gemini)**: User journal entries are processed by Gemini (`gemini-3.8-flash`). The Gemini API key is securely stored in server environment secrets and is **never** dispatched to or bundled in the browser.
- **Database Boundary (Cloud Firestore)**: Evaluates access control twice: first in application logic, and second at the database rule boundary via `firestore.rules`.

### 1.2 Identified Threats & Mitigations

| Threat | Impact | Mitigation |
|---|---|---|
| **Identity Spoofing** | Attacker claims another user's UID in request body or headers | Identity is derived strictly server-side by verifying the cryptographic signature of the Firebase ID Token (`Authorization: Bearer <idToken>`). Request body user IDs are ignored. |
| **Resource Enumeration / Information Leakage** | Attacker probes valid session IDs by observing 403 vs 404 responses | Backend endpoints strictly return **404 Not Found** (instead of 403) when an unowned session ID is queried, preventing attackers from confirming resource existence. |
| **Denial-of-Wallet (Token Exhaustion)** | Malicious or runaway requests consume excessive Gemini API tokens | Strict character length constraints (max 10,000 chars per message), request throttling, and per-user daily message caps. |
| **Tampering with AI Summaries** | Client attempts to falsify or manipulate AI journal summaries | Firestore Security Rules explicitly forbid direct client-side writes to `/users/{uid}/sessions/{sessionId}/summary/**` (`allow write: if false;`). Only the trusted backend Admin SDK can persist summaries. |
| **Cross-Tenant Data Exposure** | Accidental data leakage between different users | Data is partitioned hierarchically under `/users/{uid}/**`. Security rules enforce `request.auth.uid == uid` with global default-deny. |
| **Stored / Reflected XSS** | Malicious script injected via journal content or AI responses | React DOM output encoding + sanitization in `react-markdown` prevents raw HTML execution. |

---

## 2. Secrets Management

In adherence to zero-trust principles:
- **No hardcoded secrets**: All credentials are provisioned via environment variables / Secret Manager.
- **Zero frontend exposure**: The `GEMINI_API_KEY` is referenced strictly server-side in `server.ts`.
- **Telemetry and User-Agent**: The backend passes `User-Agent: aistudio-build` in GenAI client initialization options.

### Required Secrets & Configuration Keys (Names Only)
1. `GEMINI_API_KEY` — Server-side authentication key for the Google GenAI SDK.
2. `APP_URL` — Canonical application URL.
3. `FIREBASE_PROJECT_ID` — Target Firebase project ID for token verification.
4. `FIREBASE_SERVICE_ACCOUNT_KEY` — (Optional) Service account credentials for headless/production Admin SDK environments.

---

## 3. Data Isolation & Access Control Schema

```
/users/{uid}                                    [Read/Write: owner only]
  └── /sessions/{sessionId}                     [Read/Write: owner only, validated IDs]
        ├── /messages/{messageId}               [Read/Write: owner only, validated IDs]
        └── /summary                            [Read: owner only | Write: BACKEND ADMIN ONLY]
```

---

## 4. Phase 3 Feature Enhancements: Security Impact Notes

1. **Mood & Sentiment Analysis**:
   - Mood tags are generated during the server-side Gemini chat pipeline.
   - Trend aggregation (`/api/insights/trends`) executes strictly over the caller's verified UID and does not query across tenants.
2. **Voice Journaling**:
   - Transcripts captured via the client Web Speech API undergo the exact same server-side validation and token verification as typed entries before reaching Gemini or Firestore.
3. **Journal Export**:
   - The export endpoint re-verifies ownership of every session and turn before assembling the sanitized, encrypted-ready JSON export bundle.
