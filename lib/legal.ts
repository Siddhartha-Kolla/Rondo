import type { Lang } from "./i18n";

// Bump this whenever the text changes in a way users must accept again.
// It is stored with each new account as proof of what was accepted, and when.
export const TERMS_VERSION = "2026-10-19";

export type Block = { heading: string; paragraphs?: string[]; list?: string[] };
export type LegalText = {
  title: string;
  version: string;
  draftNotice: string;
  summaryTitle: string;
  summary: string[];
  sections: Block[];
};

const en: LegalText = {
  title: "Terms of Use and Privacy Notice",
  version: `Version ${TERMS_VERSION}`,
  draftNotice:
    "DRAFT: replace every [placeholder in brackets] with your real details and have the text reviewed by a qualified person before you publish it. It is a starting point, not legal advice.",
  summaryTitle: "Why you are reading this: the short version",
  summary: [
    "Sternchenturnier is a small tool to organise table tennis tournaments: it pairs players, records winners and shows rankings.",
    "You can use it without an account, and then everything stays in your own browser. To keep tournaments online, open them on other devices, and show live rankings on a screen, you need an account. Accounts and the online storage are provided by Supabase, a hosting and database service, so your data is stored on their servers and not only on your device.",
    "What we store about you: your email address and a protected form of your password (we can never read the password). What you enter: tournament names, player names and results.",
    "Your email address is visible to the operator of this service and to Supabase as the hosting provider. It is never shown to other users or to the public. Player names and results can be seen by you, and by anyone you give a display link to.",
    "You can delete tournaments, switch display links off, download a backup, or delete your whole account at any time inside the app.",
    "By creating an account you confirm that you have read and accept the Terms of Use and this Privacy Notice below.",
  ],
  sections: [
    {
      heading: "1. Who is responsible",
      paragraphs: [
        "The service is operated by [your full name or organisation], [street and number], [postcode and city], [country]. Contact for all questions about this service and your data: [email address].",
        "This person or organisation is the controller for the personal data described here (Art. 4(7) GDPR).",
      ],
    },
    {
      heading: "2. What data we process, and why",
      paragraphs: ["We process only the data that is needed to run the service."],
      list: [
        "Account data: your email address, a password hash (never the password itself), the time of registration and last login, your IP address and browser information in security logs kept by Supabase, and a record of when you accepted these terms and which version. Purpose: creating and securing your account. Legal basis: performing the contract you enter by registering (Art. 6(1)(b) GDPR) and our legitimate interest in security and abuse prevention (Art. 6(1)(f) GDPR).",
        "Tournament data: tournament names, player names, whether a player is active, rounds, pairings, winners, number of tables and the interface language. Purpose: providing the tournament functions, saving them online and showing them on display screens. Legal basis: Art. 6(1)(b) GDPR for you as organiser.",
        "Data in your browser: your login session, a working copy of the open tournament, which tournament was open, and your language. This is stored in the browser's local storage and is strictly necessary for the service you asked for. We use no advertising, no tracking and no analytics, so no consent banner is needed for it.",
        "Hosting data: the website itself is delivered by [hosting provider, for example GitHub Pages], which may log technical connection data such as your IP address when you load a page. We have no access to or control over these logs beyond the provider's own settings.",
      ],
    },
    {
      heading: "3. Player names are personal data of other people",
      paragraphs: [
        "If you enter the names of other people, you decide which data is processed about them and for what purpose, and you are responsible for having a valid reason to do so (for example, organising a sports event for your club or group) and for informing those people. Use first names or nicknames wherever possible and do not enter data about children without the consent of a parent or guardian.",
        "We process this data on your behalf as the hosting service. Players can ask you, and us, to correct or delete their name.",
      ],
    },
    {
      heading: "4. Who can see what",
      list: [
        "Your password: nobody. It is stored only as a one-way hash.",
        "Your email address: the operator and Supabase as hosting provider. Not other users, not the public, not anyone who has a display link.",
        "Tournaments, player names and results: you while you are logged in, and anyone who has the display link of that tournament (read only). A display link is a long, random address. It is unlisted but not secret: anyone you give it to can pass it on. You can create a new link, which makes the old one stop working, or switch the link off at any time.",
        "Other organisers' tournaments are not visible to you and yours are not visible to them. This is enforced in the database, not only in the app.",
      ],
    },
    {
      heading: "5. Service providers and transfers",
      paragraphs: [
        "Accounts, the database and live updates are provided by Supabase. We have a data processing agreement with Supabase under Art. 28 GDPR. Our project is hosted in the region [EU region, for example Frankfurt (eu-central-1)]. Supabase and its sub-processors may process data outside the EU or EEA; where this happens it is covered by appropriate safeguards such as the EU Standard Contractual Clauses or the EU-US Data Privacy Framework.",
        "The website files are hosted by [hosting provider]. We do not sell your data and do not pass it on for advertising.",
      ],
    },
    {
      heading: "6. How long we keep data",
      list: [
        "Account data: until you delete your account.",
        "Tournaments: until you delete them or your account. Deleting an account deletes all of its tournaments.",
        "Security logs at Supabase: for the period set by Supabase, normally a few weeks.",
        "Data in your browser: until you sign out (the working copy is then removed) or clear your browser data.",
        "Inactive accounts may be deleted after [12] months without login, after a notice to the email address on file.",
      ],
    },
    {
      heading: "7. Your rights",
      paragraphs: [
        "Under the GDPR you have the right to access, rectification, erasure, restriction of processing, data portability and to object to processing based on legitimate interests. You may also withdraw consent you have given, with effect for the future, and lodge a complaint with a data protection supervisory authority, for example the one in your country of residence.",
        "Most of this you can do yourself in the app: delete a tournament, delete your account, download a backup file of a tournament (this also serves as a portable copy). For everything else, write to [email address]. We will answer within one month.",
      ],
    },
    {
      heading: "8. Security",
      paragraphs: [
        "Connections are encrypted (HTTPS). Passwords are hashed. The database allows each organiser access only to their own rows, and the public key in the website cannot read tables. Login attempts are rate limited. No system is perfectly secure; if a breach puts your rights at risk we will notify you and the competent authority as required by law.",
      ],
    },
    {
      heading: "9. Terms of use",
      list: [
        "The service is free, offered for organising sports events, and provided \"as is\". You must be at least 16 years old to create an account, or have the consent of a parent or guardian.",
        "Give a correct email address, keep your password secret, and tell us if you suspect misuse of your account. You are responsible for what happens under your account.",
        "Only enter data you are allowed to enter. Do not enter unlawful, offensive or false content, do not try to access other people's data, and do not use automated tools to overload or probe the service.",
        "You keep all rights to your content. You allow us to store and display it only as needed to run the service for you.",
        "We aim for good availability but do not promise uninterrupted operation. Download backups of tournaments you cannot afford to lose.",
        "We may change, suspend or end the service, and may block accounts that break these terms. We will give reasonable notice where possible.",
        "Liability: we are fully liable for intent, gross negligence, injury to life, body or health, and where mandatory law requires it. For slight negligence we are liable only for the breach of an essential contractual duty and only for typical, foreseeable damage. Otherwise liability is excluded as far as the law allows.",
        "German law applies, without limiting mandatory consumer protection rules of your country of residence. If any part of these terms is invalid, the rest stays in force.",
      ],
    },
    {
      heading: "10. Changes",
      paragraphs: [
        "If we change these terms in a material way we will show the new version in the app and ask you to accept it again. The version you accepted is stored with your account.",
      ],
    },
  ],
};

