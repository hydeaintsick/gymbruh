import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
  gender: z.enum(["male", "female", "other"]),
  height: z.number().positive(),
  weight: z.number().positive(),
  birthDate: z.string().datetime(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/e8ad4e6c-3cce-4a1a-a17e-73b151af4e83',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:18',message:'Request body received',data:{body,heightRaw:body.height,weightRaw:body.weight,birthDateRaw:body.birthDate},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    const parsedHeight = parseFloat(body.height);
    const parsedWeight = parseFloat(body.weight);
    // Client already sends ISO datetime string, use it directly
    // Only convert if it's a simple date string (YYYY-MM-DD) without time
    const birthDateISO = body.birthDate && !body.birthDate.includes('T') 
      ? new Date(body.birthDate + 'T00:00:00.000Z').toISOString() 
      : body.birthDate;
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/e8ad4e6c-3cce-4a1a-a17e-73b151af4e83',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:23',message:'Values before validation',data:{parsedHeight,parsedWeight,isNaNHeight:isNaN(parsedHeight),isNaNWeight:isNaN(parsedWeight),birthDate:body.birthDate,birthDateISO,alreadyISO:body.birthDate?.includes('T')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    // Validation
    const validatedData = registerSchema.parse({
      ...body,
      height: parsedHeight,
      weight: parsedWeight,
      birthDate: birthDateISO,
    });

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/e8ad4e6c-3cce-4a1a-a17e-73b151af4e83',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:26',message:'Validation passed',data:{validatedData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // Vérifier si le pseudo existe déjà
    const existingUsername = await prisma.user.findUnique({
      where: { username: validatedData.username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Ce pseudo est déjà pris" },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingEmail = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        gender: validatedData.gender,
        height: validatedData.height,
        weight: validatedData.weight,
        birthDate: new Date(validatedData.birthDate),
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    // Créer une entrée de poids initiale
    await prisma.weightEntry.create({
      data: {
        userId: user.id,
        weight: validatedData.weight,
        date: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Compte créé avec succès", user },
      { status: 201 }
    );
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/e8ad4e6c-3cce-4a1a-a17e-73b151af4e83',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:85',message:'Error caught',data:{isZodError:error instanceof z.ZodError,zodErrors:error instanceof z.ZodError?error.errors:null,errorMessage:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}
