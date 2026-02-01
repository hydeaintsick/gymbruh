import { Exercise } from "@prisma/client";

type Language = "en" | "fr" | "it" | "es" | "nl";

/**
 * Retourne le nom traduit d'un exercice selon la langue préférée
 * Retourne le nom principal si la traduction n'est pas disponible
 */
export function getExerciseName(
  exercise: Exercise,
  language: Language = "fr"
): string {
  switch (language) {
    case "en":
      return exercise.nameEn || exercise.name;
    case "fr":
      return exercise.nameFr || exercise.name;
    case "it":
      return exercise.nameIt || exercise.name;
    case "es":
      return exercise.nameEs || exercise.name;
    case "nl":
      return exercise.nameNl || exercise.name;
    default:
      return exercise.name;
  }
}

/**
 * Retourne tous les noms possibles d'un exercice (toutes langues)
 */
export function getAllExerciseNames(exercise: Exercise): string[] {
  const names = [exercise.name];
  if (exercise.nameEn) names.push(exercise.nameEn);
  if (exercise.nameFr) names.push(exercise.nameFr);
  if (exercise.nameIt) names.push(exercise.nameIt);
  if (exercise.nameEs) names.push(exercise.nameEs);
  if (exercise.nameNl) names.push(exercise.nameNl);
  return names;
}
