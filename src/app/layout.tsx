import type { Metadata } from "next";
import { AuthProvider } from "@/context/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { Belleza, Alegreya } from "next/font/google";

const belleza = Belleza({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-belleza",
});

const alegreya = Alegreya({
  subsets: ["latin"],
  variable: "--font-alegreya",
});

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${belleza.variable} ${alegreya.variable} font-body antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="min-h-screen flex flex-col bg-background">
              {children}
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
