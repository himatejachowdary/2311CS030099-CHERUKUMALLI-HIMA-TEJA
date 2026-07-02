import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  authService, 
  dbService,
  registerPushNotifications, 
  UserSession, 
  Student, 
  Agent 
} from '../config/firebase';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  role: 'student' | 'agent' | 'admin' | null;
  studentDetails: Student | null;
  agentDetails: Agent | null;
  login: (email: string, password: string) => Promise<UserSession>;
  loginWithGoogle: () => Promise<UserSession>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<Student & Agent & { photoURL: string }>) => Promise<void>;
  registerStudent: (studentData: Omit<Student, 'id' | 'createdAt'>, password?: string) => Promise<Student>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [role, setRole] = useState<'student' | 'agent' | 'admin' | null>(null);
  const [studentDetails, setStudentDetails] = useState<Student | null>(null);
  const [agentDetails, setAgentDetails] = useState<Agent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Synchronize detailed profile information depending on session user role
  useEffect(() => {
    setLoading(true);
    const unsubscribe = authService.onAuthStateChanged(async (sessionUser) => {
      if (sessionUser) {
        setUser(sessionUser);
        setRole(sessionUser.role);
        
        // Fetch detailed profile information from mock storage or firestore
        try {
          if (sessionUser.role === 'student') {
            const loadStudent = async () => {
              let details = await dbService.getStudentProfile(sessionUser.uid);
              if (!details) {
                const newStud: Student = {
                  id: sessionUser.uid,
                  name: sessionUser.displayName || 'Student',
                  email: sessionUser.email || '',
                  branch: 'CSE',
                  year: '3',
                  section: 'A',
                  createdAt: new Date().toISOString()
                };
                if (sessionUser.photoURL) {
                  newStud.photoURL = sessionUser.photoURL;
                }
                await authService.updateProfile(sessionUser.uid, newStud, 'student');
                details = newStud;
              }
              setStudentDetails(details);
            };
            await loadStudent();
            registerPushNotifications(sessionUser.uid, 'student');
          } else if (sessionUser.role === 'agent') {
            const loadAgent = async () => {
              let details = await dbService.getAgentProfile(sessionUser.uid);
              if (!details) {
                const newAgent: Agent = {
                  id: sessionUser.uid,
                  name: sessionUser.displayName || 'Faculty Agent',
                  email: sessionUser.email || '',
                  department: 'CSE',
                  status: 'active',
                  createdAt: new Date().toISOString()
                };
                if (sessionUser.photoURL) {
                  newAgent.photoURL = sessionUser.photoURL;
                }
                await authService.updateProfile(sessionUser.uid, newAgent, 'agent');
                details = newAgent;
              }
              setAgentDetails(details);
            };
            await loadAgent();
            registerPushNotifications(sessionUser.uid, 'agent');
          }
        } catch (e) {
          console.error("Error loading user profile details: ", e);
        }
      } else {
        setUser(null);
        setRole(null);
        setStudentDetails(null);
        setAgentDetails(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<UserSession> => {
    setLoading(true);
    try {
      const sessionUser = await authService.login(email, password);
      setUser(sessionUser);
      setRole(sessionUser.role);
      
      // Store in SessionStorage for mock session survival on page refreshes
      sessionStorage.setItem("campus_portal_session", JSON.stringify(sessionUser));
      
      // Force loading profiles
      window.dispatchEvent(new Event('storage'));
      
      setLoading(false);
      return sessionUser;
    } catch (e) {
      setLoading(false);
      throw e;
    }
  };

  const loginWithGoogle = async (): Promise<UserSession> => {
    setLoading(true);
    try {
      const sessionUser = await authService.loginWithGoogle();
      setUser(sessionUser);
      setRole(sessionUser.role);
      
      sessionStorage.setItem("campus_portal_session", JSON.stringify(sessionUser));
      setLoading(false);
      return sessionUser;
    } catch (e) {
      setLoading(false);
      throw e;
    }
  };

  const registerStudent = async (studentData: Omit<Student, 'id' | 'createdAt'>, password?: string): Promise<Student> => {
    setLoading(true);
    try {
      const res = await authService.registerStudent(studentData, password);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.logout();
      sessionStorage.removeItem("campus_portal_session");
      setUser(null);
      setRole(null);
      setStudentDetails(null);
      setAgentDetails(null);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      throw e;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    await authService.resetPassword(email);
  };

  const updateUserProfile = async (updates: Partial<Student & Agent & { photoURL: string }>): Promise<void> => {
    if (!user) throw new Error("No authenticated user session.");
    await authService.updateProfile(user.uid, updates, user.role);
    
    // Refresh state locally
    if (user.role === 'student' && studentDetails) {
      setStudentDetails({ ...studentDetails, ...updates as Partial<Student> });
    } else if (user.role === 'agent' && agentDetails) {
      setAgentDetails({ ...agentDetails, ...updates as Partial<Agent> });
    }
    
    // Refresh user state
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        displayName: updates.name || prev.displayName,
        photoURL: updates.photoURL || prev.photoURL
      };
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      role,
      studentDetails,
      agentDetails,
      login,
      loginWithGoogle,
      logout,
      resetPassword,
      updateUserProfile,
      registerStudent
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
}
