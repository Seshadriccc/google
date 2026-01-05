# 🛡️ TrustLoop AI - Anonymous Student Grievance System

**Verified Identity. Absolute Anonymity.**

TrustLoop AI is a secure, anonymous reporting platform designed for educational institutions. It empowers students to report issues (Hostel, Mess, Academics, Harassment) without fear, while using **Generative AI (Google Gemini)** to normalize informal or toxic language into professional, actionable complaints for administration.

---

## 🚀 Key Features

*   **🔒 Complete Anonymity**: Students lodge complaints anonymously. Identity is only revealed for repeated abuse (3 strikes).
*   **🤖 AI Normalization**: Built-in Gemini AI sanitizes "rant-style" complaints into formal office language (e.g., *"Food is gross"* → *"The quality of the mess food requires improvement"*).
*   **multi-Role Dashboards**:
    *   **Student**: Submit issues, track status, view AI-rewritten text.
    *   **Warden**: Manage Hostel/Mess issues, post updates, resolve or escalate.
    *   **Academic Staff**: Dedicated board for academic/course-related issues.
    *   **HoD (Head of Dept)**: Handle escalated issues.
    *   **Principal**: View campus-wide analytics and critical alerts.
*   **🔥 Live Updates**: Real-time status tracking with Firebase Firestore.

---

## 🛠️ Tech Stack

*   **Frontend**: React + Vite + Tailwind CSS
*   **Backend**: Firebase (Auth, Firestore, Storage, Functions)
*   **AI**: Google Gemini API (`gemini-1.5-flash`)

---

## 🏃‍♂️ Quick Start Guide

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/trustloop-ai.git
cd trustloop-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a file named `.env.local` in the root folder. You need your own Firebase and Gemini API keys.

**Copy & Paste this into `.env.local`:**

```env
# Firebase Configuration (Get these from Firebase Console > Project Settings)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Gemini AI Key (Get from aistudio.google.com)
VITE_GEMINI_KEY=your_gemini_api_key
```

### 4. Run the Dev Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Demo Credentials (Quick Access)

Use these accounts to test different roles immediately:

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Student** | `student@demo.com` | `demo123` | Submit issues |
| **Warden** | `warden@demo.com` | `demo123` | Hostel/Mess management |
| **Staff** | `staff@demo.com` | `demo123` | Academic issues |
| **HoD** | `hod@demo.com` | `demo123` | Escalated issues |
| **Principal** | `principal@demo.com` | `demo123` | Analytics view |

---

## 📜 License
MIT License
