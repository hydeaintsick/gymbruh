"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const planFeatures = [
  "Unlimited voice sessions",
  "Mistral AI workout structure",
  "KPIs & most-used exercises",
  "Hypothetical PR estimates",
  "Compare with friends",
  "Weight tracking",
];

export function Pricing() {
  return (
    <section id="pricing" className="px-4 py-20 md:py-28 md:px-6">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          className="mb-12 text-center md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Simple pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            One plan. Everything included. No hidden fees.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <Card className="w-full max-w-md border-primary/30 bg-card/80 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Pro</CardTitle>
              <CardDescription className="text-base">
                Full access to gymbruh
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground md:text-5xl">
                  €10
                </span>
                <span className="text-muted-foreground">/month</span>
                <p className="mt-1 text-sm text-muted-foreground">inc. VAT (TTC)</p>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {planFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex justify-center pt-4">
              <Button asChild size="lg" className="w-full max-w-xs">
                <Link href="#contact">Subscribe</Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
