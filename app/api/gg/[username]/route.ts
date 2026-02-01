import { NextResponse } from "next/server";
import { getPublicWallData } from "@/lib/public-wall";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    if (!username?.trim()) {
      return NextResponse.json(
        { error: "Pseudo requis" },
        { status: 400 }
      );
    }

    const data = await getPublicWallData(username);

    if (!data) {
      return NextResponse.json(
        { error: "Profil non trouvé ou privé" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching public wall:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil" },
      { status: 500 }
    );
  }
}
