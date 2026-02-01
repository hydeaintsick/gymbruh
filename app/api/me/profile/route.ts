import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  profilePublic: z.boolean().optional(),
  prExerciseIds: z.array(z.string()).max(3).optional(),
});

// GET - Profil de l'utilisateur connecté (paramètres page publique)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        username: true,
        profilePublic: true,
        prExerciseIds: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    return NextResponse.json({
      username: user.username,
      profilePublic: user.profilePublic ?? false,
      prExerciseIds: user.prExerciseIds ?? [],
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour les paramètres du profil (page publique)
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateProfileSchema.parse(body);

    const updateData: { profilePublic?: boolean; prExerciseIds?: string[] } = {};
    if (validated.profilePublic !== undefined) {
      updateData.profilePublic = validated.profilePublic;
    }
    if (validated.prExerciseIds !== undefined) {
      updateData.prExerciseIds = validated.prExerciseIds.slice(0, 3);
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        username: true,
        profilePublic: true,
        prExerciseIds: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}
