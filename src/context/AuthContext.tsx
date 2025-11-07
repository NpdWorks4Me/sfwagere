'use client';

import { useState, createContext, useContext, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/lib/database.types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<any>;
  role: string | null;
  isModerator: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() =>
    createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      } else {
        setSession(data.session);
        setUser(data.session?.user ?? null);
      }
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  // Fetch role once user is known
  /*
  useEffect(() => {
    let cancelled = false;
    const fetchRole = async () => {
      if (!user) { setRole(null); return; }
      const { data, error } = await supabase.schema('forum')
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      if (!cancelled) {
        if (error) {
          console.warn('Failed to load role', error.message);
          setRole(null);
        } else {
          setRole((data?.role as any) || null);
        }
      }
    };
    fetchRole();
    return () => { cancelled = true; };
  }, [user, supabase]);
  */

  const login = useCallback(async (email: string, password: string) => {
    // Use signUp for email confirmation
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  }, [supabase]);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  }, [supabase]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    login,
    logout,
    role,
    isModerator: !!role && ['moderator','admin'].includes(role.toLowerCase()),
  }), [user, session, loading, login, logout, role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
