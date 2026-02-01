import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40 px-4 py-8 md:px-6">
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-muted-foreground">
          Made with love by{" "}
          <span className="font-medium text-foreground">hydeaintsick</span>
        </p>
        <nav className="flex gap-6 text-sm text-muted-foreground">
          <Link href="#" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
          <Link href="#" className="transition-colors hover:text-foreground">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
