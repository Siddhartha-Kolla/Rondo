"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SaveStatus } from "@/components/save-status";
import { useApp } from "@/lib/store";
import type { Key } from "@/lib/i18n";

// Link a display screen can open without logging in (relative to wherever the app is hosted)
export const displayUrl = (shareId: string) => new URL(`display?t=${shareId}`, window.location.href).toString();

// Supabase's English error text -> one of our own short lines (unknown errors are shown as they are)
function friendly(message: string, t: (key: Key) => string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return t("wrongCredentials");
  if (m.includes("signups not allowed") || m.includes("signup is disabled") || m.includes("signups are disabled")) return t("signupsClosed");
  if (m.includes("at least") && m.includes("character")) return t("weakPassword");
  if (m.includes("already registered")) return t("alreadyRegistered");
  return message;
}

export function CloudSection() {
  const { cloud, t } = useApp();
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!cloud.available) return null;

  const submit = async (mode: "in" | "up") => {
    setBusy(true);
    setMessage(null);
    if (mode === "in") {
      const error = await cloud.signIn(address.trim(), password);
      if (error) setMessage({ text: friendly(error, t), error: true });
    } else {
      const { error, confirm } = await cloud.signUp(address.trim(), password);
      if (error) setMessage({ text: friendly(error, t), error: true });
      else if (confirm) setMessage({ text: t("confirmEmailSent"), error: false });
    }
    setBusy(false);
  };

  return (
    <section className="flex flex-col gap-2 border-t pt-4" aria-labelledby="cloud-heading">
      <h2 id="cloud-heading" className="font-medium">
        {t("cloud")}
      </h2>

      {cloud.email ? (
        <>
          <p className="[overflow-wrap:anywhere]">{t("signedInAs", { email: cloud.email })}</p>
          <SaveStatus />

          {cloud.shareId && (
            <div className="flex flex-col gap-1">
              <Label htmlFor="display-link">{t("displayLink")}</Label>
              <div className="flex gap-2">
                <Input id="display-link" readOnly value={displayUrl(cloud.shareId)} onFocus={(e) => e.currentTarget.select()} />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard?.writeText(displayUrl(cloud.shareId!)).then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    });
                  }}
                >
                  {copied ? t("copied") : t("copy")}
                </Button>
              </div>
              <p className="text-muted-foreground">{t("displayLinkHint")}</p>
            </div>
          )}

          <Button variant="outline" className="self-start" onClick={cloud.signOut}>
            {t("signOut")}
          </Button>
        </>
      ) : (
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit("in");
          }}
        >
          <p className="text-muted-foreground">{t("cloudHint")}</p>
          <div className="flex flex-col gap-1">
            <Label htmlFor="cloud-email">{t("email")}</Label>
            <Input id="cloud-email" type="email" autoComplete="email" required value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="cloud-password">{t("password")}</Label>
            <Input
              id="cloud-password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={busy || !address.trim() || password.length < 8}>
              {t("signIn")}
            </Button>
            <Button type="button" variant="outline" disabled={busy || !address.trim() || password.length < 8} onClick={() => submit("up")}>
              {t("createAccount")}
            </Button>
          </div>
          {message && (
            <p role={message.error ? "alert" : "status"} className={message.error ? "text-destructive [overflow-wrap:anywhere]" : ""}>
              {message.text}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
