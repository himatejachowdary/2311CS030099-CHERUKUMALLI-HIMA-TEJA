import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  FieldValue
} from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// --- Types ---
export interface Student {
  id: string;
  name: string;
  email: string;
  branch: string;
  year: string;
  section: string;
  deviceToken?: string;
  photoURL?: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  department: string;
  status: 'active' | 'disabled';
  photoURL?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'Placement' | 'Events' | 'Results' | 'Hackathons' | 'Internships' | 'Workshops' | 'Exams' | 'Scholarships' | 'General';
  priority: 'Low' | 'Medium' | 'High';
  createdBy: string; // Agent ID or "admin"
  createdByName: string;
  createdAt: string;
  attachment?: {
    name: string;
    url: string;
    type: string;
  } | null;
  imageURL?: string | null;
  targetBranch: string; // e.g. "CSE" or "All"
  targetYear: string;   // e.g. "3" or "All"
  targetSection: string;// e.g. "A" or "All"
  isActive: boolean;
  isPinned?: boolean;
  expiryDate?: string | null;
}

export interface NotificationView {
  id: string;
  notificationId: string;
  studentId: string;
  studentName: string;
  viewedAt: string;
  device: string;
}

export interface UserSession {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'agent' | 'student';
}

// --- Firebase Initialization ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase configuration is complete and mock mode is not forced
export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.projectId &&
  import.meta.env.VITE_USE_MOCK_MODE !== 'true'
);

let app: any;
let firestoreDb: any;
let firebaseAuth: any;
let firebaseStorage: any;
let firebaseMessaging: any;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firestoreDb = getFirestore(app);
    firebaseAuth = getAuth(app);
    firebaseStorage = getStorage(app);
    try {
      firebaseMessaging = getMessaging(app);
    } catch (e) {
      console.warn("FCM not supported on this browser/environment:", e);
    }
    console.log("Firebase services initialized successfully.");
  } catch (error) {
    console.error("Firebase initialization failed, defaulting to Mock Mode:", error);
  }
} else {
  console.log("Firebase API Key is missing. Running in Mock/Demo mode using LocalStorage.");
}

// --- Mock Seeding Helper ---
const MOCK_STORAGE_KEY_PREFIX = "campus_portal_";
const getMockData = <T>(key: string, initialSeed: T[]): T[] => {
  const stored = localStorage.getItem(MOCK_STORAGE_KEY_PREFIX + key);
  if (!stored) {
    localStorage.setItem(MOCK_STORAGE_KEY_PREFIX + key, JSON.stringify(initialSeed));
    return initialSeed;
  }
  return JSON.parse(stored);
};

const saveMockData = <T>(key: string, data: T[]) => {
  localStorage.setItem(MOCK_STORAGE_KEY_PREFIX + key, JSON.stringify(data));
};

// Seed mock users
const SEEDED_AGENTS: Agent[] = [
  { id: "agent_001", name: "Dr. Ananya Sen", email: "agent1@campus.edu", department: "CSE", status: "active", createdAt: "2026-06-01T08:00:00Z" },
  { id: "agent_002", name: "Prof. Rajesh Kumar", email: "agent2@campus.edu", department: "ECE", status: "active", createdAt: "2026-06-02T09:00:00Z" },
  { id: "agent_003", name: "Dr. Kavitha Nair", email: "agent3@campus.edu", department: "MECH", status: "disabled", createdAt: "2026-06-03T10:00:00Z" }
];

const SEEDED_STUDENTS: Student[] = [
  { id: "stud_001", name: "Rahul Sharma", email: "student1@campus.edu", branch: "CSE", year: "3", section: "A", createdAt: "2026-06-01T09:10:00Z" },
  { id: "stud_002", name: "Anjali Gupta", email: "student2@campus.edu", branch: "CSE", year: "4", section: "B", createdAt: "2026-06-01T10:15:00Z" },
  { id: "stud_003", name: "Vikram Malhotra", email: "student3@campus.edu", branch: "ECE", year: "2", section: "A", createdAt: "2026-06-02T11:20:00Z" },
  { id: "stud_004", name: "Priya Patel", email: "student4@campus.edu", branch: "CSE", year: "3", section: "A", createdAt: "2026-06-02T12:30:00Z" }
];

