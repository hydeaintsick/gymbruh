import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { detectExerciseFromText } from "@/lib/mistral";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Texte requis" },
        { status: 400 }
      );
    }

    // Récupérer tous les exercices disponibles avec leurs traductions
    const exercises = await prisma.exercise.findMany({
      select: {
        name: true,
        nameEn: true,
        nameFr: true,
        nameIt: true,
        nameEs: true,
        nameNl: true,
      },
    });

    if (exercises.length === 0) {
      return NextResponse.json(
        { error: "Aucun exercice disponible" },
        { status: 500 }
      );
    }

    // Détecter l'exercice avec Mistral AI (avec toutes les traductions)
    const detection = await detectExerciseFromText(text, exercises);

    if (!detection) {
      return NextResponse.json(
        { error: "Aucun exercice détecté" },
        { status: 404 }
      );
    }

    // Récupérer l'exercice complet depuis la DB
    const exercise = await prisma.exercise.findUnique({
      where: { name: detection.exerciseName },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercice non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exercise: {
        id: exercise.id,
        name: exercise.name,
        description: exercise.description,
        muscleGroups: exercise.muscleGroups,
      },
      reps: detection.reps,
      weight: detection.weight,
      confidence: detection.confidence,
    });
  } catch (error) {
    console.error("Error in detect-exercise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la détection" },
      { status: 500 }
    );
  }
}
