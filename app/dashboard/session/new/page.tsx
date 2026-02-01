"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { WorkoutRecorder } from "@/components/dashboard/workout-recorder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Trash2 } from "lucide-react";

interface ExerciseSet {
  id: string;
  exerciseId: string;
  exerciseName: string;
  reps: number;
  weight: number;
  order: number;
}

export default function NewSessionPage() {
  const router = useRouter();
  const [sessionName, setSessionName] = React.useState("Workout");
  const [sets, setSets] = React.useState<ExerciseSet[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [currentSessionId, setCurrentSessionId] = React.useState<string | null>(
    null
  );
  const [exercises, setExercises] = React.useState<
    { id: string; name: string }[]
  >([]);

  // Charger la liste des exercices pour le select de correction
  React.useEffect(() => {
    fetch("/api/exercises")
      .then((res) => res.ok && res.json())
      .then((data) => Array.isArray(data) && setExercises(data))
      .catch(() => {});
  }, []);

  // Créer une séance au chargement de la page
  React.useEffect(() => {
    createSession();
  }, []);

  const createSession = async () => {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sessionName,
          date: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la séance");
      }

      const data = await response.json();
      setCurrentSessionId(data.id);
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const handleExerciseDetected = async (data: {
    exerciseId: string;
    exerciseName: string;
    reps?: number;
    weight?: number;
  }) => {
    if (!currentSessionId) return;

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

      setSets([...sets, newSet]);

      // Sauvegarder le set dans la base de données
      await saveSetToSession(newSet);
    } catch (error) {
      console.error("Error adding set:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveSetToSession = async (set: ExerciseSet) => {
    if (!currentSessionId) return;

    try {
      const currentSets = [...sets, set].map((s, index) => ({
        exerciseId: s.exerciseId,
        reps: s.reps,
        weight: s.weight,
        order: index,
      }));

      const response = await fetch(`/api/sessions/${currentSessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sessionName,
          sets: currentSets,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      const updatedSession = await response.json();
      // Mettre à jour les sets avec les IDs de la DB
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
      console.error("Error saving set:", error);
    }
  };

  const updateSet = (id: string, updates: Partial<ExerciseSet>) => {
    setSets(sets.map((set) => (set.id === id ? { ...set, ...updates } : set)));
  };

  const exerciseOptions = React.useMemo(() => {
    const ids = new Set(exercises.map((e) => e.id));
    const list = [...exercises];
    sets.forEach((s) => {
      if (!ids.has(s.exerciseId)) {
        ids.add(s.exerciseId);
        list.push({ id: s.exerciseId, name: s.exerciseName });
      }
    });
    return list;
  }, [exercises, sets]);

  const removeSet = async (id: string) => {
    if (!currentSessionId) return;

    const setToRemove = sets.find((s) => s.id === id);
    if (!setToRemove) return;

    const updatedSets = sets
      .filter((s) => s.id !== id)
      .map((s, index) => ({
        exerciseId: s.exerciseId,
        reps: s.reps,
        weight: s.weight,
        order: index,
      }));

    try {
      const response = await fetch(`/api/sessions/${currentSessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sessionName,
          sets: updatedSets,
        }),
      });

      if (response.ok) {
        setSets(sets.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error("Error removing set:", error);
    }
  };

  const handleSave = async () => {
    if (!currentSessionId) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/sessions/${currentSessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sessionName,
          sets: sets.map((s) => ({
            exerciseId: s.exerciseId,
            reps: s.reps,
            weight: s.weight,
            order: s.order,
          })),
        }),
      });

      if (response.ok) {
        router.push(`/dashboard/session/${currentSessionId}`);
      }
    } catch (error) {
      console.error("Error saving session:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nouvelle séance</h1>
          <p className="text-muted-foreground mt-2">
            Enregistrez vos exercices avec votre voix
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving || !currentSessionId}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-2">
            <Label htmlFor="session-name">Nom de la séance</Label>
            <Input
              id="session-name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Workout"
            />
          </div>
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
            <CardTitle>Exercices enregistrés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sets.map((set) => (
                <div
                  key={set.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <Label
                      htmlFor={`exercise-${set.id}`}
                      className="text-xs text-muted-foreground"
                    >
                      Exercice (cliquez pour modifier si l&apos;IA s&apos;est
                      trompée)
                    </Label>
                    {exerciseOptions.length > 0 ? (
                      <Select
                        id={`exercise-${set.id}`}
                        value={set.exerciseId}
                        onChange={(e) => {
                          const ex = exerciseOptions.find(
                            (x) => x.id === e.target.value
                          );
                          if (ex)
                            updateSet(set.id, {
                              exerciseId: ex.id,
                              exerciseName: ex.name,
                            });
                        }}
                        className="mt-1 font-semibold w-full max-w-sm"
                      >
                        {exerciseOptions.map((ex) => (
                          <option key={ex.id} value={ex.id}>
                            {ex.name}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <p className="mt-1 font-semibold">{set.exerciseName}</p>
                    )}
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
                        <Label htmlFor={`weight-${set.id}`} className="text-sm">
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
