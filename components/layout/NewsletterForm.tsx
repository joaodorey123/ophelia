"use client";

import { useId, useState } from "react";

import { site } from "@/lib/content";
import { SITE } from "@/lib/site";

import styles from "./Footer.module.css";

type Status =
  { kind: "idle" | "sending" } | { kind: "sent" | "error"; message: string };

/**
 * Newsletter sign-up.
 *
 * Posts to /api/enquiry. When no delivery endpoint is configured the API
 * answers 503 and this form says so plainly — it never shows a success
 * message for a subscription that was not recorded anywhere.
 */
export function NewsletterForm() {
  const emailId = useId();
  const statusId = useId();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get("email");
    if (typeof email !== "string" || !email.includes("@")) {
      setStatus({ kind: "error", message: "Escreve um email válido." });
      return;
    }

    setStatus({ kind: "sending" });
    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "newsletter", email }),
      });
      const body = (await response.json()) as { message?: string };
      if (response.ok) {
        setStatus({
          kind: "sent",
          message: "Obrigada. Recebemos o teu email.",
        });
        form.reset();
      } else {
        setStatus({
          kind: "error",
          message:
            body.message ??
            `Não foi possível subscrever. Escreve-nos para ${SITE.email}.`,
        });
      }
    } catch {
      setStatus({
        kind: "error",
        message: `Não foi possível subscrever. Escreve-nos para ${SITE.email}.`,
      });
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className={styles.form}>
        <label htmlFor={emailId} className="oph-sr-only">
          O teu email
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={site.newsletter.placeholder}
          className={styles.input}
          aria-describedby={statusId}
          disabled={status.kind === "sending"}
        />
        <button
          type="submit"
          className={styles.submit}
          disabled={status.kind === "sending"}
        >
          {status.kind === "sending" ? "a enviar…" : site.newsletter.cta}
        </button>
      </div>
      <p
        id={statusId}
        role="status"
        aria-live="polite"
        className={[
          styles.status,
          status.kind === "error" ? styles.statusError : undefined,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {status.kind === "sent" || status.kind === "error"
          ? status.message
          : ""}
      </p>
    </form>
  );
}
