
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface UserContextType {
  user: User | null;
  login: () => Promise<void>;
  logout: () => void;
  deductCredit: () => Promise<boolean>; 
  addCredits: (amount: number) => Promise<void>;
  loadingAuth: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [credits, setCredits] = useState<number>(() => {
    const saved = localStorage.getItem('sp_credits');
    return saved ? parseInt(saved, 10) : 50; // Modal awal 50 koin untuk pengguna baru
  });

  useEffect(() => {
    localStorage.setItem('sp_credits', credits.toString());
  }, [credits]);

  // Mock user object for compatibility with other components
  const user: User = {
    id: 'guest',
    name: 'Seller Hebat',
    email: '',
    avatar: '',
    credits: credits,
    isNewUser: false
  };

  const login = async () => {}; // No-op
  const logout = () => {
    setCredits(50);
    localStorage.removeItem('sp_credits');
  };

  const deductCredit = async (): Promise<boolean> => {
    if (credits > 0) {
      setCredits(prev => prev - 1);
      return true;
    }
    return false;
  };

  const addCredits = async (amount: number) => {
    setCredits(prev => prev + amount);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, deductCredit, addCredits, loadingAuth: false }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser error');
  return context;
};
