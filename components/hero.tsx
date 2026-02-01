"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DumbbellIcon } from "@/components/icons";
import { MicIcon } from "@/components/icons";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-20 md:py-32 md:px-6">
      <div className="landing-gradient absolute inset-0" aria-hidden />
      <div className="container relative mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:gap-16 md:items-center">
        <div className="space-y-8 text-center md:text-left">
          <motion.h1
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Your AI gym companion.{" "}
            <span className="text-primary">Just talk.</span>
          </motion.h1>
          <motion.p
            className="max-w-xl mx-auto md:mx-0 text-lg text-muted-foreground md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Describe your session in plain English. Mistral AI builds your
            workout structure. Get KPIs, hypothetical PRs, and compare with
            friends—all hands-free with voice.
          </motion.p>
          <motion.div
            className="flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button asChild size="lg" className="text-base">
              <Link href="#pricing">Get started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <Link href="#features">See how it works</Link>
            </Button>
          </motion.div>
        </div>
        <motion.div
          className="relative flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative rounded-2xl border border-border/50 bg-card/50 p-8 md:p-12 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-6">
              <DumbbellIcon
                className="size-20 text-primary md:size-28"
                size={112}
              />
              <MicIcon className="size-16 text-primary/80 md:size-20" size={80} />
            </div>
            <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
              Voice-first. No typing in the gym.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