const SEEDED_NOTIFICATIONS: Notification[] = [
  {
    id: "notif_001",
    title: "TechCore Final Year Placements Drive",
    description: "TechCore is visiting our campus on July 5th for a recruitment drive targeting CSE and ECE final-year students. Eligibility: CGPA > 8.0, No active backlogs. Make sure to update your profiles and upload resumes before the drive.",
    type: "Placement",
    priority: "High",
    createdBy: "agent_001",
    createdByName: "Dr. Ananya Sen",
    createdAt: "2026-07-01T07:30:00Z",
    targetBranch: "CSE",
    targetYear: "4",
    targetSection: "All",
    isActive: true,
    isPinned: true,
    attachment: { name: "techcore_job_description.pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", type: "application/pdf" }
  },
  {
    id: "notif_002",
    title: "Semester 4 Results Published",
    description: "The results for Semester 4 examinations have been officially published. Students can view their grade sheets in the online portal. For re-evaluation requests, submit the form before July 10th.",
    type: "Results",
    priority: "Medium",
    createdBy: "agent_002",
    createdByName: "Prof. Rajesh Kumar",
    createdAt: "2026-07-02T05:00:00Z",
    targetBranch: "All",
    targetYear: "2",
    targetSection: "All",
    isActive: true,
    attachment: null
  },
  {
    id: "notif_003",
    title: "Annual Smart Campus Hackathon 2026",
    description: "Register for the annual campus innovation hackathon. Cash prizes up to $5000. Team sizes 2-4 members. Ideas must address energy, connectivity, or administration efficiency. Registrations close on July 15th.",
    type: "Hackathons",
    priority: "High",
    createdBy: "agent_001",
    createdByName: "Dr. Ananya Sen",
    createdAt: "2026-06-29T10:45:00Z",
    targetBranch: "All",
    targetYear: "All",
    targetSection: "All",
    isActive: true,
    isPinned: false
  }
];

const SEEDED_VIEWS: NotificationView[] = [
  { id: "view_001", notificationId: "notif_001", studentId: "stud_002", studentName: "Anjali Gupta", viewedAt: "2026-07-01T09:15:00Z", device: "Desktop (Windows, Chrome)" },
  { id: "view_002", notificationId: "notif_002", studentId: "stud_001", studentName: "Rahul Sharma", viewedAt: "2026-07-02T05:30:00Z", device: "Mobile (Android, Chrome)" },
  { id: "view_003", notificationId: "notif_002", studentId: "stud_003", studentName: "Vikram Malhotra", viewedAt: "2026-07-02T06:12:00Z", device: "Desktop (macOS, Safari)" }
];

