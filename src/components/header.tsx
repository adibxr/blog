"use client";

import { Feather } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import LoginModal from "@/components/login-modal";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Header() {
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <header className="bg-background/80 backdrop-blur-lg sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <h1 className="text-3xl font-headline font-bold flex items-center gap-2 bg-gradient-to-r from-primary to-foreground text-transparent bg-clip-text">
            <Feather className="w-7 h-7 text-primary" />
            Adi
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <nav>
              {loading ? null : user ? (
                <Button onClick={handleLogout} variant="outline">
                  Logout
                </Button>
              ) : (
                <LoginModal />
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
