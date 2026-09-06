import { describe, expect, it } from 'vitest';

import {
  ENQUIRY_FIELDS,
  isEnquiryType,
  isHoneypotTripped,
  looksLikeEmail,
  MAX_FIELD_LENGTH,
  validateEnquiry,
} from '@/lib/forms/enquiry';

describe('isEnquiryType', () => {
  it('accepts the two real form types', () => {
    expect(isEnquiryType('contacto')).toBe(true);
    expect(isEnquiryType('newsletter')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isEnquiryType('evento')).toBe(false);
    expect(isEnquiryType(undefined)).toBe(false);
    expect(isEnquiryType(42)).toBe(false);
  });
});

describe('looksLikeEmail', () => {
  it.each(['a@b.pt', 'joao.dorey+ophelia@example.com'])('accepts %s', (value) => {
    expect(looksLikeEmail(value)).toBe(true);
  });

  it.each(['', 'a@b', 'no-at-sign.pt', 'a b@c.pt', '@b.pt'])('rejects %s', (value) => {
    expect(looksLikeEmail(value)).toBe(false);
  });
});

describe('validateEnquiry — contacto', () => {
  const valid = {
    nome: 'Maria',
    email: 'maria@example.com',
    assunto: 'Encomenda de bolos',
    mensagem: 'Um bolo para sábado, por favor.',
  };

  it('accepts a complete submission', () => {
    const { errors, values } = validateEnquiry('contacto', valid);
    expect(errors).toEqual({});
    expect(values.nome).toBe('Maria');
  });

  it('reports every missing required field at once', () => {
    const { errors } = validateEnquiry('contacto', {});
    expect(Object.keys(errors).sort()).toEqual(['assunto', 'email', 'mensagem', 'nome']);
  });

  it('rejects an address that is not an email', () => {
    const { errors } = validateEnquiry('contacto', { ...valid, email: 'maria arroba example' });
    expect(errors.email).toBeDefined();
  });

  it('trims whitespace rather than treating it as content', () => {
    const { errors, values } = validateEnquiry('contacto', { ...valid, nome: '   ' });
    expect(errors.nome).toBeDefined();
    expect(values.email).toBe('maria@example.com');
  });

  it('caps a field at the maximum length instead of rejecting it', () => {
    const { values } = validateEnquiry('contacto', {
      ...valid,
      mensagem: 'a'.repeat(MAX_FIELD_LENGTH + 500),
    });
    expect(values.mensagem?.length).toBe(MAX_FIELD_LENGTH);
  });
});

describe('validateEnquiry — newsletter', () => {
  it('needs only an email', () => {
    expect(validateEnquiry('newsletter', { email: 'a@b.pt' }).errors).toEqual({});
    expect(validateEnquiry('newsletter', {}).errors.email).toBeDefined();
  });
});

describe('honeypot', () => {
  it('trips when the hidden field is filled', () => {
    expect(isHoneypotTripped({ website: 'http://spam' })).toBe(true);
  });

  it('does not trip for a real submission', () => {
    expect(isHoneypotTripped({ website: '' })).toBe(false);
    expect(isHoneypotTripped({})).toBe(false);
  });
});

describe('field specs', () => {
  it('keeps every field key unique per form', () => {
    for (const [type, fields] of Object.entries(ENQUIRY_FIELDS)) {
      const keys = fields.map((f) => f.key);
      expect(new Set(keys).size, `${type} has duplicate keys`).toBe(keys.length);
    }
  });
});