// --- High Fidelity Authentication Service ---
export const authService = {
  registerStudent: async (studentData: Omit<Student, 'id' | 'createdAt'>, password = "student123"): Promise<Student> => {
    if (isFirebaseConfigured) {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, studentData.email, password);
      const newStudent: Student = {
        id: credential.user.uid,
        ...studentData,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(firestoreDb, 'students', newStudent.id), newStudent);
      return newStudent;
    } else {
      return new Promise((resolve) => {
        setTimeout(() => {
          const students = getMockData<Student>("students", SEEDED_STUDENTS);
          const newStudent: Student = {
            id: "stud_" + Date.now(),
            ...studentData,
            createdAt: new Date().toISOString()
          };
          students.push(newStudent);
          saveMockData("students", students);
          resolve(newStudent);
        }, 600);
      });
    }
  },

  login: async (email: string, password: string): Promise<UserSession> => {
    if (isFirebaseConfigured) {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;
      
      // Determine role from firestore custom user logs or simple prefix rules
      let role: 'admin' | 'agent' | 'student' = 'student';
      if (email.startsWith('admin')) {
        role = 'admin';
      } else {
        // Fetch from firestore
        const agentDoc = await getDoc(doc(firestoreDb, 'agents', user.uid));
        if (agentDoc.exists()) {
          const status = agentDoc.data()?.status;
          if (status === 'disabled') {
            await signOut(firebaseAuth);
            throw new Error("Your account has been disabled by the administrator.");
          }
          role = 'agent';
        } else {
          role = 'student';
        }
      }
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role
      };
    } else {
      // Mock Authentication
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const cleanedEmail = email.toLowerCase().trim();
          
          if (cleanedEmail === "admin@campus.edu" && password === "admin123") {
            resolve({
              uid: "admin_uid",
              email: "admin@campus.edu",
              displayName: "Campus Administrator",
              photoURL: null,
              role: "admin"
            });
            return;
          }

          const agents = getMockData<Agent>("agents", SEEDED_AGENTS);
          const matchedAgent = agents.find(a => a.email === cleanedEmail);
          if (matchedAgent) {
            if (password === "agent123") {
              if (matchedAgent.status === 'disabled') {
                reject(new Error("Your account has been disabled by the administrator."));
                return;
              }
              resolve({
                uid: matchedAgent.id,
                email: matchedAgent.email,
                displayName: matchedAgent.name,
                photoURL: matchedAgent.photoURL || null,
                role: "agent"
              });
              return;
            }
          }

          const students = getMockData<Student>("students", SEEDED_STUDENTS);
          const matchedStudent = students.find(s => s.email === cleanedEmail);
          if (matchedStudent) {
            if (password === "student123") {
              resolve({
                uid: matchedStudent.id,
                email: matchedStudent.email,
                displayName: matchedStudent.name,
                photoURL: matchedStudent.photoURL || null,
                role: "student"
              });
              return;
            }
          }

          reject(new Error("Invalid email or password credentials."));
        }, 800);
      });
    }
  },

  loginWithGoogle: async (): Promise<UserSession> => {
    if (isFirebaseConfigured) {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(firebaseAuth, provider);
      const user = userCredential.user;
      
      const studentDocRef = doc(firestoreDb, 'students', user.uid);
      const studentDoc = await getDoc(studentDocRef);
      if (!studentDoc.exists()) {
        const newStudent: Student = {
          id: user.uid,
          name: user.displayName || "Google Student",
          email: user.email || "",
          branch: "CSE", // default
          year: "1",
          section: "A",
          createdAt: new Date().toISOString()
        };
        if (user.photoURL) {
          newStudent.photoURL = user.photoURL;
        }
        await setDoc(studentDocRef, newStudent);
      }

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'student'
      };
    } else {
      // Mock Google Login
      return new Promise((resolve) => {
        setTimeout(() => {
          const students = getMockData<Student>("students", SEEDED_STUDENTS);
          const mockGoogleStudent: Student = {
            id: "stud_google",
            name: "Google Student Demo",
            email: "google_student@campus.edu",
            branch: "CSE",
            year: "3",
            section: "A",
            photoURL: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
            createdAt: new Date().toISOString()
          };
          
          if (!students.some(s => s.id === mockGoogleStudent.id)) {
            students.push(mockGoogleStudent);
            saveMockData("students", students);
          }
          
          resolve({
            uid: mockGoogleStudent.id,
            email: mockGoogleStudent.email,
            displayName: mockGoogleStudent.name,
            photoURL: mockGoogleStudent.photoURL || null,
            role: "student"
          });
        }, 800);
      });
    }
  },

  logout: async (): Promise<void> => {
    if (isFirebaseConfigured) {
      await signOut(firebaseAuth);
    } else {
      return new Promise((resolve) => setTimeout(resolve, 400));
    }
  },

  onAuthStateChanged: (callback: (user: UserSession | null) => void): (() => void) => {
    if (isFirebaseConfigured) {
      return onAuthStateChanged(firebaseAuth, async (user: FirebaseUser | null) => {
        if (user) {
          let role: 'admin' | 'agent' | 'student' = 'student';
          if (user.email?.startsWith('admin')) {
            role = 'admin';
          } else {
            const agentDoc = await getDoc(doc(firestoreDb, 'agents', user.uid));
            if (agentDoc.exists()) {
              role = 'agent';
            }
          }
          callback({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role
          });
        } else {
          callback(null);
        }
      });
    } else {
      // Mock Auth State listener
      const activeSessionStr = sessionStorage.getItem("campus_portal_session");
      if (activeSessionStr) {
        callback(JSON.parse(activeSessionStr));
      } else {
        callback(null);
      }
      // Return dummy unsubscribe function
      return () => {};
    }
  },

  resetPassword: async (email: string): Promise<void> => {
    if (isFirebaseConfigured) {
      await sendPasswordResetEmail(firebaseAuth, email);
    } else {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const allEmails = [
            "admin@campus.edu", 
            ...SEEDED_AGENTS.map(a => a.email), 
            ...SEEDED_STUDENTS.map(s => s.email)
          ];
          if (allEmails.includes(email.toLowerCase().trim())) {
            resolve();
          } else {
            reject(new Error("Email address not found in system logs."));
          }
        }, 500);
      });
    }
  },

  createAgent: async (agentData: Omit<Agent, 'id' | 'createdAt' | 'status'>, password = "agent123"): Promise<Agent> => {
    if (isFirebaseConfigured) {
      // Typically Firebase Admin creates user, but client can call backend or cloud function
      // For fallback/simplicity, using standard Auth client if admin is temporarily logged in 
      // (usually Admin uses the API backend we will detail later, but here is standard fallback)
      const credential = await createUserWithEmailAndPassword(firebaseAuth, agentData.email, password);
      const newAgent: Agent = {
        id: credential.user.uid,
        ...agentData,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(firestoreDb, 'agents', newAgent.id), newAgent);
      return newAgent;
    } else {
      return new Promise((resolve) => {
        setTimeout(() => {
          const agents = getMockData<Agent>("agents", SEEDED_AGENTS);
          const newAgent: Agent = {
            id: "agent_" + Date.now(),
            ...agentData,
            status: 'active',
            createdAt: new Date().toISOString()
          };
          agents.push(newAgent);
          saveMockData("agents", agents);
          resolve(newAgent);
        }, 600);
      });
    }
  },

  deleteAgent: async (agentId: string): Promise<void> => {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(firestoreDb, 'agents', agentId));
    } else {
      return new Promise((resolve) => {
        setTimeout(() => {
          let agents = getMockData<Agent>("agents", SEEDED_AGENTS);
          agents = agents.filter(a => a.id !== agentId);
          saveMockData("agents", agents);
          resolve();
        }, 400);
      });
    }
  },

  disableAgent: async (agentId: string, disabled: boolean): Promise<void> => {
    if (isFirebaseConfigured) {
      await updateDoc(doc(firestoreDb, 'agents', agentId), {
        status: disabled ? 'disabled' : 'active'
      });
    } else {
      return new Promise((resolve) => {
        setTimeout(() => {
          const agents = getMockData<Agent>("agents", SEEDED_AGENTS);
          const agent = agents.find(a => a.id === agentId);
          if (agent) {
            agent.status = disabled ? 'disabled' : 'active';
            saveMockData("agents", agents);
          }
          resolve();
        }, 400);
      });
    }
  },

  updateProfile: async (userId: string, updates: Partial<Student & Agent & { photoURL: string }>, role: 'student' | 'agent' | 'admin'): Promise<void> => {
    if (isFirebaseConfigured) {
      if (firebaseAuth.currentUser && updates.photoURL) {
        await firebaseUpdateProfile(firebaseAuth.currentUser, {
          photoURL: updates.photoURL
        });
      }
      const collectionName = role === 'agent' ? 'agents' : 'students';
      if (role !== 'admin') {
        await setDoc(doc(firestoreDb, collectionName, userId), updates, { merge: true });
      }
    } else {
      return new Promise((resolve) => {
        setTimeout(() => {
          if (role === 'agent') {
            const agents = getMockData<Agent>("agents", SEEDED_AGENTS);
            const agentIdx = agents.findIndex(a => a.id === userId);
            if (agentIdx !== -1) {
              agents[agentIdx] = { ...agents[agentIdx], ...updates } as Agent;
            } else {
              agents.push({ id: userId, createdAt: new Date().toISOString(), status: 'active', ...updates } as Agent);
            }
            saveMockData("agents", agents);
          } else if (role === 'student') {
            const students = getMockData<Student>("students", SEEDED_STUDENTS);
            const studentIdx = students.findIndex(s => s.id === userId);
            if (studentIdx !== -1) {
              students[studentIdx] = { ...students[studentIdx], ...updates } as Student;
            } else {
              students.push({ id: userId, createdAt: new Date().toISOString(), branch: 'CSE', year: '1', section: 'A', ...updates } as Student);
            }
            saveMockData("students", students);
          }
          
          // Update current active session storage if profile changes
          const activeSession = sessionStorage.getItem("campus_portal_session");
          if (activeSession) {
            const sess = JSON.parse(activeSession);
            if (sess.uid === userId) {
              if (updates.name) sess.displayName = updates.name;
              if (updates.photoURL) sess.photoURL = updates.photoURL;
              sessionStorage.setItem("campus_portal_session", JSON.stringify(sess));
            }
          }
          resolve();
        }, 500);
      });
    }
  }
};

