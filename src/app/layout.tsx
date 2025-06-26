import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SupabaseProvider } from "@/lib/context/SupabaseProvider";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Navbar } from "@/components/ui/navbar";
import { CookieConsent } from "@/components/ui/CookieConsent";
import Link from "next/link";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DOQCM",
  description: "Application de gestion de QCM",
  icons: {
    icon: [
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SupabaseProvider>
            <Navbar />
            <main className="flex-grow">
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
        <Script id="monetag-inpage-push" strategy="afterInteractive">
          {`(function(d,z,s){s.src='https://'+d+'/401/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('groleegni.net',9494542,document.createElement('script'))`}
        </Script>
        <Script id="monetag-vignette-banner" strategy="afterInteractive">
          {`(function(d,z,s){s.src='//'+d+'/400/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('stoampaliy.net',9494559,document.createElement('script'))`}
        </Script>
      </body>
    </html>
  );
}
