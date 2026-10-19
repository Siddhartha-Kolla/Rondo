"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

function DisplayLink() {
  const { cloud, t } = useApp();
  const [copied, setCopied] = useState(false);
  if (!cloud.shareId) return null;
  const url = displayUrl(cloud.shareId);

  if (!cloud.shareEnabled) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground">{t("linkIsOff")}</p>
        <Button variant="outline" className="self-start" onClick={() => cloud.setLinkEnabled(true)}>
          {t("linkOn")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor="display-link">{t("displayLink")}</Label>
      <div className="flex gap-2">
        <Input id="display-link" readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
        <Button
          variant="outline"
          onClick={() => {
            navigator.clipboard?.writeText(url).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
        >
          {copied ? t("copied") : t("copy")}
        </Button>
      </div>
      <p className="text-muted-foreground">{t("displayLinkHint")}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        <Button variant="outline" onClick={cloud.newShareLink}>
          {t("newLink")}
        </Button>
        <Button variant="outline" onClick={() => cloud.setLinkEnabled(false)}>
          {t("linkOff")}
        </Button>
      </div>
      <p className="text-muted-foreground">{t("newLinkHint")}</p>
    </div>
  );
}

function DeleteAccount({ email }: { email: string }) {
  const { cloud, t } = useApp();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <div className="flex flex-col gap-1 border-t pt-4">
        <Button variant="ghost" className="self-start" onClick={() => setOpen(true)}>
          {t("deleteAccount")}
        </Button>
      </div>
    );
  }

  const matches = typed.trim().toLowerCase() === email.toLowerCase();
  return (
    <div className="flex flex-col gap-2 border-t pt-4">
      <h3 className="font-medium">{t("deleteAccount")}</h3>
      <p>{t("deleteAccountHint")}</p>
      <Label htmlFor="delete-confirm">{t("deleteAccountConfirm")}</Label>
      <Input id="delete-confirm" value={typed} autoComplete="off" onChange={(e) => setTyped(e.target.value)} />
      <div className="flex gap-2">
        <Button
          variant="destructive"
          disabled={!matches}
          onClick={async () => setError(await cloud.deleteAccount())}
        >
          {t("deleteAccountButton")}
        </Button>
        <Button variant="outline" onClick={() => setOpen(false)}>
          {t("cancel")}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-destructive [overflow-wrap:anywhere]">
          {error}
        </p>
      )}
    </div>
  );
}

export function CloudSection() {
  const { cloud, t } = useApp();
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [signOutBlocked, setSignOutBlocked] = useState(false);

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

  const complete = address.trim() !== "" && password.length >= 8;

  return (
    <section className="flex flex-col gap-3" aria-labelledby="account-heading">
      <h2 id="account-heading" className="font-medium">
        {t("account")}
      </h2>

      {cloud.email ? (
        <>
          <p className="[overflow-wrap:anywhere]">{t("signedInAs", { email: cloud.email })}</p>
          <DisplayLink />

          <Button
            variant="outline"
            className="self-start"
            onClick={async () => setSignOutBlocked(!(await cloud.signOut()))}
          >
            {t("signOut")}
          </Button>
          {signOutBlocked && (
            <p role="alert" className="text-destructive">
              {t("signOutUnsaved")}
            </p>
          )}

          <DeleteAccount email={cloud.email} />
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

          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-[var(--table-blue)]"
            />
            <span>
              {t("acceptPrefix")}
              <a href="legal" target="_blank" rel="noreferrer" className="underline underline-offset-4">
                {t("legalLink")}
              </a>
            </span>
          </label>

          <div className="flex gap-2">
            <Button type="submit" disabled={busy || !complete}>
              {t("signIn")}
            </Button>
            <Button type="button" variant="outline" disabled={busy || !complete || !accepted} onClick={() => submit("up")}>
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
