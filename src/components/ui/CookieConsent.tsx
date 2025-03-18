"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookieConsent", JSON.stringify({
      necessary: true,
      analytics: true,
      preferences: true
    }));
    setShowBanner(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem("cookieConsent", JSON.stringify({
      necessary: true,
      analytics: false,
      preferences: false
    }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-sm">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold">Politique de cookies</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Nous utilisons des cookies pour améliorer votre expérience sur notre site. 
            Vous pouvez choisir les cookies que vous acceptez.
            Pour plus d'informations, consultez notre <a href="/privacy" className="underline">politique de confidentialité</a>.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={acceptNecessary}>
            Cookies essentiels uniquement
          </Button>
          <Button onClick={acceptAll}>
            Accepter tous les cookies
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 