import { cn } from "@/lib/utils";

interface ChartIconProps {
  className?: string;
  size?: number;
}

export function ChartIcon({ className, size = 24 }: ChartIconProps) {
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
      <path d="M3 3v18h18" />
      <path d="M7 16v-5" />
      <path d="M12 16V9" />
      <path d="M17 16v-2" />
    </svg>
  );
}
