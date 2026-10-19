"use client"
import { Shell } from "@/components/shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/lib/store";

export default function Home() {
  return (
    <AppProvider>
      <TooltipProvider>
        <Shell />
      </TooltipProvider>
    </AppProvider>
  );
}
