'use client';

import { useState, createContext, useContext, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/lib/database.types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ data: any; error: any }>; // email+password sign in
  signUp: (email: string, password: string) => Promise<{ data: any; error: any }>;
  logout: () => Promise<{ error: any }>;
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
    let cancelled = false;
    const init = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!cancelled) {
        if (error) console.error('Auth session error:', error.message);
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setLoading(false);
      }
    };
    init();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!cancelled) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        // Loading false after first auth state change
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Fetch role once user is known
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

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  }, [supabase]);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }, [supabase]);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  }, [supabase]);

  const value: AuthContextType = useMemo(() => ({
    user,
    session,
    loading,
    login,
    signUp,
    logout,
    role,
    isModerator: role === 'moderator' || role === 'admin',
  }), [user, session, loading, login, signUp, logout, role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
