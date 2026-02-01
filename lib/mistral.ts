export interface MistralExerciseDetection {
  exerciseName: string;
  reps?: number;
  weight?: number;
  confidence: number;
}

export async function detectExerciseFromText(
  text: string,
  availableExercises: Array<{
    name: string;
    nameEn?: string | null;
    nameFr?: string | null;
    nameIt?: string | null;
    nameEs?: string | null;
    nameNl?: string | null;
  }>
): Promise<MistralExerciseDetection | null> {
  const apiKey = process.env.MISTRAL_API_KEY;

  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY is not configured");
  }

  // Créer une liste de tous les noms possibles (toutes langues)
  const allExerciseNames = availableExercises.flatMap((ex) => {
    const names = [ex.name];
    if (ex.nameEn) names.push(ex.nameEn);
    if (ex.nameFr) names.push(ex.nameFr);
    if (ex.nameIt) names.push(ex.nameIt);
    if (ex.nameEs) names.push(ex.nameEs);
    if (ex.nameNl) names.push(ex.nameNl);
    return names;
  });

  const exercisesList = allExerciseNames.join(", ");
  
  // Créer un mapping des noms vers le nom principal
  const nameToMainName = new Map<string, string>();
  availableExercises.forEach((ex) => {
    nameToMainName.set(ex.name, ex.name);
    if (ex.nameEn) nameToMainName.set(ex.nameEn, ex.name);
    if (ex.nameFr) nameToMainName.set(ex.nameFr, ex.name);
    if (ex.nameIt) nameToMainName.set(ex.nameIt, ex.name);
    if (ex.nameEs) nameToMainName.set(ex.nameEs, ex.name);
    if (ex.nameNl) nameToMainName.set(ex.nameNl, ex.name);
  });

  const prompt = `Tu es un assistant spécialisé dans la détection d'exercices de musculation à partir de descriptions vocales.

Exercices disponibles dans la base de données: ${exercisesList}

Analyse le texte suivant et détermine:
1. Quel exercice est mentionné (doit être dans la liste ci-dessus)
2. Le nombre de répétitions (reps) si mentionné
3. Le poids en kg si mentionné

Texte à analyser: "${text}"

Réponds UNIQUEMENT avec un JSON valide au format suivant:
{
  "exerciseName": "nom de l'exercice exact de la liste",
  "reps": nombre ou null,
  "weight": nombre en kg ou null,
  "confidence": nombre entre 0 et 1
}

Si tu ne peux pas identifier un exercice de la liste, retourne null pour exerciseName.`;

  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Mistral API error:", error);
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return null;
    }

    // Parser la réponse JSON
    const parsed = JSON.parse(content);

    // Vérifier que l'exercice existe dans la liste et récupérer le nom principal
    if (!parsed.exerciseName) {
      return null;
    }

    const mainName = nameToMainName.get(parsed.exerciseName);
    if (!mainName) {
      return null;
    }

    return {
      exerciseName: mainName,
      reps: parsed.reps || undefined,
      weight: parsed.weight || undefined,
      confidence: parsed.confidence || 0.5,
    };
  } catch (error) {
    console.error("Error detecting exercise:", error);
    return null;
  }
}
