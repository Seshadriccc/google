# TrustLoop AI: Engineering & Architecture Report

## 🏆 Innovation Summary
TrustLoop AI is not just a grievance portal—it is an **Governance Enforcer** that balances two conflicting needs in an educational institution: **Student Anonymity** and **Institutional Accountability**.

Unlike standard forms that are either "Full Anonymous" (breeding toxicity) or "Full Identity" (breeding fear), TrustLoop uses **Generative AI (Gemini 1.5 Flash)** as a middleware to neutralize toxicity while preserving the core message. We implement a strict **"3-Strike Identity Reveal"** protocol that enforces professionalism programmatically.

---

## 🏗️ Technical Architecture (Vercel + Firebase + Gemini)

The system follows a modern **Serverless Architecture** optimized for speed, security, and low cost.

### 1. The Frontend: React (Vite) & Tailwind CSS
*   **Why?** Chosen for sub-second load times and component modularity.
*   **Key Components:**
    *   `StudentPortal.jsx`: Features a **Real-time AI Feedback Loop**. As the student types, we do not just validte; we *guide* them towards professional language.
    *   `HeatmapChart.jsx`: A custom visualization component that maps grievance density to physical campus locations.
    *   **Role-Based Access Control (RBAC):** `AuthGuard.jsx` ensures strict separation of concerns. Students cannot see dashboards; Wardens cannot see Principal analytics.

### 2. The Intelligence Layer: Google Gemini 1.5 Flash (via Vercel Serverless)
*   **Security First:** We do **not** expose the Gemini API Key on the client. All AI requests are routed through a Vercel Serverless Function (`/api/neutralize`).
*   **The Logic:**
    *   **Input:** Raw student text + User Strike Count.
    *   **Process:** Gemini analyzes sentiment.
        *   *Toxic?* -> Increment Strike. Return Warning.
        *   *Clean?* -> Normalize tone. Return Safe Text.
    *   **Output:** JSON payload with `isAbusive` flag and `normalizedText`.

### 3. The Backend: Firebase Firestore & Auth
*   **Real-time Synchronization:** The Warden Dashboard listens to the `issues` collection in real-time (`onSnapshot`). No page refreshes required to see new tickets.
*   **State Persistence:** Strike counts are stored in `users/{uid}/strikes`, ensuring that refreshing the browser does not reset a user's "Bad Behavior" history.

---

## 🛡️ Security & Scalability Features

1.  **Identity Piercing Protocol:**
    *   The system maintains a **Shadow Link** between the anonymous ticket and the user's `uid`.
    *   If `strikes >= 3`, the frontend forces the `author` field to fetch `auth.currentUser.displayName` instead of the string "Anonymous". This is enforced at the API/Client logic level (and can be secured further via Firestore Rules).

2.  **Edge Caching (Vercel):**
    *   Static assets are cached at the edge, ensuring the site loads instantly even on poor college Wi-Fi.

3.  **Audit Trails:**
    *   Escalations to the HoD are logged with timestamps (`escalatedAt`) and reasons, creating an immutable timeline of negligence or action.

---

## 🚀 How to Demo (Judge's Guide)

1.  **The "Toxic" Flow:**
    *   Log in as a Student.
    *   Type a rude message (e.g., "This stupid mesh wifi sucks").
    *   Observation: See the **Warning** and **Strike Counter** increase.
    *   Repeat 3 times -> Observe **"Identity Revealed"** alert.

2.  **The "Professional" Flow:**
    *   Type a valid complaint.
    *   Observation: See it appear instantly on the **Warden Dashboard** (open a second incognito window to see the real-time sync).

3.  **The "Executive" Flow:**
    *   Navigate to `/analytics` (Principal View).
    *   Observe the **Heatmap**: It visually correlates infrastructure failure with location (e.g., lots of "Plumbing" issues in "Hostel B"), empowering data-driven budget decisions.

---

**TrustLoop AI is production-ready, secure by design, and solves a real human problem with Generative AI.**
