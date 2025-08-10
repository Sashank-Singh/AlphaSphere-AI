
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '@/types';
import { mockUser } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => void;
  updateUser: (userData: Partial<User>) => void;
  toggleTradingMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const checkAuth = async () => {
      try {
        // Check if we have a saved user in localStorage (for web)
        const savedUser = localStorage.getItem('tradingAppUser');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error restoring auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validate YC demo credentials
      if (email === 'YCdemo@gmail.com' && password === 'YCdemo') {
        setUser(mockUser);
        
        // Save to localStorage (for web)
        localStorage.setItem('tradingAppUser', JSON.stringify(mockUser));
      } else {
        throw new Error('Invalid credentials. Please use YCdemo@gmail.com / YCdemo');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new user (in a real app, this would be done on the server)
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        riskTolerance: 'medium',
        aiBudget: 1000,
        tradingMode: 'paper',
      };
      
      setUser(newUser);
      
      // Save to localStorage (for web)
      localStorage.setItem('tradingAppUser', JSON.stringify(newUser));
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('tradingAppUser');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('tradingAppUser', JSON.stringify(updatedUser));
    }
  };

  const toggleTradingMode = () => {
    if (user) {
      const updatedUser = {
        ...user,
        tradingMode: user.tradingMode === 'paper' ? 'live' as const : 'paper' as const,
      };
      setUser(updatedUser);
      localStorage.setItem('tradingAppUser', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, updateUser, toggleTradingMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
