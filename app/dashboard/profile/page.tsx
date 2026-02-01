"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ExternalLink, User, Save, Loader2 } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
}

interface Profile {
  username: string;
  profilePublic: boolean;
  prExerciseIds: string[];
}

export default function ProfilePage() {
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [exercises, setExercises] = React.useState<Exercise[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    Promise.all([
      fetch("/api/me/profile").then((r) => r.json()),
      fetch("/api/performance").then((r) => r.json()),
    ])
      .then(([profileData, perfData]) => {
        setProfile(profileData);
        const list = (perfData?.exercises ?? []).map(
          (e: { exerciseId: string; exerciseName: string }) => ({
            id: e.exerciseId,
            name: e.exerciseName,
          })
        );
        setExercises(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateProfile = (updates: Partial<Profile>) => {
    if (!profile) return;
    setProfile((p) => (p ? { ...p, ...updates } : null));
  };

  const setPrExercise = (index: 0 | 1 | 2, exerciseId: string) => {
    if (!profile) return;
    const ids = [...(profile.prExerciseIds ?? [])];
    ids[index] = exerciseId === "" ? "" : exerciseId;
    const trimmed = ids.filter(Boolean).slice(0, 3);
    updateProfile({ prExerciseIds: trimmed });
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profilePublic: profile.profilePublic,
          prExerciseIds: (profile.prExerciseIds ?? []).slice(0, 3),
        }),
      });
      if (!res.ok) throw new Error("Erreur sauvegarde");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "";

  const wallUrl = `${baseUrl}/gg/${encodeURIComponent(profile.username)}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ma page publique</h1>
        <p className="text-muted-foreground mt-2">
          Contrôlez la visibilité et les highlights affichés sur /gg/{profile.username}
        </p>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" asChild>
            <a href={wallUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Voir ma page
            </a>
          </Button>
          <a
            href={wallUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline break-all"
          >
            {wallUrl}
          </a>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Visibilité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="profile-public">Page publique</Label>
              <p className="text-sm text-muted-foreground">
                Si activé, tout le monde peut voir /gg/{profile.username}
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                id="profile-public"
                type="checkbox"
                checked={profile.profilePublic ?? false}
                onChange={(e) =>
                  updateProfile({ profilePublic: e.target.checked })
                }
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm font-medium">
                {profile.profilePublic ? "Publique" : "Privée"}
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PR — 3 exos au choix</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choisissez jusqu&apos;à 3 exercices dont les records personnels seront affichés sur votre page publique. Seuls les exercices que vous avez déjà faits apparaissent ici.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {exercises.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              Aucun exercice enregistré pour le moment. Enregistrez des séances avec des exercices pour pouvoir les choisir ici.
            </p>
          ) : (
            ([0, 1, 2] as const).map((i) => (
              <div key={i} className="space-y-2">
                <Label>Exercice PR {i + 1}</Label>
                <Select
                  value={(profile.prExerciseIds ?? [])[i] ?? ""}
                  onChange={(e) => setPrExercise(i, e.target.value)}
                >
                  <option value="">— Aucun —</option>
                  {exercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </Select>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? "Sauvegarde..." : saved ? "Sauvegardé" : "Sauvegarder"}
        </Button>
        {saved && (
          <span className="text-sm text-primary">Paramètres enregistrés.</span>
        )}
      </div>
    </div>
  );
}
