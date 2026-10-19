"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";

export const formatTime = (d: Date, seconds = false) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", ...(seconds ? { second: "2-digit" } : {}) });

// One line that always says where the data lives: a square marker plus text
export function SaveStatus() {
  const { cloud, t } = useApp();
  if (!cloud.available) return null;

  const { status } = cloud;
  const bad = status === "conflict" || status === "error" || status === "auth";
  const text = {
    local: t("statusLocal"),
    saving: t("statusSaving"),
    saved: t("statusSaved", { time: cloud.lastSavedAt ? formatTime(cloud.lastSavedAt) : "" }),
    offline: t("statusOffline"),
    conflict: t("statusConflict"),
    auth: t("statusAuth"),
    error: t("statusError"),
  }[status];

  return (
    <p role="status" className={cn("flex flex-wrap items-center gap-x-2", bad ? "text-destructive" : "text-muted-foreground")}>
      <span aria-hidden className={cn("size-2 shrink-0", status === "saved" ? "bg-table-blue" : bad ? "bg-destructive" : "bg-muted-foreground")} />
      <span>{text}</span>
      {status === "error" && cloud.errorText && <span className="[overflow-wrap:anywhere]">({cloud.errorText})</span>}
      {status === "conflict" && (
        <Button size="xs" variant="outline" onClick={cloud.reload}>
          {t("reload")}
        </Button>
      )}
    </p>
  );
}
