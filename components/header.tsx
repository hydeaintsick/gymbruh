"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import { User } from "lucide-react";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [authOpen, setAuthOpen] = React.useState(false);
  const { data: session, status } = useSession();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between px-4 md:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-foreground"
          >
            gymbruh
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {status === "loading" ? (
            <div className="h-9 w-20 animate-pulse bg-muted rounded-md" />
          ) : session?.user ? (
            <Link href="/dashboard">
              <Button variant="outline">
                <User className="h-4 w-4 mr-2" />
                {(session.user as any).username || session.user.email}
              </Button>
            </Link>
          ) : (
            <Button onClick={() => setAuthOpen(true)}>Connexion</Button>
          )}
        </div>
      </header>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
