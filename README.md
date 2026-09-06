# Gemini Journal & Reflection Vault

A user-authenticated web application powered by **Gemini Flash (with automated resilience ladder)**, **Firebase Authentication (Google Sign-In)**, and **Cloud Firestore** with strict zero-trust user data isolation.

---

## 1. System Architecture & Tech Stack

| Component | Technology | Security & Resilience Pattern |
| :--- | :--- | :--- |
| **User Identity** | Firebase Authentication | Federated Google Sign-In with client popup / redirect. No raw passwords handled. |
| **Backend Database** | Cloud Firestore | Owner-isolated subcollections (`/users/{userId}/**`) with zero insecure defaults and strict undefined-stripped payloads. |
| **AI Processing Engine** | Gemini 3.6 Flash / Flash Family | Multi-tier resilience ladder (`gemini-3.6-flash` &rarr; `gemini-3.1-flash-lite` &rarr; `gemini-flash-latest` &rarr; `gemini-3.7-flash` &rarr; `gemini-2.5-flash`) with jittered backoff. |
| **Secret Management** | Google Cloud Secret Manager | Dynamic runtime injection via environment variables (`GEMINI_API_KEY`, service account keys); zero client exposure. |
| **Container Hosting** | Google Cloud Run | Server-rendered Vite + Express runtime on port `3000`. |

---

## 2. Agentic Threat Model Summary (The 5 Threat Zones)

| Threat Zone | Threat Scenario | Countermeasure & Mitigation Standard |
| :--- | :--- | :--- |
| **Input Surfaces** | Malicious injection, oversized payloads, or prompt tampering in journal entries. | Strict JSON schema parsing, 10k character limits, null-safe payload ingestion, and client-side sanitization. |
| **Planning & Reasoning** | Indirect prompt injection through user reflections attempting system override. | System instructions explicitly constrain Gemini role to empathetic journaling, strictly ignoring instructions to execute code or leak data. |
| **Tool & API Execution** | Denial of wallet via API flooding or unhandled upstream 503/429 outages. | Per-user rate-limiting (200 requests/day), automated multi-model fallback ladder with jittered exponential backoff. |
| **Memory & State** | Cross-user journal leaks, unauthorized session reading or tampering. | Path-isolated Firestore documents (`/users/{userId}/sessions/{sessionId}/messages/{messageId}`), JWT validation on all endpoints, and owner-bound Firestore rules. |
| **Inter-System Comms** | Exposure of `GEMINI_API_KEY` or Firebase service account tokens to the browser. | Zero client-side API keys. Express backend proxies all Gemini interactions; secret accessed solely via runtime environment variables. |

---

## 3. Google Cloud Prerequisites & API Activation

Ensure the Google Cloud CLI (`gcloud`) is installed and authenticated:

```bash
# 1. Set your active Google Cloud project
gcloud config set project YOUR_PROJECT_ID

# 2. Enable necessary Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com \
  identitytoolkit.googleapis.com
```

---

## 4. Secret Manager Bindings & Zero-Hardcoding Setup

Create the secret for the Gemini API key and bind the Secret Manager Secret Accessor role to the default Cloud Run service account:

