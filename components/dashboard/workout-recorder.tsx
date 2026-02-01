"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Mic, Loader2, Check, RotateCcw, X } from "lucide-react";

interface WorkoutRecorderProps {
  onExerciseDetected: (data: {
    exerciseId: string;
    exerciseName: string;
    reps?: number;
    weight?: number;
  }) => void;
  isProcessing?: boolean;
}

const VISUALIZER_WIDTH = 280;
const VISUALIZER_HEIGHT = 56;
const BAR_COUNT = 48;
const FFT_SIZE = 256;

export function WorkoutRecorder({
  onExerciseDetected,
  isProcessing = false,
}: WorkoutRecorderProps) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [transcript, setTranscript] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [reviewTranscript, setReviewTranscript] = React.useState<string | null>(
    null
  );
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);

  const recognitionRef = React.useRef<SpeechRecognition | null>(null);
  const transcriptRef = React.useRef("");
  const streamRef = React.useRef<MediaStream | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const liveCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const blobCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);

  React.useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "La reconnaissance vocale n'est pas disponible dans ce navigateur"
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "fr-FR";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t + " ";
        } else {
          interimTranscript += t;
        }
      }

      const newTranscript = finalTranscript + interimTranscript;
      transcriptRef.current = newTranscript;
      setTranscript(newTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "no-speech") {
        setError("Aucune parole détectée");
      } else if (event.error === "not-allowed") {
        setError("Microphone non autorisé");
      } else {
        setError(`Erreur: ${event.error}`);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const stopLiveVisualizer = React.useCallback(() => {
    if (animationFrameRef.current != null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    analyserRef.current = null;
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const drawLiveWaveform = React.useCallback(() => {
    const canvas = liveCanvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const barWidth = canvas.width / BAR_COUNT;
    const gap = 2;

    const draw = () => {
      if (!analyserRef.current || !liveCanvasRef.current) return;
      analyserRef.current.getByteTimeDomainData(dataArray);
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const step = Math.floor(dataArray.length / BAR_COUNT);
      for (let i = 0; i < BAR_COUNT; i++) {
        const value = dataArray[i * step];
        const barHeight =
          (value / 255) * (canvas.height * 0.8) * 0.5 + canvas.height * 0.1;
        const x = i * barWidth + gap / 2;
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(
          x,
          (canvas.height - barHeight) / 2,
          barWidth - gap,
          barHeight
        );
      }
      animationFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  }, []);

  React.useEffect(() => {
    if (!audioBlob || !blobCanvasRef.current) return;

    const canvas = blobCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;

    const run = async () => {
      try {
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioContext = new AudioContext();
        const buffer = await audioContext.decodeAudioData(arrayBuffer);
        await audioContext.close();

        if (cancelled) return;

        const channelData = buffer.getChannelData(0);
        const barWidth = canvas.width / BAR_COUNT;
        const gap = 2;
        const step = Math.floor(channelData.length / BAR_COUNT);

        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < BAR_COUNT; i++) {
          let sum = 0;
          const start = i * step;
          const end = Math.min(start + step, channelData.length);
          for (let j = start; j < end; j++) {
            sum += Math.abs(channelData[j]);
          }
          const avg = end > start ? sum / (end - start) : 0;
          const barHeight = Math.min(
            canvas.height * 0.9,
            avg * canvas.height * 4
          );
          const x = i * barWidth + gap / 2;
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(
            x,
            (canvas.height - barHeight) / 2,
            barWidth - gap,
            barHeight
          );
        }
      } catch (err) {
        console.error("Failed to decode audio for waveform:", err);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [audioBlob]);

  const startRecording = React.useCallback(async () => {
    if (!recognitionRef.current) {
      setError("Reconnaissance vocale non disponible");
      return;
    }

    setError(null);
    setTranscript("");
    setReviewTranscript(null);
    setAudioBlob(null);
    transcriptRef.current = "";
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          setAudioBlob(blob);
        }
        mediaRecorderRef.current = null;
      };

      recorder.start(100);
      setIsRecording(true);
      recognitionRef.current.start();

      requestAnimationFrame(() => drawLiveWaveform());
    } catch (err) {
      console.error("Failed to start microphone:", err);
      setError("Microphone non autorisé ou indisponible");
    }
  }, [drawLiveWaveform]);

  const detectExercise = React.useCallback(
    async (text: string) => {
      try {
        const response = await fetch("/api/ai/detect-exercise", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || "Erreur lors de la détection");
          return;
        }

        const data = await response.json();

        if (data.exercise) {
          onExerciseDetected({
            exerciseId: data.exercise.id,
            exerciseName: data.exercise.name,
            reps: data.reps,
            weight: data.weight,
          });
          setTranscript("");
          transcriptRef.current = "";
          setError(null);
          setReviewTranscript(null);
          setAudioBlob(null);
        } else {
          setError("Aucun exercice détecté dans votre description");
        }
      } catch (err) {
        console.error("Error detecting exercise:", err);
        setError("Erreur lors de la détection de l'exercice");
      }
    },
    [onExerciseDetected]
  );

  const stopRecording = React.useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      mr.stop();
    }
    stopLiveVisualizer();
    setIsRecording(false);
    setReviewTranscript(transcriptRef.current?.trim() || null);
  }, [stopLiveVisualizer]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (isProcessing || isRecording || reviewTranscript) return;
    startRecording();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    if (isRecording) {
      stopRecording();
    }
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    e.preventDefault();
    if (isRecording) {
      stopRecording();
    }
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    e.preventDefault();
    if (isRecording) {
      stopRecording();
    }
  };

  const handleValider = () => {
    if (!reviewTranscript?.trim()) return;
    detectExercise(reviewTranscript.trim());
  };

  const handleRefaire = () => {
    setReviewTranscript(null);
    setAudioBlob(null);
    setTranscript("");
    transcriptRef.current = "";
    setError(null);
  };

  const handleAnnuler = () => {
    setReviewTranscript(null);
    setAudioBlob(null);
    setTranscript("");
    transcriptRef.current = "";
    setError(null);
  };

  const showReview = reviewTranscript !== null && !isRecording;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        {!showReview && (
          <Button
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            onPointerCancel={handlePointerCancel}
            disabled={isProcessing}
            variant={isRecording ? "destructive" : "default"}
            size="lg"
            className="flex items-center gap-2 touch-none select-none min-w-[220px]"
            aria-label={
              isRecording
                ? "Relâchez pour arrêter l'enregistrement"
                : "Maintenez pour enregistrer"
            }
          >
            <Mic className="h-5 w-5" />
            {isRecording
              ? "Relâchez pour arrêter"
              : "Maintenir pour enregistrer"}
          </Button>
        )}

        {isRecording && (
          <div className="w-full max-w-sm">
            <canvas
              ref={liveCanvasRef}
              width={VISUALIZER_WIDTH}
              height={VISUALIZER_HEIGHT}
              className="w-full rounded-lg border border-border bg-slate-800"
              aria-hidden
            />
            <p className="text-xs text-center text-muted-foreground mt-1">
              Enregistrement en cours... Parlez maintenant.
            </p>
          </div>
        )}

        {showReview && (
          <div className="w-full max-w-sm space-y-3">
            <canvas
              ref={blobCanvasRef}
              width={VISUALIZER_WIDTH}
              height={VISUALIZER_HEIGHT}
              className="w-full rounded-lg border border-border bg-slate-800"
              aria-hidden
            />
            <p className="text-xs text-center text-muted-foreground">
              Relâchez pour voir la bande son. Validez pour transcrire et
              détecter l&apos;exercice.
            </p>
          </div>
        )}

        {showReview && (
          <div className="w-full space-y-3 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              Transcription (aperçu) :
            </p>
            <p className="text-base font-medium">
              {reviewTranscript || "(vide)"}
            </p>
            <p className="text-xs text-muted-foreground">
              Cliquez sur Valider pour transcrire et envoyer à l&apos;IA.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleValider}
                size="sm"
                disabled={isProcessing || !reviewTranscript?.trim()}
                className="gap-1"
              >
                <Check className="h-4 w-4" />
                Valider
              </Button>
              <Button
                onClick={handleRefaire}
                variant="secondary"
                size="sm"
                disabled={isProcessing}
                className="gap-1"
              >
                <RotateCcw className="h-4 w-4" />
                Refaire
              </Button>
              <Button
                onClick={handleAnnuler}
                variant="ghost"
                size="sm"
                disabled={isProcessing}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Annuler
              </Button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Transcription et analyse en cours...
          </div>
        )}
      </div>

      {transcript && !isRecording && !showReview && (
        <div className="rounded-md border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground mb-2">Transcription :</p>
          <p className="text-base">{transcript}</p>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
