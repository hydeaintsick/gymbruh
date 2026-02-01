"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DumbbellIcon,
  PowerIcon,
  MicIcon,
  ChartIcon,
  UsersIcon,
} from "@/components/icons";

const features = [
  {
    icon: MicIcon,
    title: "Natural language sessions",
    description:
      "Describe your workout in plain English. No forms, no tapping—just talk. Hands-free in the gym.",
  },
  {
    icon: PowerIcon,
    title: "Mistral AI structure",
    description:
      "Mistral AI analyzes your description and builds a structured session: exercises, sets, reps, and order.",
  },
  {
    icon: ChartIcon,
    title: "KPIs & top exercises",
    description:
      "See your most-used exercises, volume trends, and session frequency. Know what you actually do.",
  },
  {
    icon: PowerIcon,
    title: "Hypothetical PR",
    description:
      "Get estimated one-rep max and progress indicators based on your logged lifts.",
  },
  {
    icon: UsersIcon,
    title: "Compare with friends",
    description:
      "Add friends and compare volume, frequency, or PRs. Stay motivated together.",
  },
  {
    icon: DumbbellIcon,
    title: "Log your weight",
    description:
      "Track body weight over time. Simple, voice-first. No spreadsheets.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Features() {
  return (
    <section id="features" className="px-4 py-20 md:py-28 md:px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="mb-12 text-center md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Everything you need. Voice-first.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            From logging your session to tracking progress and competing with
            friends—all without touching your phone.
          </p>
        </motion.div>
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={item}>
              <Card className="h-full border-border/50 bg-card/50 transition-colors hover:border-primary/30">
                <CardHeader>
                  <div className="mb-2 inline-flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <feature.icon className="size-5" size={20} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
