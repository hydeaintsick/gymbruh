import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock, ArrowLeft } from "lucide-react";

export default function GGNotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <Lock className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">Profil non trouvé ou privé</h1>
      <p className="text-muted-foreground text-center mb-6 max-w-sm">
        Cette page n&apos;existe pas ou le propriétaire a choisi de la garder privée.
      </p>
      <Link href="/">
        <Button variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </Button>
      </Link>
    </div>
  );
}