// --- High Fidelity Database Service ---
export const dbService = {
  // Profiles
  getStudentProfile: async (id: string): Promise<Student | null> => {
    if (isFirebaseConfigured) {
      const docSnap = await getDoc(doc(firestoreDb, 'students', id));
      if (docSnap.exists()) {
        return { id, ...docSnap.data() } as Student;
      }
      return null;
    } else {
      const students = getMockData<Student>("students", SEEDED_STUDENTS);
      return students.find(s => s.id === id) || null;
    }
  },

  getAgentProfile: async (id: string): Promise<Agent | null> => {
    if (isFirebaseConfigured) {
      const docSnap = await getDoc(doc(firestoreDb, 'agents', id));
      if (docSnap.exists()) {
        return { id, ...docSnap.data() } as Agent;
      }
      return null;
    } else {
      const agents = getMockData<Agent>("agents", SEEDED_AGENTS);
      return agents.find(a => a.id === id) || null;
    }
  },

  // Notifications
  subscribeNotifications: (
    filters: { branch?: string; year?: string; section?: string; type?: string; priority?: string; search?: string },
    onUpdate: (notifications: Notification[]) => void
  ): (() => void) => {
    if (isFirebaseConfigured) {
      // Build Firebase Query
      let notifRef: any = collection(firestoreDb, 'notifications');
      let constraints: any[] = [orderBy('createdAt', 'desc')];
      
      // Firestore queries can be restrictive without index composition, 
      const unsubscribe = onSnapshot(query(notifRef, ...constraints), (snapshot) => {
        const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Notification));
        
        // Client-side filtering matching exactly student target configurations
        const filtered = notifs.filter(notif => {
          if (!notif.isActive) return false;
          
          // Filters
          if (filters.branch && filters.branch !== 'All' && notif.targetBranch !== 'All' && notif.targetBranch !== filters.branch) return false;
          if (filters.year && filters.year !== 'All' && notif.targetYear !== 'All' && notif.targetYear !== filters.year) return false;
          if (filters.section && filters.section !== 'All' && notif.targetSection !== 'All' && notif.targetSection !== filters.section) return false;
          if (filters.type && filters.type !== 'All' && notif.type !== filters.type) return false;
          if (filters.priority && filters.priority !== 'All' && notif.priority !== filters.priority) return false;
          
          if (filters.search) {
            const queryText = filters.search.toLowerCase();
            const titleMatch = notif.title.toLowerCase().includes(queryText);
            const descMatch = notif.description.toLowerCase().includes(queryText);
            const agentMatch = notif.createdByName.toLowerCase().includes(queryText);
            if (!titleMatch && !descMatch && !agentMatch) return false;
          }
          
          // Verify notification scheduling and expiry
          const now = new Date();
          if (notif.expiryDate && new Date(notif.expiryDate) < now) return false;
          
          return true;
        });
        
        onUpdate(filtered);
      });
      return unsubscribe;
    } else {
      // Mock Subscription using LocalStorage polling / events
      const poll = () => {
        const notifs = getMockData<Notification>("notifications", SEEDED_NOTIFICATIONS);
        const filtered = notifs.filter(notif => {
          if (!notif.isActive) return false;
          
          // Target filter checks
          if (filters.branch && filters.branch !== 'All' && notif.targetBranch !== 'All' && notif.targetBranch !== filters.branch) return false;
          if (filters.year && filters.year !== 'All' && notif.targetYear !== 'All' && notif.targetYear !== filters.year) return false;
          if (filters.section && filters.section !== 'All' && notif.targetSection !== 'All' && notif.targetSection !== filters.section) return false;
          if (filters.type && filters.type !== 'All' && notif.type !== filters.type) return false;
          if (filters.priority && filters.priority !== 'All' && notif.priority !== filters.priority) return false;
          
          if (filters.search) {
            const queryText = filters.search.toLowerCase();
            const titleMatch = notif.title.toLowerCase().includes(queryText);
            const descMatch = notif.description.toLowerCase().includes(queryText);
            const agentMatch = notif.createdByName.toLowerCase().includes(queryText);
            if (!titleMatch && !descMatch && !agentMatch) return false;
          }
          
          // Verify expiry
          const now = new Date();
          if (notif.expiryDate && new Date(notif.expiryDate) < now) return false;

          return true;
        });
        // Sort: Pinned first, then by createdAt desc
        const sorted = [...filtered].sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        onUpdate(sorted);
      };
      
      poll();
      const interval = setInterval(poll, 1500); // Poll localstorage
      return () => clearInterval(interval);
    }
  },

  createNotification: async (notifData: Omit<Notification, 'id' | 'createdAt' | 'isActive'>): Promise<Notification> => {
    if (isFirebaseConfigured) {
      const colRef = collection(firestoreDb, 'notifications');
      const newNotif = {
        ...notifData,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      const docRef = await addDoc(colRef, newNotif);
      
      // Dispatch Web Push notification requests (Simulated or triggered via local/FCM helper)
      triggerLocalBrowserNotification(newNotif.title, newNotif.description);
      
      return { id: docRef.id, ...newNotif };
    } else {
      return new Promise((resolve) => {
        setTimeout(() => {
          const notifs = getMockData<Notification>("notifications", SEEDED_NOTIFICATIONS);
          const newNotif: Notification = {
            id: "notif_" + Date.now(),
            ...notifData,
            createdAt: new Date().toISOString(),
            isActive: true
          };
          notifs.push(newNotif);
          saveMockData("notifications", notifs);
          
          // Desktop Notification simulation
          triggerLocalBrowserNotification(newNotif.title, newNotif.description);
          
          resolve(newNotif);
        }, 500);
      });
    }
  },

  updateNotification: async (id: string, notifData: Partial<Notification>): Promise<void> => {
    if (isFirebaseConfigured) {
      await updateDoc(doc(firestoreDb, 'notifications', id), notifData);
    } else {
      return new Promise((resolve) => {
        setTimeout(() => {
          const notifs = getMockData<Notification>("notifications", SEEDED_NOTIFICATIONS);
          const idx = notifs.findIndex(n => n.id === id);
          if (idx !== -1) {
            notifs[idx] = { ...notifs[idx], ...notifData } as Notification;
            saveMockData("notifications", notifs);
          }
          resolve();
        }, 400);
      });
    }
  },

  deleteNotification: async (id: string): Promise<void> => {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(firestoreDb, 'notifications', id));
    } else {
      return new Promise((resolve) => {
        setTimeout(() => {
          let notifs = getMockData<Notification>("notifications", SEEDED_NOTIFICATIONS);
          notifs = notifs.filter(n => n.id !== id);
          saveMockData("notifications", notifs);
          resolve();
        }, 400);
      });
    }
  },

  getNotificationById: async (id: string): Promise<Notification> => {
    if (isFirebaseConfigured) {
      const d = await getDoc(doc(firestoreDb, 'notifications', id));
      if (!d.exists()) throw new Error("Notification not found");
      return { id: d.id, ...d.data() } as Notification;
    } else {
      return new Promise((resolve, reject) => {
        const notifs = getMockData<Notification>("notifications", SEEDED_NOTIFICATIONS);
        const item = notifs.find(n => n.id === id);
        if (item) resolve(item);
        else reject(new Error("Notification not found"));
      });
    }
  },

  // View Tracking (Read Receipts)
  logNotificationView: async (viewData: Omit<NotificationView, 'id' | 'viewedAt' | 'device'>): Promise<void> => {
    const userAgent = navigator.userAgent;
    const deviceType = /Mobi|Android|iPhone/i.test(userAgent) ? 'Mobile' : 'Desktop';
    const browserName = userAgent.includes('Chrome') ? 'Chrome' : userAgent.includes('Safari') ? 'Safari' : userAgent.includes('Firefox') ? 'Firefox' : 'Browser';
    const deviceInfo = `${deviceType} (${navigator.platform || 'Unknown OS'}, ${browserName})`;

    if (isFirebaseConfigured) {
      const colRef = collection(firestoreDb, 'notificationViews');
      // Verify first if this student has already read it to avoid duplicate views logs
      const q = query(colRef, where('notificationId', '==', viewData.notificationId), where('studentId', '==', viewData.studentId));
      const snaps = await getDocs(q);
      if (snaps.empty) {
        await addDoc(colRef, {
          ...viewData,
          device: deviceInfo,
          viewedAt: new Date().toISOString()
        });
      }
    } else {
      return new Promise((resolve) => {
        const views = getMockData<NotificationView>("views", SEEDED_VIEWS);
        const exists = views.some(v => v.notificationId === viewData.notificationId && v.studentId === viewData.studentId);
        if (!exists) {
          views.push({
            id: "view_" + Date.now(),
            ...viewData,
            device: deviceInfo,
            viewedAt: new Date().toISOString()
          });
          saveMockData("views", views);
        }
        resolve();
      });
    }
  },

  subscribeNotificationViews: (notificationId: string, onUpdate: (views: NotificationView[]) => void): (() => void) => {
    if (isFirebaseConfigured) {
      const q = query(collection(firestoreDb, 'notificationViews'), where('notificationId', '==', notificationId), orderBy('viewedAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as NotificationView));
        onUpdate(items);
      });
    } else {
      const poll = () => {
        const views = getMockData<NotificationView>("views", SEEDED_VIEWS);
        const filtered = views.filter(v => v.notificationId === notificationId);
        const sorted = [...filtered].sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime());
        onUpdate(sorted);
      };
      poll();
      const interval = setInterval(poll, 1500);
      return () => clearInterval(interval);
    }
  },

  subscribeAllNotificationViews: (onUpdate: (views: NotificationView[]) => void): (() => void) => {
    if (isFirebaseConfigured) {
      const q = query(collection(firestoreDb, 'notificationViews'), orderBy('viewedAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as NotificationView));
        onUpdate(items);
      });
    } else {
      const poll = () => {
        const views = getMockData<NotificationView>("views", SEEDED_VIEWS);
        const sorted = [...views].sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime());
        onUpdate(sorted);
      };
      poll();
      const interval = setInterval(poll, 1500);
      return () => clearInterval(interval);
    }
  },

  // Directory Subscriptions
  subscribeAgents: (onUpdate: (agents: Agent[]) => void): (() => void) => {
    if (isFirebaseConfigured) {
      const q = query(collection(firestoreDb, 'agents'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Agent));
        onUpdate(items);
      });
    } else {
      const poll = () => {
        const items = getMockData<Agent>("agents", SEEDED_AGENTS);
        const sorted = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(sorted);
      };
      poll();
      const interval = setInterval(poll, 1500);
      return () => clearInterval(interval);
    }
  },

  subscribeStudents: (onUpdate: (students: Student[]) => void): (() => void) => {
    if (isFirebaseConfigured) {
      const q = query(collection(firestoreDb, 'students'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Student));
        onUpdate(items);
      });
    } else {
      const poll = () => {
        const items = getMockData<Student>("students", SEEDED_STUDENTS);
        const sorted = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(sorted);
      };
      poll();
      const interval = setInterval(poll, 1500);
      return () => clearInterval(interval);
    }
  }
};

