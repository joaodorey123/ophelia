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
  it('accepts the three real form types', () => {
    expect(isEnquiryType('evento')).toBe(true);
    expect(isEnquiryType('personalizadas')).toBe(true);
    expect(isEnquiryType('newsletter')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isEnquiryType('encomenda')).toBe(false);
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

describe('validateEnquiry — evento', () => {
  const valid = {
    nome: 'Maria',
    email: 'maria@example.com',
    tipoEvento: 'Casamento',
    mensagem: 'Casamento em maio.',
  };

  it('accepts a complete submission', () => {
    const { errors, values } = validateEnquiry('evento', valid);
    expect(errors).toEqual({});
    expect(values.nome).toBe('Maria');
  });

  it('reports every missing required field at once', () => {
    const { errors } = validateEnquiry('evento', {});
    expect(Object.keys(errors).sort()).toEqual(['email', 'mensagem', 'nome', 'tipoEvento']);
  });

  it('rejects an invalid email', () => {
    const { errors } = validateEnquiry('evento', { ...valid, email: 'nope' });
    expect(errors.email).toBe('Escreve um email válido.');
  });

  it('treats whitespace as empty', () => {
    const { errors } = validateEnquiry('evento', { ...valid, nome: '   ' });
    expect(errors.nome).toBeDefined();
  });

  it('trims values it keeps', () => {
    const { values } = validateEnquiry('evento', { ...valid, nome: '  Maria  ' });
    expect(values.nome).toBe('Maria');
  });

  it('omits optional fields that were left blank', () => {
    const { values } = validateEnquiry('evento', valid);
    expect(values.telefone).toBeUndefined();
    expect(values.localizacao).toBeUndefined();
  });

  it('caps an over-long field instead of rejecting it', () => {
    const { values, errors } = validateEnquiry('evento', {
      ...valid,
      mensagem: 'a'.repeat(MAX_FIELD_LENGTH + 500),
    });
    expect(errors).toEqual({});
    expect(values.mensagem).toHaveLength(MAX_FIELD_LENGTH);
  });

  it('ignores fields that are not part of the form', () => {
    const { values } = validateEnquiry('evento', { ...valid, desconto: '100%' });
    expect(values.desconto).toBeUndefined();
  });

  it('ignores a non-string value', () => {
    const { errors } = validateEnquiry('evento', { ...valid, nome: { evil: true } });
    expect(errors.nome).toBeDefined();
  });
});

describe('validateEnquiry — personalizadas', () => {
  const valid = {
    nome: 'João',
    email: 'joao@example.com',
    ocasiao: 'Casamento',
    quantidade: '25',
  };

  it('accepts a quantity at or above the 10-unit minimum', () => {
    expect(validateEnquiry('personalizadas', valid).errors).toEqual({});
    expect(validateEnquiry('personalizadas', { ...valid, quantidade: '10' }).errors).toEqual({});
  });

  it('enforces the 10-unit minimum the handoff requires', () => {
    const { errors } = validateEnquiry('personalizadas', { ...valid, quantidade: '4' });
    expect(errors.quantidade).toBe('O mínimo é 10.');
  });

  it('rejects a non-numeric quantity', () => {
    const { errors } = validateEnquiry('personalizadas', { ...valid, quantidade: 'muitas' });
    expect(errors.quantidade).toBe('Quantidade tem de ser um número.');
  });

  it('requires a quantity at all', () => {
    const { errors } = validateEnquiry('personalizadas', { ...valid, quantidade: '' });
    expect(errors.quantidade).toBe('Quantidade é obrigatório.');
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
