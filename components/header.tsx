"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AuthModal } from "@/components/auth-modal";
import { User, Menu } from "lucide-react";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [authOpen, setAuthOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
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
          <div className="flex items-center gap-2">
            {status === "loading" ? (
              <div className="h-9 w-20 animate-pulse bg-muted rounded-md" />
            ) : session?.user ? (
              <Link href="/dashboard" className="hidden md:block">
                <Button variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  {(session.user as any).username || session.user.email}
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() => setAuthOpen(true)}
                className="hidden md:inline-flex"
              >
                Connexion
              </Button>
            )}
            <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Ouvrir le menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent
                showCloseButton={true}
                className="fixed top-0 right-0 left-auto h-full w-[min(300px,85vw)] max-w-[85vw] translate-y-0 translate-x-full rounded-l-lg rounded-r-none border-r border-t border-b border-l-0 p-6 pt-14 transition-transform duration-200 ease-out data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full md:hidden"
              >
                <DialogTitle className="sr-only">Menu</DialogTitle>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base font-medium text-foreground py-2 border-b border-border/40 last:border-0"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="pt-4">
                    {session?.user ? (
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button variant="outline" className="w-full justify-center">
                          <User className="h-4 w-4 mr-2" />
                          {(session.user as any).username || session.user.email}
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setAuthOpen(true);
                        }}
                        className="w-full"
                      >
                        Connexion
                      </Button>
                    )}
                  </div>
                </nav>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
