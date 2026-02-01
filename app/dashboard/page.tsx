"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Calendar, Dumbbell, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

const LONG_PRESS_MS = 500;

interface WorkoutSession {
  id: string;
  name: string;
  date: string;
  sets: Array<{
    id: string;
    exercise: {
      name: string;
    };
    reps: number;
    weight: number;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [sessions, setSessions] = React.useState<WorkoutSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionSheetSession, setActionSheetSession] =
    React.useState<WorkoutSession | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const longPressTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const longPressTriggeredRef = React.useRef(false);

  React.useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions?limit=10");
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const openActionSheet = (session: WorkoutSession) => {
    setActionSheetSession(session);
  };

  const closeActionSheet = () => {
    setActionSheetSession(null);
  };

  const handleLongPressStart = (session: WorkoutSession) => {
    longPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      openActionSheet(session);
      longPressTimerRef.current = null;
    }, LONG_PRESS_MS);
  };

  const handleLongPressEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (longPressTriggeredRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleContextMenu = (e: React.MouseEvent, session: WorkoutSession) => {
    e.preventDefault();
    openActionSheet(session);
  };

  const handleEdit = () => {
    if (actionSheetSession) {
      router.push(`/dashboard/session/${actionSheetSession.id}`);
      closeActionSheet();
    }
  };

  const handleDelete = async () => {
    if (!actionSheetSession) return;
    const id = actionSheetSession.id;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur suppression");
      setSessions((prev) => prev.filter((s) => s.id !== id));
      closeActionSheet();
    } catch (err) {
      console.error("Error deleting session:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos séances d'entraînement
          </p>
        </div>
        <Link href="/dashboard/session/new">
          <Button size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle séance
          </Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Aucune séance pour le moment
            </h3>
            <p className="text-muted-foreground mb-4 text-center">
              Commencez par créer votre première séance d'entraînement
            </p>
            <Link href="/dashboard/session/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Créer une séance
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="h-full"
              onTouchStart={() => handleLongPressStart(session)}
              onTouchEnd={handleLongPressEnd}
              onTouchCancel={handleLongPressEnd}
              onMouseDown={() => handleLongPressStart(session)}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
              onContextMenu={(e) => handleContextMenu(e, session)}
            >
              <Link
                href={`/dashboard/session/${session.id}`}
                className="block"
                onClick={(e) => {
                  if (longPressTriggeredRef.current) {
                    e.preventDefault();
                    longPressTriggeredRef.current = false;
                  }
                }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{session.name}</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {format(new Date(session.date), "PPP")}
                    </p>
                    <div className="space-y-2">
                      {session.sets.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Aucun exercice enregistré
                        </p>
                      ) : (
                        session.sets
                          .slice(0, 3)
                          .map((set) => (
                            <div
                              key={set.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="font-medium">
                                {set.exercise.name}
                              </span>
                              <span className="text-muted-foreground">
                                {set.reps} × {set.weight}kg
                              </span>
                            </div>
                          ))
                      )}
                      {session.sets.length > 3 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          +{session.sets.length - 3} exercice(s) supplémentaire(s)
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!actionSheetSession} onOpenChange={(open) => !open && closeActionSheet()}>
        <DialogContent
          className="sm:max-w-[340px] rounded-t-2xl rounded-b-none sm:rounded-b-lg fixed bottom-0 left-1/2 -translate-x-1/2 top-auto translate-y-0 sm:bottom-auto sm:left-[50%] sm:top-[50%] sm:-translate-y-1/2"
          showCloseButton={true}
        >
          <DialogHeader>
            <DialogTitle>
              {actionSheetSession?.name ?? "Séance"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Button
              variant="outline"
              className="justify-start gap-3 h-12"
              onClick={handleEdit}
            >
              <Pencil className="h-4 w-4" />
              Éditer
            </Button>
            <Button
              variant="destructive"
              className="justify-start gap-3 h-12"
              onClick={handleDelete}
              disabled={deletingId === actionSheetSession?.id}
            >
              <Trash2 className="h-4 w-4" />
              {deletingId === actionSheetSession?.id
                ? "Suppression..."
                : "Supprimer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
