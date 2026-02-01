"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface PerformanceData {
  date: string;
  weight?: number;
  reps?: number;
  volume?: number;
  estimated1RM?: number;
}

interface PRData {
  maxWeight: number;
  maxVolume: number;
  maxReps?: number;
  maxEstimated1RM?: number;
}

interface ExercisePerformanceChartProps {
  exerciseName: string;
  data: PerformanceData[];
  prs: PRData;
  type?: "weight" | "volume" | "reps" | "1rm";
}

export function ExercisePerformanceChart({
  exerciseName,
  data,
  prs,
  type = "weight",
}: ExercisePerformanceChartProps) {
  const chartData = data.map((d) => ({
    date: format(new Date(d.date), "dd/MM"),
    weight: d.weight,
    reps: d.reps,
    volume: d.volume,
    estimated1RM: d.estimated1RM,
  }));

  const getYAxisLabel = () => {
    switch (type) {
      case "weight":
        return "Poids (kg)";
      case "volume":
        return "Volume (kg)";
      case "reps":
        return "Répétitions";
      case "1rm":
        return "1RM estimé (kg)";
      default:
        return "Poids (kg)";
    }
  };

  const getDataKey = () => {
    switch (type) {
      case "weight":
        return "weight";
      case "volume":
        return "volume";
      case "reps":
        return "reps";
      case "1rm":
        return "estimated1RM";
      default:
        return "weight";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{exerciseName}</CardTitle>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>PR Poids: {prs.maxWeight}kg</span>
          {prs.maxVolume > 0 && <span>PR Volume: {prs.maxVolume}kg</span>}
          {prs.maxEstimated1RM && (
            <span>PR 1RM estimé: {prs.maxEstimated1RM}kg</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: getYAxisLabel(), angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={getDataKey()}
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface WeightChartProps {
  data: Array<{ date: string; weight: number }>;
}

export function WeightChart({ data }: WeightChartProps) {
  const chartData = data.map((d) => ({
    date: format(new Date(d.date), "dd/MM"),
    weight: d.weight,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution du poids</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              label={{ value: "Poids (kg)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface PRCardProps {
  exerciseName: string;
  prs: PRData;
}

export function PRCard({ exerciseName, prs }: PRCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{exerciseName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Poids max:</span>
            <span className="font-semibold">{prs.maxWeight}kg</span>
          </div>
          {prs.maxVolume > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Volume max:</span>
              <span className="font-semibold">{prs.maxVolume}kg</span>
            </div>
          )}
          {prs.maxEstimated1RM && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">1RM estimé:</span>
              <span className="font-semibold">{prs.maxEstimated1RM}kg</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