const de: LegalText = {
  title: "Nutzungsbedingungen und Datenschutzhinweis",
  version: `Fassung ${TERMS_VERSION}`,
  draftNotice:
    "ENTWURF: Ersetze alle [Platzhalter in eckigen Klammern] durch deine echten Angaben und lass den Text vor der Veröffentlichung von einer fachkundigen Person prüfen. Er ist eine Arbeitsgrundlage und keine Rechtsberatung.",
  summaryTitle: "Warum du das liest: die Kurzfassung",
  summary: [
    "Sternchenturnier ist ein kleines Werkzeug zur Organisation von Tischtennisturnieren: Es bildet Paarungen, erfasst Sieger und zeigt Ranglisten.",
    "Du kannst es ohne Konto nutzen, dann bleibt alles in deinem eigenen Browser. Um Turniere online zu speichern, auf anderen Geräten zu öffnen und Ranglisten live auf einem Bildschirm zu zeigen, brauchst du ein Konto. Konten und der Online-Speicher werden von Supabase bereitgestellt, einem Hosting- und Datenbankdienst. Deine Daten liegen daher auf deren Servern und nicht nur auf deinem Gerät.",
    "Was wir über dich speichern: deine E-Mail-Adresse und eine geschützte Form deines Passworts (das Passwort selbst können wir nie lesen). Was du eingibst: Turniernamen, Spielernamen und Ergebnisse.",
    "Deine E-Mail-Adresse sehen der Betreiber dieses Dienstes und Supabase als Hosting-Anbieter. Sie wird nie anderen Nutzern oder der Öffentlichkeit angezeigt. Spielernamen und Ergebnisse siehst du, und jeder, dem du einen Anzeige-Link gibst.",
    "Du kannst jederzeit in der App Turniere löschen, Anzeige-Links abschalten, eine Sicherung herunterladen oder dein ganzes Konto löschen.",
    "Mit dem Erstellen eines Kontos bestätigst du, dass du die folgenden Nutzungsbedingungen und diesen Datenschutzhinweis gelesen hast und akzeptierst.",
  ],
  sections: [
    {
      heading: "1. Wer verantwortlich ist",
      paragraphs: [
        "Betreiber des Dienstes ist [vollständiger Name oder Organisation], [Straße und Hausnummer], [PLZ und Ort], [Land]. Kontakt für alle Fragen zu diesem Dienst und zu deinen Daten: [E-Mail-Adresse].",
        "Diese Person bzw. Organisation ist Verantwortlicher für die hier beschriebenen personenbezogenen Daten (Art. 4 Nr. 7 DSGVO).",
      ],
    },
    {
      heading: "2. Welche Daten wir verarbeiten und wozu",
      paragraphs: ["Wir verarbeiten nur die Daten, die für den Betrieb des Dienstes nötig sind."],
      list: [
        "Kontodaten: deine E-Mail-Adresse, ein Passwort-Hash (nie das Passwort selbst), Zeitpunkt der Registrierung und der letzten Anmeldung, deine IP-Adresse und Browserangaben in Sicherheitsprotokollen von Supabase sowie ein Nachweis, wann du diese Bedingungen in welcher Fassung akzeptiert hast. Zweck: Einrichtung und Absicherung deines Kontos. Rechtsgrundlage: Erfüllung des mit der Registrierung geschlossenen Vertrags (Art. 6 Abs. 1 lit. b DSGVO) und unser berechtigtes Interesse an Sicherheit und Missbrauchsabwehr (Art. 6 Abs. 1 lit. f DSGVO).",
        "Turnierdaten: Turniernamen, Spielernamen, ob ein Spieler aktiv ist, Runden, Paarungen, Sieger, Tischanzahl und Oberflächensprache. Zweck: Bereitstellung der Turnierfunktionen, Online-Speicherung und Anzeige auf Bildschirmen. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO gegenüber dir als Organisator.",
        "Daten in deinem Browser: deine Anmeldesitzung, eine Arbeitskopie des geöffneten Turniers, welches Turnier geöffnet war, und deine Sprache. Sie liegen im lokalen Speicher des Browsers und sind für den gewünschten Dienst unbedingt erforderlich. Wir setzen keine Werbung, kein Tracking und keine Analyse ein, daher ist hierfür kein Einwilligungsbanner nötig.",
        "Hosting-Daten: Die Website selbst wird von [Hosting-Anbieter, z. B. GitHub Pages] ausgeliefert, der beim Aufruf technische Verbindungsdaten wie deine IP-Adresse protokollieren kann. Auf diese Protokolle haben wir über die Einstellungen des Anbieters hinaus keinen Zugriff.",
      ],
    },
    {
      heading: "3. Spielernamen sind personenbezogene Daten anderer Personen",
      paragraphs: [
        "Wenn du Namen anderer Personen eingibst, entscheidest du, welche Daten über sie zu welchem Zweck verarbeitet werden. Du bist dafür verantwortlich, dass du einen berechtigten Grund hast (z. B. die Organisation einer Sportveranstaltung für deinen Verein oder deine Gruppe) und dass diese Personen informiert sind. Verwende nach Möglichkeit Vornamen oder Spitznamen und gib keine Daten von Kindern ohne Zustimmung der Eltern bzw. Sorgeberechtigten ein.",
        "Wir verarbeiten diese Daten in deinem Auftrag als Hosting-Dienst. Spieler können sich an dich und an uns wenden, um ihren Namen korrigieren oder löschen zu lassen.",
      ],
    },
    {
      heading: "4. Wer was sehen kann",
      list: [
        "Dein Passwort: niemand. Es wird nur als Einweg-Hash gespeichert.",
        "Deine E-Mail-Adresse: der Betreiber und Supabase als Hosting-Anbieter. Nicht andere Nutzer, nicht die Öffentlichkeit, nicht jemand mit einem Anzeige-Link.",
        "Turniere, Spielernamen und Ergebnisse: du, solange du angemeldet bist, und jeder, der den Anzeige-Link dieses Turniers hat (nur lesend). Ein Anzeige-Link ist eine lange, zufällige Adresse. Er ist nicht gelistet, aber nicht geheim: Wer ihn bekommt, kann ihn weitergeben. Du kannst jederzeit einen neuen Link erzeugen, wodurch der alte nicht mehr funktioniert, oder den Link abschalten.",
        "Turniere anderer Organisatoren sind für dich nicht sichtbar, und deine für sie nicht. Das wird in der Datenbank erzwungen, nicht nur in der App.",
      ],
    },
    {
      heading: "5. Dienstleister und Datenübermittlung",
      paragraphs: [
        "Konten, Datenbank und Live-Aktualisierung stellt Supabase bereit. Mit Supabase besteht ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO. Unser Projekt wird in der Region [EU-Region, z. B. Frankfurt (eu-central-1)] betrieben. Supabase und dessen Unterauftragsverarbeiter können Daten auch außerhalb der EU bzw. des EWR verarbeiten; dies ist durch geeignete Garantien wie die EU-Standardvertragsklauseln oder das EU-US Data Privacy Framework abgesichert.",
        "Die Dateien der Website hostet [Hosting-Anbieter]. Wir verkaufen deine Daten nicht und geben sie nicht für Werbung weiter.",
      ],
    },
    {
      heading: "6. Wie lange wir Daten speichern",
      list: [
        "Kontodaten: bis du dein Konto löschst.",
        "Turniere: bis du sie oder dein Konto löschst. Beim Löschen eines Kontos werden alle zugehörigen Turniere gelöscht.",
        "Sicherheitsprotokolle bei Supabase: für den von Supabase festgelegten Zeitraum, in der Regel einige Wochen.",
        "Daten in deinem Browser: bis du dich abmeldest (die Arbeitskopie wird dann entfernt) oder deine Browserdaten löschst.",
        "Inaktive Konten können nach [12] Monaten ohne Anmeldung gelöscht werden, nach vorheriger Benachrichtigung an die hinterlegte E-Mail-Adresse.",
      ],
    },
    {
      heading: "7. Deine Rechte",
      paragraphs: [
        "Nach der DSGVO hast du das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie das Recht, der Verarbeitung auf Grundlage berechtigter Interessen zu widersprechen. Eine erteilte Einwilligung kannst du mit Wirkung für die Zukunft widerrufen. Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren, etwa der an deinem Wohnort.",
        "Vieles davon kannst du selbst in der App erledigen: ein Turnier löschen, dein Konto löschen, eine Sicherungsdatei eines Turniers herunterladen (sie dient auch als übertragbare Kopie). Für alles andere schreibe an [E-Mail-Adresse]. Wir antworten innerhalb eines Monats.",
      ],
    },
    {
      heading: "8. Sicherheit",
      paragraphs: [
        "Verbindungen sind verschlüsselt (HTTPS). Passwörter werden als Hash gespeichert. Die Datenbank lässt jeden Organisator nur auf die eigenen Datensätze zugreifen, und der öffentliche Schlüssel in der Website kann keine Tabellen lesen. Anmeldeversuche sind mengenbegrenzt. Kein System ist vollkommen sicher; falls eine Datenpanne deine Rechte gefährdet, informieren wir dich und die zuständige Behörde, wie es das Gesetz verlangt.",
      ],
    },
    {
      heading: "9. Nutzungsbedingungen",
      list: [
        "Der Dienst ist kostenlos, dient der Organisation von Sportveranstaltungen und wird \"wie besehen\" bereitgestellt. Du musst mindestens 16 Jahre alt sein, um ein Konto zu erstellen, oder die Zustimmung deiner Eltern bzw. Sorgeberechtigten haben.",
        "Gib eine korrekte E-Mail-Adresse an, halte dein Passwort geheim und melde uns, wenn du einen Missbrauch deines Kontos vermutest. Du bist für alles verantwortlich, was unter deinem Konto geschieht.",
        "Gib nur Daten ein, die du eingeben darfst. Keine rechtswidrigen, beleidigenden oder falschen Inhalte, keine Versuche, auf fremde Daten zuzugreifen, und keine automatisierten Werkzeuge, die den Dienst überlasten oder ausforschen.",
        "Alle Rechte an deinen Inhalten bleiben bei dir. Du erlaubst uns, sie nur so weit zu speichern und anzuzeigen, wie es für den Betrieb des Dienstes für dich nötig ist.",
        "Wir bemühen uns um gute Verfügbarkeit, versprechen aber keinen unterbrechungsfreien Betrieb. Lade Sicherungen von Turnieren herunter, die du nicht verlieren darfst.",
        "Wir dürfen den Dienst ändern, aussetzen oder beenden und Konten sperren, die gegen diese Bedingungen verstoßen. Wo möglich kündigen wir das mit angemessener Frist an.",
        "Haftung: Wir haften unbeschränkt bei Vorsatz, grober Fahrlässigkeit, bei Verletzung von Leben, Körper oder Gesundheit und soweit zwingendes Recht es verlangt. Bei leichter Fahrlässigkeit haften wir nur für die Verletzung wesentlicher Vertragspflichten und nur für den typischen, vorhersehbaren Schaden. Im Übrigen ist die Haftung ausgeschlossen, soweit das Gesetz es erlaubt.",
        "Es gilt deutsches Recht, ohne zwingende Verbraucherschutzvorschriften deines Wohnsitzstaates einzuschränken. Sollte ein Teil dieser Bedingungen unwirksam sein, bleibt der Rest wirksam.",
      ],
    },
    {
      heading: "10. Änderungen",
      paragraphs: [
        "Wenn wir diese Bedingungen wesentlich ändern, zeigen wir die neue Fassung in der App an und bitten dich, sie erneut zu akzeptieren. Die von dir akzeptierte Fassung wird bei deinem Konto gespeichert.",
      ],
    },
  ],
};

export const legalText: Record<Lang, LegalText> = { en, de };
