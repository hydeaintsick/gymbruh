import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSessionSchema = z.object({
  name: z.string().optional(),
  date: z.string().datetime().optional(),
});

// GET - Liste des séances de l'utilisateur
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const sessions = await prisma.workoutSession.findMany({
      where: { userId: session.user.id },
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
      orderBy: {
        date: "desc",
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.workoutSession.count({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      sessions,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des séances" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle séance
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createSessionSchema.parse(body);

    const workoutSession = await prisma.workoutSession.create({
      data: {
        userId: session.user.id,
        name: validatedData.name || "Workout",
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
      },
      include: {
        sets: {
          include: {
            exercise: true,
          },
        },
      },
    });

    return NextResponse.json(workoutSession, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la séance" },
      { status: 500 }
    );
  }
}
