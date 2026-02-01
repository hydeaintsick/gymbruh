import { prisma } from "@/lib/prisma";

export type PublicWallData = {
  username: string;
  lastSession: {
    id: string;
    name: string;
    date: Date;
    highlights: { exerciseName: string; reps: number; weight: number }[];
  } | null;
  prs: {
    exerciseId: string;
    exerciseName: string;
    maxWeight: number;
    maxReps: number;
    maxVolume: number;
    estimated1RM: number;
  }[];
};

/**
 * Récupère les données de la page publique /gg/username directement depuis la DB.
 * Utilisé par la page (SSR) et par l’API pour éviter les appels fetch internes.
 */
export async function getPublicWallData(
  username: string
): Promise<PublicWallData | null> {
  const trimmed = username?.trim();
  if (!trimmed) return null;

  const user = await prisma.user.findFirst({
    where: {
      username: { equals: trimmed, mode: "insensitive" },
    },
    select: {
      id: true,
      username: true,
      profilePublic: true,
      prExerciseIds: true,
    },
  });

  if (!user || !user.profilePublic) return null;

  const lastSession = await prisma.workoutSession.findFirst({
    where: { userId: user.id },
    include: {
      sets: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { date: "desc" },
  });

  const byExercise = new Map<
    string,
    { exerciseName: string; reps: number; weight: number; volume: number }
  >();
  for (const set of lastSession?.sets ?? []) {
    const current = byExercise.get(set.exerciseId);
    const volume = set.reps * set.weight;
    if (!current || set.weight > current.weight) {
      byExercise.set(set.exerciseId, {
        exerciseName: set.exercise.name,
        reps: set.reps,
        weight: set.weight,
        volume,
      });
    }
  }
  const lastSessionHighlights = Array.from(byExercise.entries()).map(
    ([exerciseId, v]) => ({ exerciseId, ...v })
  );

  const prExerciseIds = (user.prExerciseIds ?? []).slice(0, 3);
  const allSessions = await prisma.workoutSession.findMany({
    where: { userId: user.id },
    include: {
      sets: { include: { exercise: true } },
    },
    orderBy: { date: "asc" },
  });

  const prs = await Promise.all(
    prExerciseIds.map(async (exerciseId) => {
      const exercise = await prisma.exercise.findUnique({
        where: { id: exerciseId },
      });
      if (!exercise) return null;

      const setsForExercise = allSessions.flatMap((s) =>
        s.sets
          .filter((set) => set.exerciseId === exerciseId)
          .map((set) => ({
            date: s.date,
            reps: set.reps,
            weight: set.weight,
            volume: set.reps * set.weight,
          }))
      );

      if (setsForExercise.length === 0) {
        return {
          exerciseId,
          exerciseName: exercise.name,
          maxWeight: 0,
          maxReps: 0,
          maxVolume: 0,
          estimated1RM: 0,
        };
      }

      const maxWeight = Math.max(...setsForExercise.map((d) => d.weight));
      const maxReps = Math.max(...setsForExercise.map((d) => d.reps));
      const maxVolume = Math.max(...setsForExercise.map((d) => d.volume));
      const estimated1RMs = setsForExercise.map(
        (d) => Math.round(d.weight * (1 + d.reps / 30) * 10) / 10
      );
      const maxEstimated1RM = Math.max(...estimated1RMs, 0);

      return {
        exerciseId,
        exerciseName: exercise.name,
        maxWeight,
        maxReps,
        maxVolume,
        estimated1RM: maxEstimated1RM,
      };
    })
  );

  return {
    username: user.username,
    lastSession: lastSession
      ? {
          id: lastSession.id,
          name: lastSession.name,
          date: lastSession.date,
          highlights: lastSessionHighlights,
        }
      : null,
    prs: prs.filter((p): p is NonNullable<typeof p> => p != null),
  };
}
