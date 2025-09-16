// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getProfile } from "../lib/profileApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // supabase user
  const [profile, setProfile] = useState(null); // row em public.profiles
  const [loading, setLoading] = useState(true); // loading de auth (sessão)

  // 1) Inicializa sessão + subscreve a mudanças de auth
  useEffect(() => {
    let mounted = true;

    // sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // mudanças (login/logout/refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // 2) Carrega/limpa o perfil quando o user muda
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!user?.id) {
        setProfile(null);
        return;
      }
      try {
        const p = await getProfile(user.id);
        if (!cancelled) setProfile(p ?? null);
      } catch {
        if (!cancelled) setProfile(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Ações
  const login = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signup = (email, password, extras = {}) =>
    supabase.auth.signUp({ email, password, options: { data: extras } });

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // limpeza imediata para o UI reagir logo
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!user?.id) return null;
    const p = await getProfile(user.id).catch(() => null);
    setProfile(p ?? null);
    return p ?? null;
  };

  const value = {
    user,
    profile,
    setProfile, // útil para páginas que fazem upsert e querem refletir logo no UI
    refreshProfile, // utilitário
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
