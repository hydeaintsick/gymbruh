"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Share, Plus } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPWA() {
  const [isStandalone, setIsStandalone] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    React.useState<BeforeInstallPromptEvent | null>(null);
  const [installable, setInstallable] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: boolean }).MSStream;
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    setIsStandalone(standalone);
    setIsIOS(ios);
    setIsMobile(mobile);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Register service worker for installability (Chrome / Android)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setInstallable(false);
        setDismissed(true);
      }
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  // Ne pas afficher si déjà installé, pas mobile, ou masqué par l'utilisateur
  if (isStandalone || !isMobile || dismissed) {
    return null;
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/20 p-2">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Utiliser gymbruh comme une app
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isIOS ? (
                <>
                  Ajoute l&apos;app à ton écran d&apos;accueil pour y accéder
                  rapidement.
                </>
              ) : installable ? (
                <>
                  Installe l&apos;app sur ton téléphone pour un accès direct depuis
                  l&apos;écran d&apos;accueil.
                </>
              ) : (
                <>
                  Tu peux ajouter gymbruh à l&apos;écran d&apos;accueil depuis le
                  menu du navigateur (⋮ ou « Ajouter à l&apos;écran d&apos;accueil »).
                </>
              )}
            </p>
            {isIOS && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                <Share className="h-3.5 w-3.5" />
                Partager → « Sur l&apos;écran d&apos;accueil »
                <Plus className="h-3.5 w-3.5" />
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {installable && (
            <Button onClick={handleInstallClick} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Installer
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-muted-foreground"
          >
            Plus tard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
