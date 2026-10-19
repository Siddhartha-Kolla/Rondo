"use client"
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LANGS, translate, type Lang } from "@/lib/i18n";
import { legalText } from "@/lib/legal";
import { repository } from "@/lib/repository";

// Terms of use + privacy notice. Opens in its own tab so a half-filled sign-up form is not lost.
export default function LegalPage() {
  const [lang, setLang] = useState<Lang | null>(null);
  useEffect(() => {
    Promise.resolve().then(() => setLang(repository.load().lang));
  }, []);
  if (!lang) return null;

  const text = legalText[lang];
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 text-xs leading-relaxed">
      <header className="flex items-center gap-2">
        <a href="./" className="mr-auto underline underline-offset-4">
          {translate(lang, "backToApp")}
        </a>
        <div role="group" aria-label={translate(lang, "language")} className="flex">
          {LANGS.map((l) => (
            <Button key={l} size="sm" variant={lang === l ? "default" : "outline"} aria-pressed={lang === l} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </Button>
          ))}
        </div>
      </header>

      <div>
        <h1 className="text-sm font-medium">{text.title}</h1>
        <p className="text-muted-foreground">{text.version}</p>
      </div>

      <p role="note" className="border px-3 py-2 text-muted-foreground">
        {text.draftNotice}
      </p>

      <section className="flex flex-col gap-2 border bg-muted p-4" aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="font-medium">
          {text.summaryTitle}
        </h2>
        <ul className="flex list-disc flex-col gap-2 pl-4">
          {text.summary.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      {text.sections.map((section) => (
        <section key={section.heading} className="flex flex-col gap-2">
          <h2 className="font-medium">{section.heading}</h2>
          {section.paragraphs?.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {section.list && (
            <ul className="flex list-disc flex-col gap-2 pl-4">
              {section.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </main>
  );
}
