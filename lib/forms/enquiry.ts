/**
 * Enquiry validation.
 *
 * Shared by the browser (immediate feedback) and the API route (the authority),
 * so a field can never be required in one place and optional in the other.
 * Pure and dependency-free, so it is directly testable.
 */

export const ENQUIRY_TYPES = ['evento', 'personalizadas', 'newsletter'] as const;
export type EnquiryType = (typeof ENQUIRY_TYPES)[number];

export type EnquiryFieldSpec = {
  key: string;
  label: string;
  required: boolean;
  /** Minimum numeric value, e.g. the 10-unit Personalizadas floor. */
  min?: number;
};

export const MAX_FIELD_LENGTH = 2000;

export const ENQUIRY_FIELDS: Record<EnquiryType, EnquiryFieldSpec[]> = {
  evento: [
    { key: 'nome', label: 'Nome', required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'telefone', label: 'Telefone', required: false },
    { key: 'tipoEvento', label: 'Tipo de evento', required: true },
    { key: 'data', label: 'Data', required: false },
    { key: 'pessoas', label: 'Número de pessoas', required: false, min: 1 },
    { key: 'localizacao', label: 'Localização', required: false },
    { key: 'mensagem', label: 'Mensagem', required: true },
  ],
  personalizadas: [
    { key: 'nome', label: 'Nome', required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'telefone', label: 'Telefone', required: false },
    { key: 'ocasiao', label: 'Ocasião', required: true },
    // The handoff: "Any production quantity field must enforce ≥10."
    { key: 'quantidade', label: 'Quantidade', required: true, min: 10 },
    { key: 'data', label: 'Data', required: false },
    { key: 'mensagem', label: 'Mensagem', required: false },
  ],
  newsletter: [{ key: 'email', label: 'Email', required: true }],
};

export function isEnquiryType(value: unknown): value is EnquiryType {
  return typeof value === 'string' && (ENQUIRY_TYPES as readonly string[]).includes(value);
}

export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export type ValidationResult = {
  values: Record<string, string>;
  errors: Record<string, string>;
};

/**
 * Validates and normalises a submission. Trims, caps field length, and reports
 * one message per offending field so the UI can attach it to that input.
 */
export function validateEnquiry(
  type: EnquiryType,
  input: Record<string, unknown>,
): ValidationResult {
  const values: Record<string, string> = {};
  const errors: Record<string, string> = {};

  for (const field of ENQUIRY_FIELDS[type]) {
    const raw = input[field.key];
    const value = typeof raw === 'string' ? raw.trim().slice(0, MAX_FIELD_LENGTH) : '';

    if (!value) {
      if (field.required) errors[field.key] = `${field.label} é obrigatório.`;
      continue;
    }

    if (field.key === 'email' && !looksLikeEmail(value)) {
      errors[field.key] = 'Escreve um email válido.';
      continue;
    }

    if (field.min !== undefined) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) {
        errors[field.key] = `${field.label} tem de ser um número.`;
        continue;
      }
      if (numeric < field.min) {
        errors[field.key] = `O mínimo é ${field.min}.`;
        continue;
      }
    }

    values[field.key] = value;
  }

  return { values, errors };
}

/** True when a hidden honeypot field was filled, i.e. the sender is a bot. */
export function isHoneypotTripped(input: Record<string, unknown>): boolean {
  return typeof input.website === 'string' && input.website.length > 0;
}
