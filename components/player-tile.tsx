import { cn } from "@/lib/utils";

// Square initials tile. Only the "warm" look shows it (see .player-tile in globals.css).
export function PlayerTile({ name, className }: { name: string; className?: string }) {
  const initials =
    name
      .trim()
      .split(/[\s-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?";
  let tone = 0;
  for (const char of name) tone = (tone * 31 + char.charCodeAt(0)) % 4;
  return (
    <span aria-hidden data-tone={tone} className={cn("player-tile", className)}>
      {initials}
    </span>
  );
}
