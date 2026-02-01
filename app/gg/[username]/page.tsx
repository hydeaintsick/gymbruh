import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Calendar, Trophy, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getPublicWallData } from "@/lib/public-wall";

export default async function PublicWallPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await getPublicWallData(username);

  if (!data) {
    notFound();
  }

  const { username: pseudo, lastSession, prs } = data;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-2xl">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </Link>
        </div>

        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            /gg/{pseudo}
          </h1>
          <p className="text-muted-foreground mt-2">
            Page publique · gymbruh
          </p>
        </header>

        {lastSession ? (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Dernière séance</span>
              </div>
              <CardTitle className="text-xl">
                {lastSession.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {format(new Date(lastSession.date), "PPP", { locale: fr })}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Meilleures perfs à cette séance
              </p>
              {lastSession.highlights?.length > 0 ? (
                <ul className="space-y-2">
                  {lastSession.highlights.map((h: { exerciseName: string; reps: number; weight: number }) => (
                    <li
                      key={h.exerciseName}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <span className="font-medium">{h.exerciseName}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {h.reps} × {h.weight} kg
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucun exercice enregistré
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Dumbbell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucune séance pour le moment</p>
            </CardContent>
          </Card>
        )}

        {prs?.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <span>PR — 3 exos au choix</span>
              </div>
              <CardTitle className="text-xl">Records personnels</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {prs.map(
                  (pr: {
                    exerciseName: string;
                    maxWeight: number;
                    maxReps: number;
                    estimated1RM: number;
                  }) => (
                    <li
                      key={pr.exerciseName}
                      className="flex flex-col gap-1 py-3 border-b border-border last:border-0"
                    >
                      <span className="font-semibold">{pr.exerciseName}</span>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>Max poids: {pr.maxWeight} kg</span>
                        <span>Max reps: {pr.maxReps}</span>
                        {pr.estimated1RM > 0 && (
                          <span>1RM estimé: {pr.estimated1RM} kg</span>
                        )}
                      </div>
                    </li>
                  )
                )}
              </ul>
            </CardContent>
          </Card>
        )}

        {prs?.length === 0 && lastSession && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Aucun PR configuré pour l&apos;affichage
          </p>
        )}
      </div>
    </div>
  );
}
