"use client";

import * as React from "react";
import {
  ExercisePerformanceChart,
  WeightChart,
  PRCard,
} from "@/components/dashboard/performance-charts";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ExerciseData {
  exerciseId: string;
  exerciseName: string;
  data: Array<{
    date: string;
    reps: number;
    weight: number;
    volume: number;
  }>;
  prs: {
    maxWeight: number;
    maxVolume: number;
  };
}

interface PerformanceData {
  exercises: ExerciseData[];
  weightEntries: Array<{ date: string; weight: number }>;
}

export default function PerformancePage() {
  const [data, setData] = React.useState<PerformanceData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedExercise, setSelectedExercise] = React.useState<string | null>(null);
  const [chartType, setChartType] = React.useState<"weight" | "volume" | "reps" | "1rm">("weight");

  React.useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch("/api/performance");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement");
      }
      const performanceData = await response.json();
      setData(performanceData);
      if (performanceData.exercises.length > 0) {
        setSelectedExercise(performanceData.exercises[0].exerciseId);
      }
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExerciseDetails = async (exerciseId: string) => {
    try {
      const response = await fetch(`/api/performance?exerciseId=${exerciseId}`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching exercise details:", error);
      return null;
    }
  };

  const [exerciseDetails, setExerciseDetails] = React.useState<any>(null);

  React.useEffect(() => {
    if (selectedExercise) {
      fetchExerciseDetails(selectedExercise).then(setExerciseDetails);
    }
  }, [selectedExercise]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-4">Aucune donnée de performance</h2>
        <p className="text-muted-foreground">
          Commencez à enregistrer des séances pour voir vos performances
        </p>
      </div>
    );
  }

  const selectedExerciseData = data.exercises.find(
    (e) => e.exerciseId === selectedExercise
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Performances</h1>
        <p className="text-muted-foreground mt-2">
          Suivez votre progression et vos records personnels
        </p>
      </div>

      {/* Sélecteur d'exercice et type de graphique */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Exercice
              </label>
              <Select
                value={selectedExercise || ""}
                onChange={(e) => setSelectedExercise(e.target.value)}
              >
                {data.exercises.map((exercise) => (
                  <option key={exercise.exerciseId} value={exercise.exerciseId}>
                    {exercise.exerciseName}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Type de graphique
              </label>
              <Select
                value={chartType}
                onChange={(e) =>
                  setChartType(
                    e.target.value as "weight" | "volume" | "reps" | "1rm"
                  )
                }
              >
                <option value="weight">Poids</option>
                <option value="volume">Volume</option>
                <option value="reps">Répétitions</option>
                {exerciseDetails?.estimated1RM && (
                  <option value="1rm">1RM estimé</option>
                )}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graphique de performance par exercice */}
      {selectedExerciseData && exerciseDetails && (
        <ExercisePerformanceChart
          exerciseName={selectedExerciseData.exerciseName}
          data={exerciseDetails.data}
          prs={exerciseDetails.prs}
          type={chartType}
        />
      )}

      {/* Graphique de poids */}
      {data.weightEntries.length > 0 && (
        <WeightChart data={data.weightEntries} />
      )}

      {/* Cartes PR */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Records personnels</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.exercises.map((exercise) => (
            <PRCard
              key={exercise.exerciseId}
              exerciseName={exercise.exerciseName}
              prs={exercise.prs}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
