import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username || username.length < 3) {
      return NextResponse.json(
        { available: false, message: "Le pseudo doit contenir au moins 3 caractères" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    return NextResponse.json({
      available: !existingUser,
      message: existingUser ? "Ce pseudo est déjà pris" : "Pseudo disponible",
    });
  } catch (error) {
    console.error("Check username error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification" },
      { status: 500 }
    );
  }
}
