"use client";

import { createContext, useState, useEffect, ReactNode } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth, ADMIN_UID } from "@/lib/firebase";
import { LoaderCircle } from "lucide-react";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = !!user && user.uid === ADMIN_UID;

  const value = { user, isAdmin, loading };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#e0eaff] to-[#f9fcff]">
        <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
