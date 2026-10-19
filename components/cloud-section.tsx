"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/store";

// Link a display screen can open without logging in (relative to wherever the app is hosted)
export const displayUrl = (shareId: string) => new URL(`display?t=${shareId}`, window.location.href).toString();

export function CloudSection() {
  const { cloud, t } = useApp();
  const [address, setAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  if (!cloud.available) return null;

  const status = cloud.phase === "saving" ? t("saving") : cloud.phase === "error" ? t("saveFailed") : cloud.phase === "saved" ? t("saved") : "";

  return (
    <section className="flex flex-col gap-2 border-t pt-4" aria-labelledby="cloud-heading">
      <h2 id="cloud-heading" className="font-medium">
        {t("cloud")}
      </h2>

      {cloud.email ? (
        <>
          <p className="[overflow-wrap:anywhere]">{t("signedInAs", { email: cloud.email })}</p>
          {status && (
            <p role="status" className={cloud.phase === "error" ? "text-destructive" : "text-muted-foreground"}>
              {status}
            </p>
          )}

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
          className="flex flex-col gap-1"
          onSubmit={async (e) => {
            e.preventDefault();
            setFailed(await cloud.signIn(address.trim()));
          }}
        >
          <p className="text-muted-foreground">{t("cloudHint")}</p>
          <Label htmlFor="cloud-email">{t("email")}</Label>
          <div className="flex gap-2">
            <Input
              id="cloud-email"
              type="email"
              autoComplete="email"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <Button type="submit" disabled={!address.trim()}>
              {t("sendLink")}
            </Button>
          </div>
          {cloud.linkSent && <p role="status">{t("linkSent")}</p>}
          {failed && (
            <p role="alert" className="text-destructive [overflow-wrap:anywhere]">
              {t("signInFailed")}: {failed}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
