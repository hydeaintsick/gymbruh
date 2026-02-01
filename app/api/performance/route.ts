import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const exerciseId = searchParams.get("exerciseId");

    // Récupérer toutes les séances de l'utilisateur avec leurs sets
    const sessions = await prisma.workoutSession.findMany({
      where: { userId: session.user.id },
      include: {
        sets: {
          include: {
            exercise: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Récupérer les entrées de poids
    const weightEntries = await prisma.weightEntry.findMany({
      where: { userId: session.user.id },
      orderBy: {
        date: "asc",
      },
    });

    // Si un exercice spécifique est demandé, filtrer les données
    if (exerciseId) {
      const exerciseData = sessions
        .flatMap((s) =>
          s.sets
            .filter((set) => set.exerciseId === exerciseId)
            .map((set) => ({
              date: s.date,
              reps: set.reps,
              weight: set.weight,
              volume: set.reps * set.weight,
            }))
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Calculer les PR (records personnels)
      const maxWeight = Math.max(...exerciseData.map((d) => d.weight), 0);
      const maxVolume = Math.max(...exerciseData.map((d) => d.volume), 0);
      const maxReps = Math.max(...exerciseData.map((d) => d.reps), 0);

      // PR hypothétiques (1RM estimé avec formule Epley)
      const estimated1RM = exerciseData.map((d) => {
        const oneRM = d.weight * (1 + d.reps / 30);
        return {
          date: d.date,
          estimated1RM: Math.round(oneRM * 10) / 10,
        };
      });

      const maxEstimated1RM = Math.max(
        ...estimated1RM.map((d) => d.estimated1RM),
        0
      );

      return NextResponse.json({
        exerciseId,
        data: exerciseData,
        prs: {
          maxWeight,
          maxVolume,
          maxReps,
          maxEstimated1RM,
        },
        estimated1RM,
      });
    }

    // Récupérer tous les exercices uniques avec leurs données
    const allExercises = await prisma.exercise.findMany();
    const exercisesData = allExercises.map((exercise) => {
      const exerciseSessions = sessions
        .flatMap((s) =>
          s.sets
            .filter((set) => set.exerciseId === exercise.id)
            .map((set) => ({
              date: s.date,
              reps: set.reps,
              weight: set.weight,
              volume: set.reps * set.weight,
            }))
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const maxWeight = Math.max(...exerciseSessions.map((d) => d.weight), 0);
      const maxVolume = Math.max(...exerciseSessions.map((d) => d.volume), 0);

      return {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        data: exerciseSessions,
        prs: {
          maxWeight,
          maxVolume,
        },
      };
    });

    return NextResponse.json({
      exercises: exercisesData.filter((e) => e.data.length > 0),
      weightEntries: weightEntries.map((w) => ({
        date: w.date,
        weight: w.weight,
      })),
    });
  } catch (error) {
    console.error("Error fetching performance data:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des performances" },
      { status: 500 }
    );
  }
}
