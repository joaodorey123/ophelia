'use client';

import { useId, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { ENQUIRY_FIELDS, validateEnquiry } from '@/lib/forms/enquiry';
import { SITE } from '@/lib/site';

import styles from './EnquiryForm.module.css';

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'error'; message: string };

/**
 * The contact form.
 *
 * Validation is the same module the API route runs, so the browser can never
 * accept something the server rejects. On success the panel replaces the form
 * in place; on failure it says what went wrong. It never shows "obrigada!" for
 * a message that was not delivered — when no endpoint is configured the API
 * answers 503 and this says so.
 */
export function EnquiryForm({
  subjects,
  success,
  defaultSubject,
}: {
  subjects: string[];
  success: { title: string; body: string; reset: string };
  defaultSubject?: string;
}) {
  const ids = useId();
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = Object.fromEntries(
      ENQUIRY_FIELDS.contacto.map((field) => [field.key, String(data.get(field.key) ?? '')]),
    );

    const result = validateEnquiry('contacto', payload);
    if (Object.keys(result.errors).length > 0) {
      setErrors(result.errors);
      setStatus({ kind: 'idle' });
      const firstKey = Object.keys(result.errors)[0];
      if (firstKey) form.querySelector<HTMLElement>(`[name="${firstKey}"]`)?.focus();
      return;
    }

    setErrors({});
    setStatus({ kind: 'sending' });

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contacto',
          ...result.values,
          // Honeypot: a real person never fills this in.
          website: String(data.get('website') ?? ''),
        }),
      });

      if (response.ok) {
        setStatus({ kind: 'sent' });
        form.reset();
        return;
      }

      const body = (await response.json().catch(() => ({}))) as { message?: string };
      setStatus({
        kind: 'error',
        message:
          body.message ?? `Não foi possível enviar. Escreve-nos para ${SITE.email}.`,
      });
    } catch {
      setStatus({
        kind: 'error',
        message: `Não foi possível enviar. Verifica a ligação ou escreve-nos para ${SITE.email}.`,
      });
    }
  }

  if (status.kind === 'sent') {
    return (
      <div className={styles.success} role="status">
        <p className={styles.successTitle}>{success.title}</p>
        <p className={styles.successBody}>{success.body}</p>
        <button type="button" className={styles.reset} onClick={() => setStatus({ kind: 'idle' })}>
          {success.reset}
        </button>
      </div>
    );
  }

  const sending = status.kind === 'sending';

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${ids}-nome`}>
          nome
        </label>
        <input
          id={`${ids}-nome`}
          name="nome"
          className={`${styles.input} ${errors.nome ? styles.invalid : ''}`}
          autoComplete="name"
          aria-invalid={Boolean(errors.nome)}
          aria-describedby={errors.nome ? `${ids}-nome-error` : undefined}
          disabled={sending}
        />
        {errors.nome ? (
          <span id={`${ids}-nome-error`} className={styles.fieldError}>
            {errors.nome}
          </span>
        ) : null}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${ids}-email`}>
          email
        </label>
        <input
          id={`${ids}-email`}
          name="email"
          type="email"
          className={`${styles.input} ${errors.email ? styles.invalid : ''}`}
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${ids}-email-error` : undefined}
          disabled={sending}
        />
        {errors.email ? (
          <span id={`${ids}-email-error`} className={styles.fieldError}>
            {errors.email}
          </span>
        ) : null}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${ids}-assunto`}>
          assunto
        </label>
        <select
          id={`${ids}-assunto`}
          name="assunto"
          className={styles.select}
          defaultValue={defaultSubject ?? subjects[0]}
          disabled={sending}
        >
          {subjects.map((subject) => (
            <option key={subject}>{subject}</option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${ids}-mensagem`}>
          mensagem
        </label>
        <textarea
          id={`${ids}-mensagem`}
          name="mensagem"
          rows={5}
          className={`${styles.textarea} ${errors.mensagem ? styles.invalid : ''}`}
          aria-invalid={Boolean(errors.mensagem)}
          aria-describedby={errors.mensagem ? `${ids}-mensagem-error` : undefined}
          disabled={sending}
        />
        {errors.mensagem ? (
          <span id={`${ids}-mensagem-error`} className={styles.fieldError}>
            {errors.mensagem}
          </span>
        ) : null}
      </div>

      <div className={styles.honeypot} aria-hidden>
        <label htmlFor={`${ids}-website`}>Não preencher</label>
        <input id={`${ids}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <Button type="submit" variant="primary" className={styles.submit} disabled={sending}>
        {sending ? 'a enviar…' : 'enviar mensagem'}
      </Button>

      {/* A failure interrupts: it is an alert, not a polite status update. */}
      <p
        role={status.kind === 'error' ? 'alert' : 'status'}
        aria-live={status.kind === 'error' ? 'assertive' : 'polite'}
        className={`${styles.status} ${status.kind === 'error' ? styles.statusError : ''}`}
      >
        {status.kind === 'error' ? status.message : ''}
      </p>
    </form>
  );
}
