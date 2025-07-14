import type { Metadata } from "next";
import { AuthProvider } from "@/context/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "School Buzz",
  description: "Your friendly school newsletter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Belleza&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#e0eaff] to-[#f9fcff] dark:from-slate-900 dark:to-slate-800">
            {children}
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
