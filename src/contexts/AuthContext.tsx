import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  ready: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  ready: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (isMounted) {
        const sessionUser = data?.session?.user ?? null;
        setUser(sessionUser);
        setLoading(false);
        setReady(true);
        console.log("✅ Initial auth load. User:", sessionUser?.id ?? "None");
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        if (isMounted) {
          setUser(session?.user ?? null);
          setLoading(false);
          setReady(true);
          console.log("🔄 Auth state change. User:", session?.user?.id ?? "None");
        }
      });
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