// --- High Fidelity Storage (Upload) Service ---
export const storageService = {
  uploadFile: async (file: File, folderPath: string): Promise<string> => {
    if (isFirebaseConfigured) {
      const storageRef = ref(firebaseStorage, `${folderPath}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
          null, 
          (error) => reject(error), 
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          }
        );
      });
    } else {
      // Mock File Upload (returns a local Object URL or Data64 placeholder)
      return new Promise((resolve) => {
        setTimeout(() => {
          const objectUrl = URL.createObjectURL(file);
          resolve(objectUrl);
        }, 800);
      });
    }
  }
};

// --- Push Notification Registration (FCM) ---
export const registerPushNotifications = async (userId: string, role: 'student' | 'agent' | 'admin') => {
  if (!isFirebaseConfigured || !firebaseMessaging) {
    console.log("Push registrations skipped (Mock mode active).");
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(firebaseMessaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      if (currentToken) {
        // Save token to Student database
        if (role === 'student') {
          await updateDoc(doc(firestoreDb, 'students', userId), {
            deviceToken: currentToken
          });
        }
        console.log("FCM registration successful. Device Token: ", currentToken);
      }
    }
  } catch (error) {
    console.warn("FCM device token retrieval failed (SSL/VAPID key mismatch?):", error);
  }
};

// --- Browser Notifications Fallback ---
const triggerLocalBrowserNotification = (title: string, body: string) => {
  if (!("Notification" in window)) return;
  
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(title, { body, icon: "/favicon.ico" });
      }
    });
  }
};
