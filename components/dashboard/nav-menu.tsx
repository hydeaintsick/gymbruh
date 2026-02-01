"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Home, BarChart3, User, LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/performance", label: "Performances", icon: BarChart3 },
  { href: "/dashboard/profile", label: "Ma page", icon: User },
] as const;

export function NavMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-foreground"
          >
            gymbruh
          </Link>
          <div className="hidden md:flex items-center gap-4">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button
                  variant={pathname === href ? "default" : "ghost"}
                  size="sm"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/session/new" className="hidden md:block">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle séance
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="hidden md:inline-flex"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
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
              <div className="flex flex-col gap-2">
                {navItems.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={pathname === href ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {label}
                    </Button>
                  </Link>
                ))}
                <div className="border-t border-border/40 pt-4 mt-2 flex flex-col gap-2">
                  <Link
                    href="/dashboard/session/new"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button size="sm" className="w-full justify-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvelle séance
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full justify-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </nav>
  );
}
