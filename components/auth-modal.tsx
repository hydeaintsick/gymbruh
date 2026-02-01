"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const router = useRouter();
  const [signInError, setSignInError] = React.useState<string | null>(null);
  const [signUpError, setSignUpError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [usernameAvailable, setUsernameAvailable] = React.useState<
    boolean | null
  >(null);
  const [checkingUsername, setCheckingUsername] = React.useState(false);

  // Formulaire d'inscription
  const [signUpData, setSignUpData] = React.useState({
    username: "",
    email: "",
    password: "",
    gender: "male",
    height: "",
    weight: "",
    birthDate: "",
  });

  // Vérification du pseudo en temps réel
  const checkUsername = React.useCallback(async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await fetch(
        `/api/auth/check-username?username=${encodeURIComponent(username)}`
      );
      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error("Error checking username:", error);
    } finally {
      setCheckingUsername(false);
    }
  }, []);

  React.useEffect(() => {
    if (signUpData.username) {
      const timeoutId = setTimeout(() => {
        checkUsername(signUpData.username);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [signUpData.username, checkUsername]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setSignInError(null);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string)?.trim() ?? "";
    const password = (formData.get("password") as string)?.trim() ?? "";

    if (!email || !password) {
      setSignInError("Email et mot de passe requis");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setSignInError("Email ou mot de passe incorrect");
      } else if (result?.ok) {
        onOpenChange(false);
        router.refresh();
      } else {
        setSignInError("Email ou mot de passe incorrect");
      }
    } catch (error) {
      setSignInError("Une erreur est survenue lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setSignUpError(null);

    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/e8ad4e6c-3cce-4a1a-a17e-73b151af4e83", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "auth-modal.tsx:104",
        message: "handleSignUp entry",
        data: { usernameAvailable, signUpData },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "C",
      }),
    }).catch(() => {});
    // #endregion

    if (usernameAvailable === false) {
      // #region agent log
      fetch(
        "http://127.0.0.1:7243/ingest/e8ad4e6c-3cce-4a1a-a17e-73b151af4e83",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "auth-modal.tsx:109",
            message: "usernameAvailable check failed",
            data: { usernameAvailable },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "C",
          }),
        }
      ).catch(() => {});
      // #endregion
      setSignUpError("Le pseudo n'est pas disponible");
      setIsLoading(false);
      return;
    }

    if (usernameAvailable === null) {
      // #region agent log
      fetch(
        "http://127.0.0.1:7243/ingest/e8ad4e6c-3cce-4a1a-a17e-73b151af4e83",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "auth-modal.tsx:115",
            message: "usernameAvailable is null, waiting for check",
            data: { usernameAvailable },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "C",
          }),
        }
      ).catch(() => {});
      // #endregion
      setSignUpError("Veuillez attendre la vérification du pseudo");
      setIsLoading(false);
      return;
    }

    // Convert date string to ISO datetime string for API
    const birthDateISO = signUpData.birthDate
      ? new Date(signUpData.birthDate + "T00:00:00.000Z").toISOString()
      : signUpData.birthDate;

    const requestBody = {
      ...signUpData,
      height: parseFloat(signUpData.height),
      weight: parseFloat(signUpData.weight),
      birthDate: birthDateISO,
    };

    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/e8ad4e6c-3cce-4a1a-a17e-73b151af4e83", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "auth-modal.tsx:119",
        message: "Request body before send",
        data: {
          requestBody,
          heightParsed: parseFloat(signUpData.height),
          weightParsed: parseFloat(signUpData.weight),
          birthDateISO,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "D",
      }),
    }).catch(() => {});
    // #endregion

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      // #region agent log
      fetch(
        "http://127.0.0.1:7243/ingest/e8ad4e6c-3cce-4a1a-a17e-73b151af4e83",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "auth-modal.tsx:126",
            message: "Response received",
            data: {
              status: response.status,
              statusText: response.statusText,
              ok: response.ok,
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "E",
          }),
        }
      ).catch(() => {});
      // #endregion

      const data = await response.json();

      // #region agent log
      fetch(
        "http://127.0.0.1:7243/ingest/e8ad4e6c-3cce-4a1a-a17e-73b151af4e83",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "auth-modal.tsx:129",
            message: "Response data parsed",
            data: { error: data.error, details: data.details },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "B",
          }),
        }
      ).catch(() => {});
      // #endregion

      if (!response.ok) {
        setSignUpError(data.error || "Erreur lors de l'inscription");
        return;
      }

      // #region agent log
      fetch(
        "http://127.0.0.1:7243/ingest/e8ad4e6c-3cce-4a1a-a17e-73b151af4e83",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "auth-modal.tsx:167",
            message: "Registration successful, attempting auto sign-in",
            data: { email: signUpData.email },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "F",
          }),
        }
      ).catch(() => {});
      // #endregion

      // Connexion automatique après inscription
      const signInResult = await signIn("credentials", {
        email: signUpData.email,
        password: signUpData.password,
        redirect: false,
      });

      // #region agent log
      fetch(
        "http://127.0.0.1:7243/ingest/e8ad4e6c-3cce-4a1a-a17e-73b151af4e83",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "auth-modal.tsx:175",
            message: "Sign-in result",
            data: {
              ok: signInResult?.ok,
              error: signInResult?.error,
              status: signInResult?.status,
              url: signInResult?.url,
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "F",
          }),
        }
      ).catch(() => {});
      // #endregion

      if (signInResult?.ok) {
        onOpenChange(false);
        router.refresh();
      } else {
        // #region agent log
        fetch(
          "http://127.0.0.1:7243/ingest/e8ad4e6c-3cce-4a1a-a17e-73b151af4e83",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location: "auth-modal.tsx:182",
              message: "Sign-in failed after registration",
              data: { error: signInResult?.error },
              timestamp: Date.now(),
              sessionId: "debug-session",
              runId: "run1",
              hypothesisId: "F",
            }),
          }
        ).catch(() => {});
        // #endregion
        // Si la connexion automatique échoue, afficher un message et fermer la modal
        // L'utilisateur pourra se connecter manuellement
        setSignUpError("Compte créé avec succès. Veuillez vous connecter.");
        setTimeout(() => {
          onOpenChange(false);
        }, 2000);
      }
    } catch (error) {
      // #region agent log
      fetch(
        "http://127.0.0.1:7243/ingest/e8ad4e6c-3cce-4a1a-a17e-73b151af4e83",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "auth-modal.tsx:144",
            message: "Exception caught",
            data: {
              errorMessage:
                error instanceof Error ? error.message : String(error),
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "E",
          }),
        }
      ).catch(() => {});
      // #endregion
      setSignUpError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to gymbruh</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4 pt-4">
              {signInError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {signInError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Mot de passe</Label>
                <Input
                  id="signin-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4 pt-4">
              {signUpError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {signUpError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="signup-username">Pseudo</Label>
                <Input
                  id="signup-username"
                  name="username"
                  type="text"
                  placeholder="Votre pseudo"
                  required
                  minLength={3}
                  maxLength={20}
                  value={signUpData.username}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, username: e.target.value })
                  }
                />
                {signUpData.username.length >= 3 && (
                  <p className="text-xs text-muted-foreground">
                    {checkingUsername
                      ? "Vérification..."
                      : usernameAvailable === false
                      ? "❌ Ce pseudo est déjà pris"
                      : usernameAvailable === true
                      ? "✅ Pseudo disponible"
                      : ""}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  value={signUpData.email}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Mot de passe</Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={signUpData.password}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, password: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-gender">Genre</Label>
                <Select
                  id="signup-gender"
                  name="gender"
                  required
                  value={signUpData.gender}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, gender: e.target.value })
                  }
                >
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                  <option value="other">Autre</option>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-height">Taille (cm)</Label>
                  <Input
                    id="signup-height"
                    name="height"
                    type="number"
                    placeholder="175"
                    required
                    min="100"
                    max="250"
                    step="0.1"
                    value={signUpData.height}
                    onChange={(e) =>
                      setSignUpData({ ...signUpData, height: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-weight">Poids (kg)</Label>
                  <Input
                    id="signup-weight"
                    name="weight"
                    type="number"
                    placeholder="70"
                    required
                    min="30"
                    max="300"
                    step="0.1"
                    value={signUpData.weight}
                    onChange={(e) =>
                      setSignUpData({ ...signUpData, weight: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-birthdate">Date de naissance</Label>
                <Input
                  id="signup-birthdate"
                  name="birthDate"
                  type="date"
                  required
                  max={new Date().toISOString().split("T")[0]}
                  value={signUpData.birthDate}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, birthDate: e.target.value })
                  }
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || usernameAvailable === false}
              >
                {isLoading ? "Création..." : "Créer un compte"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
