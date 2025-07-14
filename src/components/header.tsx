"use client";

import { Newspaper } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import LoginModal from "@/components/login-modal";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

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
    <header className="bg-primary/80 backdrop-blur-sm text-primary-foreground shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl md:text-2xl font-headline font-bold flex items-center gap-2">
            <Newspaper className="w-6 h-6" />
            School Buzz
          </h1>
          <nav>
            {loading ? null : user ? (
              <Button onClick={handleLogout} variant="secondary">
                Logout
              </Button>
            ) : (
              <LoginModal />
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
