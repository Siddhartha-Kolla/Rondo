"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { emptyState, type State } from "@/lib/repository";

// A backup file is just the saved state; it must at least have players and rounds
function parseBackup(text: string): State | null {
  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data?.players) || !Array.isArray(data?.rounds)) return null;
    return { ...emptyState, ...data };
  } catch {
    return null;
  }
}

export function BackupSection() {
  const { state, actions, t } = useApp();
  const fileInput = useRef<HTMLInputElement>(null);
  const [invalid, setInvalid] = useState(false);

  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `sternchenturnier-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="flex flex-col gap-2 border-t pt-4" aria-labelledby="backup-heading">
      <h2 id="backup-heading" className="font-medium">
        {t("backup")}
      </h2>
      <p className="text-muted-foreground">{t("backupHint")}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={download}>
          {t("downloadBackup")}
        </Button>
        <Button variant="outline" onClick={() => fileInput.current?.click()}>
          {t("loadBackup")}
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            const parsed = parseBackup(await file.text());
            setInvalid(parsed === null);
            if (parsed) actions.replaceAll({ ...parsed, lang: state.lang });
          }}
        />
      </div>
      {invalid && (
        <p role="alert" className="text-destructive">
          {t("backupInvalid")}
        </p>
      )}
    </section>
  );
}
