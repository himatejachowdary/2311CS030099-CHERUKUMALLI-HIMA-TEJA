import * as fs from 'fs';
import * as path from 'path';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Load .env.local variables manually
const envPath = path.join(process.cwd(), 'apps/web/.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value.trim();
    }
  });
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("Error: Firebase configurations are not set in .env.local.");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const USERS = [
  {
    email: 'admin@campus.edu',
    password: 'admin123',
    role: 'admin',
    name: 'Campus Administrator',
  },
  {
    email: 'agent1@campus.edu',
    password: 'agent123',
    role: 'agent',
    name: 'Dr. Ananya Sen',
    department: 'CSE',
  },
  {
    email: 'student1@campus.edu',
    password: 'student123',
    role: 'student',
    name: 'Rahul Sharma',
    branch: 'CSE',
    year: '3',
    section: 'A',
  }
];

async function seed() {
  console.log("Seeding users to Firebase Auth and Firestore...");
  
  for (const u of USERS) {
    let uid = '';
    try {
      // 1. Try to create the user in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, u.email, u.password);
      uid = cred.user.uid;
      console.log(`Created new auth user: ${u.email} (UID: ${uid})`);
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        // 2. If already exists, sign in to get the UID
        const cred = await signInWithEmailAndPassword(auth, u.email, u.password);
        uid = cred.user.uid;
        console.log(`User already exists in Auth: ${u.email} (UID: ${uid})`);
      } else {
        console.error(`Failed to register ${u.email} in Auth:`, e.message);
        continue;
      }
    }

    // 3. Create or update profile records in Firestore
    try {
      if (u.role === 'agent') {
        const agentDoc = doc(db, 'agents', uid);
        await setDoc(agentDoc, {
          id: uid,
          name: u.name,
          email: u.email,
          department: u.department || 'CSE',
          status: 'active',
          createdAt: new Date().toISOString()
        }, { merge: true });
        console.log(`Updated Firestore agent profile: agents/${uid}`);
      } else if (u.role === 'student') {
        const studentDoc = doc(db, 'students', uid);
        await setDoc(studentDoc, {
          id: uid,
          name: u.name,
          email: u.email,
          branch: u.branch || 'CSE',
          year: u.year || '1',
          section: u.section || 'A',
          createdAt: new Date().toISOString()
        }, { merge: true });
        console.log(`Updated Firestore student profile: students/${uid}`);
      } else {
        console.log(`No Firestore profile record required for admin user.`);
      }
    } catch (e: any) {
      console.error(`Failed to update Firestore profile for ${u.email}:`, e.message);
    }
  }
  
  console.log("Seeding process completed successfully.");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seeding crashed:", err);
  process.exit(1);
});
