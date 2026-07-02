# Campus Notification Portal

A complete, production-ready real-time notification broadcast and read-receipt management system designed for colleges. It allows administrators to govern users, faculty agents to target-publish notifications with PDF/Image attachments, and students to receive updates in real time with automated read-receipt view tracking.

---

## Tech Stack

- **Frontend**: React 18, Vite, Material UI (MUI v5), React Router (v6), Recharts (Analytics Charts), jsPDF & jsPDF-AutoTable (PDF Reports), Axios.
- **Backend & Serverless**: Firebase Authentication, Firebase Cloud Firestore, Firebase Cloud Messaging (FCM), Firebase Cloud Storage.
- **Local Fallback**: Full high-fidelity LocalStorage & Memory mock wrapper that activates automatically when Firebase credentials are not provided.
- **Monorepo Layout**: npm workspaces (`apps/web` and `apps/api`).

---

## Core Features by Role

### 1. Student Portal
- **Real-Time Notification Feed**: Shows alerts matching the student's exact branch, academic year, and section.
- **Search & Advanced Filters**: Filter by priority level, notice category, publication date, or unread status.
- **Sticky Alerts**: High-importance pinned notifications stick to the top of the feed.
- **Read Receipt Logging**: Opens automatically trigger a read receipt registration (timestamps, device profile, user metadata).
- **Resource Downloads**: Seamlessly download attached PDFs or image worksheets.
- **Profile Customization**: Manage avatar photos and academic details.
- **Dark Mode**: High-contrast, sleek dark mode toggle.

### 2. Faculty Agent Portal
- **Broadcast Composer**: Create notifications targeted at specific branches (e.g. CSE), years (1-4), and sections (A-C). Supports expiration timers, future scheduling, and attachment uploads.
- **Read Receipts Auditor**: Selection of a broadcast notice renders a list of students who read it (names, roll IDs, dates, and device types).
- **Analytics Dashboard**: Visual Recharts metrics outlining notification category distribution and priority metrics.
- **Reports Export**: Trigger formatted exports of read receipts to CSV sheets or PDF tables.

### 3. College Administrator Console
- **Agent Governance**: Create new department agents, block/disable active agent profiles, and delete agent access.
- **Students Directory**: Audit rolls and profiles of students registered on the campus network.
- **Global Broadcast Auditor**: Overview list of all notification drafts published across the college.
- **Global Platform Analytics**: Overall read index, engagement levels, and category breakdowns.

---

## Folder Structure

```
.
├── apps
│   ├── web                     # React 18 / Vite / Material UI Frontend
│   │   ├── src
│   │   │   ├── components      # Reusable widgets (Sidebar, Header, PDF/CSV exporters, charts)
│   │   │   ├── config          # Firebase SDK initializers & Local Mock services fallback
│   │   │   ├── context         # AuthContext (sessions/roles) & ThemeContext (MUI dark mode)
│   │   │   ├── pages           # LoginPage, Dashboards (Admin, Agent, Student), Profile, Details
│   │   │   └── routes          # AppRouter protected guards & role-based resolver
│   │   └── package.json
│   └── api                     # Express API Server (boilerplaced with Prisma in-memory fallbacks)
│       └── src
├── firestore.rules             # Production security policies for Firestore
├── package.json                # Root workspaces scripts manager
└── README.md                   # System documentation
```

---

## Installation & Setup Guide

### 1. Install Workspace Dependencies
Execute the command at the root workspace directory to install packages for both the web app and the mock API server:
```bash
npm install
```

### 2. Launch Local Dev Servers
Start the client application and the API concurrently:
```bash
npm run dev
```
- **Web Portal URL**: `http://localhost:5173`
- **Mock API Service**: `http://localhost:4000`

### 3. Demo Credentials
If no Firebase config variables are set, the app boots in **Demo Mode**. You can log in using:
- **Administrator**: `admin@campus.edu` / `admin123`
- **Faculty Agent**: `agent1@campus.edu` / `agent123`
- **Student**: `student1@campus.edu` / `student123`

---

## Firebase Setup Guide

Follow these steps to connect the portal to a live Firebase instance:

### 1. Create a Firebase Project
- Go to the [Firebase Console](https://console.firebase.google.com/) and create a project named **Campus Notification Portal**.

### 2. Enable Authentication
- Navigate to **Build > Authentication > Sign-in method**.
- Enable **Email/Password**.
- Enable **Google** provider (for Student logins).

### 3. Initialize Cloud Firestore
- Navigate to **Build > Firestore Database > Create database**.
- Start in **production mode** and select your region.
- Under the **Rules** tab, paste the contents of `firestore.rules` located in the root of this project and click **Publish**.

### 4. Enable Cloud Storage
- Navigate to **Build > Storage > Get Started**.
- Define rules matching:
  ```
  rules_version = '2';
  service firebase.storage {
    match /b/{bucket}/o {
      match /{allPaths=**} {
        allow read, write: if request.auth != null;
      }
    }
  }
  ```

### 5. Setup Cloud Messaging (FCM) (Optional for Push Alerts)
- Navigate to **Project Settings > Cloud Messaging**.
- Under **Web Configuration**, generate a key pair under **Web Push certificates**.
- Copy the public key string; this is your **VAPID Key**.

### 6. Configure Environment Variables
Create a `.env.local` file inside the `apps/web/` directory and populate it with your Firebase keys:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_web_push_vapid_key
```

*Note: Restart the development server after creating `.env.local`.*

---

## Firestore Security Policies (`firestore.rules`)

The security rules enforce role-based access:
- **Students**: Read-only notifications. Can only create `notificationViews` documents that link to their own student ID.
- **Agents**: Create, update, and delete notifications. Updates and deletions are restricted to notifications they personally created (`resource.data.createdBy == request.auth.uid`). Can read `notificationViews` records.
- **Admins**: Full read and write privileges across all collections (`students`, `agents`, `notifications`, `notificationViews`).

---

## Production Deployment Guide

### 1. Build the Production Bundle
Compile and build the Vite assets:
```bash
npm run build
```
This produces a production bundle in `apps/web/dist/`.

### 2. Host the Frontend
You can host the compiled static directory on:
- **Firebase Hosting**: Run `firebase init hosting`, select `apps/web/dist` as your public folder, and execute `firebase deploy`.
- **Vercel** / **Netlify**: Configure build command to `npm run build` and directory output to `apps/web/dist`.
