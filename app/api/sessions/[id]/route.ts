import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSessionSchema = z.object({
  name: z.string().optional(),
  date: z.string().datetime().optional(),
  sets: z
    .array(
      z.object({
        id: z.string().optional(),
        exerciseId: z.string(),
        reps: z.number().int().positive(),
        weight: z.number().min(0),
        order: z.number().int().nonnegative(),
      })
    )
    .optional(),
});

// GET - Détails d'une séance
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const workoutSession = await prisma.workoutSession.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        sets: {
          include: {
            exercise: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!workoutSession) {
      return NextResponse.json(
        { error: "Séance non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(workoutSession);
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la séance" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une séance
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que la séance appartient à l'utilisateur
    const existingSession = await prisma.workoutSession.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: "Séance non trouvée" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateSessionSchema.parse(body);

    // Mettre à jour la séance
    const updateData: any = {};
    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name;
    }
    if (validatedData.date !== undefined) {
      updateData.date = new Date(validatedData.date);
    }

    // Si des sets sont fournis, les remplacer
    if (validatedData.sets !== undefined) {
      // Supprimer les anciens sets
      await prisma.set.deleteMany({
        where: { sessionId: id },
      });

      // Créer les nouveaux sets uniquement s'il y en a (createMany avec tableau vide échoue sur MongoDB)
      const setsToCreate = validatedData.sets.map((set) => ({
        sessionId: id,
        exerciseId: set.exerciseId,
        reps: set.reps,
        weight: set.weight,
        order: set.order,
      }));
      if (setsToCreate.length > 0) {
        await prisma.set.createMany({
          data: setsToCreate,
        });
      }
    }

    const workoutSession = await prisma.workoutSession.update({
      where: { id },
      data: updateData,
      include: {
        sets: {
          include: {
            exercise: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(workoutSession);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la séance" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une séance
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que la séance appartient à l'utilisateur
    const existingSession = await prisma.workoutSession.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: "Séance non trouvée" },
        { status: 404 }
      );
    }

    await prisma.workoutSession.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Séance supprimée" });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la séance" },
      { status: 500 }
    );
  }
}
