"use client";

import { PenSquare, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import LoginModal from "@/components/login-modal";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";

interface HeaderProps {
    onSearch: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
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
        <div className="flex justify-between items-center h-20 gap-4">
          <div className="flex items-center gap-4">
             <div className="bg-primary text-primary-foreground p-3 rounded-2xl shadow-md">
                <PenSquare className="w-6 h-6" />
             </div>
            <h1 className="text-3xl font-headline font-bold text-foreground tracking-wider">
                Adi
            </h1>
          </div>
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search posts..."
                className="w-full pl-10 rounded-full bg-muted/50 border-transparent focus:bg-background focus:border-input"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <nav>
              {loading ? null : user ? (
                <Button onClick={handleLogout} variant="outline" className="rounded-full">
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
