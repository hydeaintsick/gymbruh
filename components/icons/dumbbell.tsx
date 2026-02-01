import { cn } from "@/lib/utils";

interface DumbbellIconProps {
  className?: string;
  size?: number;
}

export function DumbbellIcon({ className, size = 24 }: DumbbellIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={cn(className)}
    >
      <path d="M2 8h4v8H2z" />
      <path d="M18 8h4v8h-4z" />
      <path d="M6 12h12" />
      <path d="M6 8v8" />
      <path d="M18 8v8" />
    </svg>
  );
}
