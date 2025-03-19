import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SupabaseProvider } from "@/lib/context/SupabaseProvider";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Navbar } from "@/components/ui/navbar";
import { CookieConsent } from "@/components/ui/CookieConsent";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DOQCM",
  description: "Application de gestion de QCM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SupabaseProvider>
            <Navbar />
            <main className="flex-grow py-8">
              {children}
            </main>
            <footer className="border-t py-6 bg-muted/20">
              <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
                <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
                  © {new Date().getFullYear()} DoQCM. Tous droits réservés.
                </div>
                <div className="flex space-x-4 text-sm text-muted-foreground">
                  <Link href="/privacy" className="hover:underline">
                    Politique de confidentialité
                  </Link>
                  <Link href="/legal" className="hover:underline">
                    Mentions légales
                  </Link>
                </div>
              </div>
            </footer>
            <CookieConsent />
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