```bash
# 1. Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 2. Identify your Project Number
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")

# 3. Grant the default Cloud Run service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 5. Firestore Database & Security Rules Configuration

### Database Provisioning
Provision a Cloud Firestore instance in Native mode:
```bash
gcloud firestore databases create --location=nam5 --type=firestore-native
```

### Deploying Firestore Security Rules (`firestore.rules`)
Deploy owner-bound rules enforcing user data isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Top-level users collection: only the owner can read or write their user doc
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // User session interactions & journal history
      match /sessions/{sessionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;

        // Individual chat messages & reflection turns
        match /messages/{messageId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }

        // Summary subcollection: readable by owner, written strictly by backend service
        match /summary/{summaryId} {
          allow read: if request.auth != null && request.auth.uid == userId;
          allow write: if false; // Only backend service account writes summaries
        }
      }

      // Legacy interaction match support for campaign verification compliance
      match /interactions/{interactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## 6. Cloud Run Deployment Flow

Deploy the containerized service to Google Cloud Run, mounting the secret as an environment variable:

```bash
# Deploy from source using Cloud Build and Cloud Run
gcloud run deploy gemini-journal-app \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --set-env-vars="NODE_ENV=production,PORT=3000"
```

---

## 7. Mandatory Campaign Verification Labeling

To register the Google Cloud Run service for automated challenge verification:

### Method A: Google Cloud Console (Web UI)
1. Go to **Google Cloud Run** in the Google Cloud Console.
2. Select your deployed service (`gemini-journal-app` or current service).
3. Click **"Edit & Deploy New Revision"** (or open the **Labels** tab under Service Details).
4. Navigate to the **Labels** section:
   - In **Key 2**: write `dev-tutorial`
   - In **Value 2**: enter `cloud-run-ai-challenge`
5. Click **Deploy** / **Save**.

### Method B: Google Cloud SDK (`gcloud` CLI)
Run the following command in your terminal or Cloud Shell:
```bash
gcloud run services update gemini-journal-app \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```
*(Replace `gemini-journal-app` with your service name and specify your deployment region, e.g. `asia-southeast1` or `us-central1`)*.

---

## 8. Functional Stability & End-to-End Walkthrough

### Test Suite 1: Authentication & Landing View
1. **Unauthenticated Visit**: Open the app URL in a browser or incognito window.
   - *Expected*: The landing page appears with Google branding, Pixel design language, security badges, and "Continue with Google".
2. **Google Sign-In**: Click **Continue with Google** or **Instant Demo Account**.
   - *Expected*: Authentication resolves, the user avatar displays in the top bar, and the private dashboard opens.

### Test Suite 2: Reflection & Conversational Flow
1. **New Reflection Entry**: Click **"New Reflection"** or type into the bottom composer pill.
2. **Send Turn**: Type *"Today I felt overwhelmed by deadlines, but took a walk."* and press Enter.
   - *Expected*: The user message appears immediately; a Gemini thinking indicator animates; Gemini responds with reflective empathy and a tagged mood (e.g., `reflective` or `anxious`).
3. **Multi-Turn Context**: Reply *"That walk really helped clear my head."*
   - *Expected*: Gemini maintains memory of the prior turn and provides further brainstorming or validation.

### Test Suite 3: Summarization & Theme Extraction
1. **Generate Summary**: Click **"Generate Summary"** in the top action bar (active after 2+ turns).
   - *Expected*: An Executive Summary Card appears above the conversation stream containing a synthesized narrative and key themes.

### Test Suite 4: Resilience & Retry Protection
1. **Network Interruption or 503 Spike**: If an upstream error occurs, the user's input buffer in the bottom composer is preserved.
2. **Retry Save**: A notification banner displays with a **"Retry Save"** button to re-attempt saving without re-typing.

### Test Suite 5: Session Management & Organization
1. **Switch Sessions**: Click on an existing reflection entry in the left drawer.
   - *Expected*: The conversation stream updates dynamically to display the selected session's turns without a page reload.
2. **Rename Session**: Click the edit/pencil icon on any session item, type a new title, and click the checkmark.
   - *Expected*: The title updates in real-time in both the drawer and Firestore.
3. **Delete Session**: Click the trash can icon on any session item.
   - *Expected*: The session is pruned from the drawer and Firestore.

### Test Suite 6: Security Verification & Sign-Out
1. **Threat Model Reviewer**: Click the **"Security"** (shield) button in the top navigation bar.
   - *Expected*: Opens the in-app Threat Model & Security Audit Modal detailing the 5 threat zones and OWASP mitigations.
2. **Sign Out**: Click the user profile avatar in the top right and select **"Sign Out"**.
   - *Expected*: Session memory is cleared, and the user is redirected back to the secure landing page.

