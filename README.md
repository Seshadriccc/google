# TrustLoop AI - Anonymous Student Grievance System

TrustLoop AI is a secure, anonymous reporting platform for educational institutions. It uses Google Gemini AI to normalize student grievances—removing toxicity and identifying abusive language—before they reach administration. This ensures students can report issues safely while maintaining professional standards for staff.

## Features

*   **Anonymous Reporting**: Students can report issues (Hostel, Mess, Academics, etc.) without fear of retaliation.
*   **AI Normalization (Gemini)**: "Toxic" or informal complaints are rewritten into professional office language automatically.
*   **Warden & Staff Dashboards**: Dedicated dashboards for Wardens and Academic Staff to view, update, and resolve issues.
*   **Escalation Logic**: Unresolved issues can be manually escalated to the Head of Department (HoD).
*   **Real-time Updates**: Live status tracking using Firebase Firestore.

## Tech Stack

*   **Frontend**: React (Vite) + Tailwind CSS
*   **Backend / DB**: Firebase (Auth, Firestore, Storage)
*   **AI**: Google Gemini API (`gemini-1.5-flash`)

## Setup Instructions

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/trustloop-ai.git
    cd trustloop-ai
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory and add your Firebase and Gemini credentials:

    ```env
    # Firebase Configuration
    VITE_FIREBASE_API_KEY=your_firebase_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    VITE_FIREBASE_APP_ID=your_app_id

    # Google Gemini AI Key
    VITE_GEMINI_KEY=your_gemini_api_key
    ```

4.  **Run Locally**
    ```bash
    npm run dev
    ```

## Firebase Security Rules
Ensure your Firestore rules allow read/write for authenticated users:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## License
MIT
