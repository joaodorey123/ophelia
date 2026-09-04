'use client';

import { useId, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { validateEnquiry, type EnquiryType } from '@/lib/forms/enquiry';
import { SITE } from '@/lib/site';

import styles from './EnquiryForm.module.css';

export type EnquiryField = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'number' | 'textarea' | 'select';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  full?: boolean;
  autoComplete?: string;
  min?: number;
  help?: string;
};

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; message: string }
  | { kind: 'error'; message: string };

/**
 * A real, accessible enquiry form.
 *
 * Validation runs client-side for immediate feedback and again on the server,
 * which is the authority. Errors are announced, tied to their input with
 * `aria-describedby`, and focus moves to the first invalid field. On failure it
 * says what went wrong and gives the visitor a working alternative — it never
 * shows a success message for a submission that did not land.
 */
export function EnquiryForm({
  type,
  fields,
  submitLabel,
  successMessage,
}: {
  type: Extract<EnquiryType, 'evento' | 'personalizadas'>;
  fields: EnquiryField[];
  submitLabel: string;
  successMessage: string;
}) {
  const formId = useId();
  const statusId = useId();
  const formRef = useRef<HTMLFormElement>(null);

  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const values = Object.fromEntries(
      [...data.entries()].map(([key, value]) => [key, typeof value === 'string' ? value : '']),
    ) as Record<string, string>;

    // The same rules the API applies, so the browser can never disagree with
    // the server about what is required.
    const { errors: found } = validateEnquiry(type, values);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      setStatus({ kind: 'error', message: 'Verifica os campos assinalados.' });
      const firstInvalid = Object.keys(found)[0];
      if (firstInvalid) {
        form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      }
      return;
    }

    setStatus({ kind: 'sending' });

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...values }),
      });
      const body = (await response.json()) as { message?: string; errors?: Record<string, string> };

      if (response.ok) {
        setStatus({ kind: 'sent', message: successMessage });
        setErrors({});
        form.reset();
      } else {
        if (body.errors) setErrors(body.errors);
        setStatus({
          kind: 'error',
          message: body.message ?? `Não conseguimos enviar. Escreve-nos para ${SITE.email}.`,
        });
      }
    } catch {
      setStatus({
        kind: 'error',
        message: `Não conseguimos enviar o teu pedido. Escreve-nos para ${SITE.email} ou liga ${SITE.phoneDisplay}.`,
      });
    }
  }

  return (
    <form ref={formRef} className={styles.form} onSubmit={onSubmit} noValidate>
      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor={`${formId}-website`}>Não preencher</label>
        <input id={`${formId}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {fields.map((field) => {
        const inputId = `${formId}-${field.name}`;
        const errorId = `${inputId}-error`;
        const helpId = `${inputId}-help`;
        const error = errors[field.name];
        const describedBy = [error ? errorId : null, field.help ? helpId : null]
          .filter(Boolean)
          .join(' ');

        const shared = {
          id: inputId,
          name: field.name,
          required: field.required,
          'aria-invalid': error ? (true as const) : undefined,
          'aria-describedby': describedBy || undefined,
          className: [
            field.type === 'textarea' ? styles.textarea : field.type === 'select' ? styles.select : styles.input,
            error ? styles.inputError : undefined,
          ]
            .filter(Boolean)
            .join(' '),
          disabled: status.kind === 'sending',
        };

        return (
          <div
            key={field.name}
            className={[styles.field, field.full ? styles.fieldFull : undefined]
              .filter(Boolean)
              .join(' ')}
          >
            <label htmlFor={inputId} className={styles.label}>
              {field.label}
              {field.required ? null : <span className={styles.optional}> (opcional)</span>}
            </label>

            {field.type === 'textarea' ? (
              <textarea {...shared} rows={5} placeholder={field.placeholder} />
            ) : field.type === 'select' ? (
              <select {...shared} defaultValue="">
                <option value="" disabled>
                  Escolhe uma opção
                </option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                {...shared}
                type={field.type}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                min={field.min}
              />
            )}

            {field.help ? (
              <span id={helpId} className={styles.help}>
                {field.help}
              </span>
            ) : null}
            {error ? (
              <span id={errorId} className={styles.error}>
                {error}
              </span>
            ) : null}
          </div>
        );
      })}

      <div className={styles.actions}>
        <Button type="submit" variant="primary" size="lg" disabled={status.kind === 'sending'}>
          {status.kind === 'sending' ? 'A enviar…' : submitLabel}
        </Button>
      </div>

      <p
        id={statusId}
        role="status"
        aria-live="polite"
        className={[
          styles.status,
          status.kind === 'sent' ? styles.statusSuccess : undefined,
          status.kind === 'error' ? styles.statusError : undefined,
        ]
          .filter(Boolean)
          .join(' ')}
        hidden={status.kind === 'idle' || status.kind === 'sending'}
      >
        {status.kind === 'sent' || status.kind === 'error' ? status.message : ''}
      </p>
    </form>
  );
}
