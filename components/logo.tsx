import { cn } from "@/lib/utils";

// The Rondo mark: four players (squares), one of them holding the star. Colours follow the theme tokens.
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("size-6 shrink-0", className)}>
      <rect x="4" y="4" width="26" height="26" fill="var(--table-blue)" />
      <rect x="34" y="4" width="26" height="26" fill="currentColor" />
      <rect x="4" y="34" width="26" height="26" fill="currentColor" />
      <rect x="34" y="34" width="26" height="26" fill="var(--table-blue)" />
      <path d="M17.0 7.5 20.09 13.75 26.99 14.76 21.99 19.62 23.17 26.49 17.0 23.25 10.83 26.49 12.01 19.62 7.01 14.76 13.91 13.75Z" fill="var(--star-table)" />
    </svg>
  );
}
