import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { auth, googleProvider } from '../firebaseConfig';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface UserContextType {
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  deductCredit: () => Promise<boolean>; 
  addCredits: (amount: number) => Promise<void>;
  loadingAuth: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Fungsi helper untuk mengambil saldo dari LocalStorage berdasarkan UID
  const getStoredCredits = (uid: string): number => {
    const saved = localStorage.getItem(`sp_credits_${uid}`);
    return saved ? parseInt(saved, 10) : 50; // Bonus 50 koin untuk user baru
  };

  const updateStoredCredits = (uid: string, amount: number) => {
    localStorage.setItem(`sp_credits_${uid}`, amount.toString());
  };

  useEffect(() => {
    // Listener status login Firebase
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const currentCredits = getStoredCredits(firebaseUser.uid);
        
        const appUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Juragan Seller',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || 'https://cdn-icons-png.flaticon.com/512/2652/2652218.png',
          credits: currentCredits,
          isNewUser: false 
        };
        setUser(appUser);
      } else {
        // Reset user jika tidak ada sesi aktif
        setUser(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (auth.currentUser) {
          await signOut(auth);
      }
      setUser(null);
    } catch (error) {
      console.error("Logout Failed", error);
      setUser(null);
    }
  };

  const deductCredit = async (): Promise<boolean> => {
    if (user && user.credits > 0) {
      const newCredits = user.credits - 1;
      setUser({ ...user, credits: newCredits });
      updateStoredCredits(user.id, newCredits);
      return true;
    }
    return false;
  };

  const addCredits = async (amount: number) => {
    if (user) {
      const newCredits = user.credits + amount;
      setUser({ ...user, credits: newCredits });
      updateStoredCredits(user.id, newCredits);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, deductCredit, addCredits, loadingAuth }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser error');
  return context;
};