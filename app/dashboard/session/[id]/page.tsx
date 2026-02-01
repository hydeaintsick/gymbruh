"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutRecorder } from "@/components/dashboard/workout-recorder";
import { Plus, Save, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface ExerciseSet {
  id: string;
  exerciseId: string;
  exerciseName: string;
  reps: number;
  weight: number;
  order: number;
}

interface WorkoutSession {
  id: string;
  name: string;
  date: string;
  sets: ExerciseSet[];
}

export default function EditSessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = React.useState<WorkoutSession | null>(null);
  const [sessionName, setSessionName] = React.useState("");
  const [sessionDate, setSessionDate] = React.useState("");
  const [sets, setSets] = React.useState<ExerciseSet[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error("Séance non trouvée");
      }
      const data = await response.json();
      setSession(data);
      setSessionName(data.name);
      setSessionDate(format(new Date(data.date), "yyyy-MM-dd"));
      setSets(
        data.sets.map((s: any) => ({
          id: s.id,
          exerciseId: s.exerciseId,
          exerciseName: s.exercise.name,
          reps: s.reps,
          weight: s.weight,
          order: s.order,
        }))
      );
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseDetected = async (data: {
    exerciseId: string;
    exerciseName: string;
    reps?: number;
    weight?: number;
  }) => {
    setIsProcessing(true);

    try {
      const newSet: ExerciseSet = {
        id: `temp-${Date.now()}`,
        exerciseId: data.exerciseId,
        exerciseName: data.exerciseName,
        reps: data.reps || 10,
        weight: data.weight || 0,
        order: sets.length,
      };

      await saveSession([...sets, newSet]);
    } catch (error) {
      console.error("Error adding set:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateSet = (id: string, updates: Partial<ExerciseSet>) => {
    const updatedSets = sets.map((set) =>
      set.id === id ? { ...set, ...updates } : set
    );
    setSets(updatedSets);
  };

  const removeSet = async (id: string) => {
    const updatedSets = sets.filter((s) => s.id !== id);
    await saveSession(updatedSets);
  };

  const saveSession = async (updatedSets?: ExerciseSet[]) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const setsToSave = updatedSets || sets;
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sessionName,
          date: new Date(sessionDate).toISOString(),
          sets: setsToSave.map((s) => ({
            exerciseId: s.exerciseId,
            reps: Math.max(1, Math.floor(s.reps)),
            weight: Math.max(0, s.weight),
            order: s.order,
          })),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          (data as { error?: string }).error ||
          (data as { details?: unknown[] }).details?.length
            ? "Données invalides (vérifiez répétitions et poids)"
            : "Erreur lors de la sauvegarde";
        setSaveError(message);
        return;
      }

      const updatedSession = data;
      setSets(
        updatedSession.sets.map((s: any) => ({
          id: s.id,
          exerciseId: s.exerciseId,
          exerciseName: s.exercise.name,
          reps: s.reps,
          weight: s.weight,
          order: s.order,
        }))
      );
    } catch (error) {
      console.error("Error saving session:", error);
      setSaveError("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette séance ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-4">Séance non trouvée</h2>
        <Link href="/dashboard">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Éditer la séance
            </h1>
            <p className="text-muted-foreground mt-2">
              Modifiez les détails de votre séance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
          <Button onClick={() => saveSession()} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </div>

      {saveError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {saveError}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informations de la séance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-name">Nom de la séance</Label>
            <Input
              id="session-name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Workout"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="session-date">Date</Label>
            <Input
              id="session-date"
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter un exercice</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutRecorder
            onExerciseDetected={handleExerciseDetected}
            isProcessing={isProcessing}
          />
        </CardContent>
      </Card>

      {sets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Exercices ({sets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sets
                .sort((a, b) => a.order - b.order)
                .map((set) => (
                  <div
                    key={set.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{set.exerciseName}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`reps-${set.id}`} className="text-sm">
                            Répétitions:
                          </Label>
                          <Input
                            id={`reps-${set.id}`}
                            type="number"
                            value={set.reps}
                            onChange={(e) =>
                              updateSet(set.id, {
                                reps: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-20"
                            min="1"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={`weight-${set.id}`}
                            className="text-sm"
                          >
                            Poids (kg):
                          </Label>
                          <Input
                            id={`weight-${set.id}`}
                            type="number"
                            value={set.weight}
                            onChange={(e) =>
                              updateSet(set.id, {
                                weight: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-20"
                            min="0"
                            step="0.5"
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSet(set.id)}
                      aria-label="Supprimer cet exercice de la séance"
                      title="Supprimer l'exercice"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
