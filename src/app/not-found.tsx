import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page introuvable</h2>
      <p className="text-muted-foreground mb-8 text-center">
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Button asChild>
        <Link href="/" className="flex items-center">
          <Home className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Link>
      </Button>
    </div>
  );
} 