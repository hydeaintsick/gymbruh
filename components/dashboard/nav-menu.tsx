"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Home, BarChart3, User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function NavMenu() {
  const pathname = usePathname();
  const router = useRouter();

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
            <Link href="/dashboard">
              <Button
                variant={pathname === "/dashboard" ? "default" : "ghost"}
                size="sm"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/performance">
              <Button
                variant={pathname === "/dashboard/performance" ? "default" : "ghost"}
                size="sm"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Performances
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button
                variant={pathname === "/dashboard/profile" ? "default" : "ghost"}
                size="sm"
              >
                <User className="h-4 w-4 mr-2" />
                Ma page
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/session/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle séance
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>
    </nav>
  );
}
