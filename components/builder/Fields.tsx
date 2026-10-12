'use client';

import { createContext, useCallback, useContext, useId, useMemo, useRef, useState } from 'react';

import { CONTRAST_PAIRS, checkContrast } from '@/lib/builder/contrast';
import { getPath, setPath } from '@/lib/builder/paths';
import type { Field } from '@/lib/builder/schema';

import styles from './editor.module.css';
import { useShopOptions } from './ShopOptions';

/* ── Staging for photographs ─────────────────────────────────────────────
 * An uploaded photograph is held here until the edit is published, so an
 * abandoned change leaves nothing behind in the repository.
 */

export type StagedImage = { path: string; base64: string; previewUrl: string };

type StagingValue = {
  staged: Record<string, StagedImage>;
  stage: (src: string, image: StagedImage) => void;
  storefrontUrl: string | null;
};

const StagingContext = createContext<StagingValue>({
  staged: {},
  stage: () => {},
  storefrontUrl: null,
});

export function StagingProvider({
  value,
  children,
}: {
  value: StagingValue;
  children: React.ReactNode;
}) {
  return <StagingContext.Provider value={value}>{children}</StagingContext.Provider>;
}

/* ── Dispatcher ─────────────────────────────────────────────────────────── */

export function FieldControl({
  field,
  document,
  onChange,
}: {
  field: Field;
  /** The object this field's path is relative to. */
  document: unknown;
  onChange: (next: unknown) => void;
}) {
  const value = field.path ? getPath(document, field.path) : document;

  const set = useCallback(
    (next: unknown) => {
      onChange(field.path ? setPath(document, field.path, next) : next);
    },
    [document, field.path, onChange],
  );

  switch (field.kind) {
    case 'text':
      return <TextField field={field} value={asString(value)} onChange={set} />;
    case 'textarea':
      return <TextareaField field={field} value={asString(value)} onChange={set} />;
    case 'strings':
      return <StringsField field={field} value={asStringArray(value)} onChange={set} />;
    case 'image':
      return <ImageField field={field} value={asString(value)} onChange={set} />;
    case 'number':
      return <NumberField field={field} value={value} onChange={set} />;
    case 'toggle':
      return <ToggleField field={field} value={Boolean(value)} onChange={set} />;
    case 'color':
      return (
        <ColorField field={field} value={asString(value)} document={document} onChange={set} />
      );
    case 'scale':
      return <ScaleField field={field} value={value} onChange={set} />;
    case 'product':
      return <PickerField field={field} kind="product" value={asString(value)} onChange={set} />;
    case 'collection':
      return <PickerField field={field} kind="collection" value={asString(value)} onChange={set} />;
    case 'list':
      return <ListField field={field} value={asArray(value)} onChange={set} />;
    default:
      return null;
  }
}

function asString(value: unknown): string {
  return typeof value === 'string'
    ? value
    : value === null || value === undefined
      ? ''
      : String(value);
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(asString) : [];
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/* ── Shared chrome ──────────────────────────────────────────────────────── */

function Label({ id, field }: { id: string; field: Field }) {
  return (
    <>
      <label className={styles.label} htmlFor={id}>
        {field.label}
      </label>
      {field.help ? <span className={styles.help}>{field.help}</span> : null}
    </>
  );
}

function Counter({ value, max }: { value: string; max?: number }) {
  if (!max) return null;
  const over = value.length > max;
  return (
    <span className={`${styles.counter} ${over ? styles.counterOver : ''}`}>
      {value.length} de {max} caracteres{over ? ' — está a ficar longo para o espaço' : ''}
    </span>
  );
}

/* ── Simple inputs ──────────────────────────────────────────────────────── */

function TextField({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { kind: 'text' }>;
  value: string;
  onChange: (next: string) => void;
}) {
  const id = useId();
  return (
    <div className={styles.field}>
      <Label id={id} field={field} />
      <input
        id={id}
        className={styles.input}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <Counter value={value} max={field.max} />
    </div>
  );
}

function TextareaField({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { kind: 'textarea' }>;
  value: string;
  onChange: (next: string) => void;
}) {
  const id = useId();
  return (
    <div className={styles.field}>
      <Label id={id} field={field} />
      <textarea
        id={id}
        className={styles.textarea}
        rows={field.rows ?? 4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <Counter value={value} max={field.max} />
    </div>
  );
}

function NumberField({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { kind: 'number' }>;
  value: unknown;
  onChange: (next: number) => void;
}) {
  const id = useId();
  return (
    <div className={styles.field}>
      <Label id={id} field={field} />
      <input
        id={id}
        className={styles.input}
        style={{ maxWidth: 180 }}
        type="number"
        inputMode="decimal"
        min={field.min}
        max={field.max}
        step={field.step ?? 1}
        value={typeof value === 'number' ? value : ''}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) onChange(next);
        }}
      />
    </div>
  );
}

function ToggleField({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { kind: 'toggle' }>;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label
        className={styles.label}
        htmlFor={id}
        style={{ display: 'flex', gap: 10, alignItems: 'center' }}
      >
        <input
          id={id}
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
        />
        {field.label}
      </label>
      {field.help ? <span className={styles.help}>{field.help}</span> : null}
    </div>
  );
}

/* ── Lists of plain strings ─────────────────────────────────────────────── */

function StringsField({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { kind: 'strings' }>;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  function replace(index: number, next: string) {
    onChange(value.map((entry, position) => (position === index ? next : entry)));
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item as string);
    onChange(next);
  }

  return (
    <div className={styles.field}>
      <span className={styles.label}>{field.label}</span>
      {field.help ? <span className={styles.help}>{field.help}</span> : null}

      {value.map((entry, index) => (
        <div className={styles.stringRow} key={index}>
          {field.multiline ? (
            <textarea
              className={styles.textarea}
              rows={4}
              aria-label={`${field.itemLabel} ${index + 1}`}
              value={entry}
              onChange={(event) => replace(index, event.target.value)}
            />
          ) : (
            <input
              className={styles.input}
              aria-label={`${field.itemLabel} ${index + 1}`}
              value={entry}
              onChange={(event) => replace(index, event.target.value)}
            />
          )}
          <RowActions
            onUp={() => move(index, -1)}
            onDown={() => move(index, 1)}
            onRemove={() => onChange(value.filter((_, position) => position !== index))}
            canUp={index > 0}
            canDown={index < value.length - 1}
            canRemove={value.length > 1}
            label={`${field.itemLabel} ${index + 1}`}
          />
        </div>
      ))}

      <button
        type="button"
        className={styles.addButton}
        style={{ margin: '6px 0 0' }}
        onClick={() => onChange([...value, ''])}
      >
        + adicionar {field.itemLabel.toLowerCase()}
      </button>
    </div>
  );
}

function RowActions({
  onUp,
  onDown,
  onRemove,
  canUp,
  canDown,
  canRemove,
  label,
}: {
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
  canUp: boolean;
  canDown: boolean;
  canRemove: boolean;
  label: string;
}) {
  return (
    <div className={styles.rowActions}>
      <button
        type="button"
        className={styles.iconButton}
        onClick={onUp}
        disabled={!canUp}
        aria-label={`Mover ${label} para cima`}
      >
        ↑
      </button>
      <button
        type="button"
        className={styles.iconButton}
        onClick={onDown}
        disabled={!canDown}
        aria-label={`Mover ${label} para baixo`}
      >
        ↓
      </button>
      <button
        type="button"
        className={`${styles.iconButton} ${styles.iconButtonDanger}`}
        onClick={() => {
          if (window.confirm(`Apagar ${label}?`)) onRemove();
        }}
        disabled={!canRemove}
        aria-label={`Apagar ${label}`}
      >
        ×
      </button>
    </div>
  );
}

/* ── Photographs ────────────────────────────────────────────────────────── */

function ImageField({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { kind: 'image' }>;
  value: string;
  onChange: (next: string) => void;
}) {
  const id = useId();
  const { staged, stage, storefrontUrl } = useContext(StagingContext);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const stagedImage = staged[value];
  const src = stagedImage
    ? stagedImage.previewUrl
    : value.startsWith('http')
      ? value
      : storefrontUrl !== null && value
        ? `${storefrontUrl}${value}`
        : null;

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch('/api/builder/upload', { method: 'POST', body });
      const data = (await response.json()) as {
        src?: string;
        path?: string;
        base64?: string;
        error?: string;
      };

      if (!response.ok || !data.src || !data.path || !data.base64) {
        setError(data.error ?? 'Não foi possível carregar a imagem.');
        return;
      }

      stage(data.src, {
        path: data.path,
        base64: data.base64,
        previewUrl: `data:image/jpeg;base64,${data.base64}`,
      });
      onChange(data.src);
    } catch {
      setError('Sem ligação. Tenta outra vez.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className={styles.field}>
      <Label id={id} field={field} />
      <div className={styles.imageField}>
        {src ? (
          // A plain img: the source is a data URL or another origin, and
          // next/image would add nothing to a 190px editor thumbnail.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.imagePreview}
            style={{ ['--ratio' as string]: field.ratio ?? '4 / 5' }}
            src={src}
            alt=""
          />
        ) : (
          <div
            className={styles.imagePreview}
            style={{ ['--ratio' as string]: field.ratio ?? '4 / 5' }}
            aria-hidden
          />
        )}

        <div className={styles.imageActions}>
          <label className={styles.fileButton}>
            {busy ? 'a carregar…' : 'Escolher fotografia'}
            <input
              ref={inputRef}
              id={id}
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
              }}
            />
          </label>

          {stagedImage ? (
            <span className={styles.staged}>Nova fotografia — publica para ficar no site.</span>
          ) : null}
          {error ? (
            <span style={{ color: 'var(--danger)' }} role="alert">
              {error}
            </span>
          ) : null}
          {!src ? <span>Ainda sem fotografia.</span> : null}
          <span className={styles.sampleNote}>
            As fotografias são reduzidas automaticamente. JPG, PNG ou WebP.
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Product and category pickers ───────────────────────────────────────── */

function PickerField({
  field,
  kind,
  value,
  onChange,
}: {
  field: Extract<Field, { kind: 'product' | 'collection' }>;
  kind: 'product' | 'collection';
  value: string;
  onChange: (next: string) => void;
}) {
  const id = useId();
  const shop = useShopOptions();
  const options = kind === 'product' ? shop.products : shop.collections;
  const allowNone = field.kind === 'collection' ? field.allowNone : undefined;

  // The stored value may name something that has since been unpublished; it is
  // kept as an option so editing another field cannot silently discard it.
  const missing = value && !options.some((option) => option.handle === value);

  if (!shop.loading && (!shop.connected || !shop.reachable)) {
    return (
      <div className={styles.field}>
        <Label id={id} field={field} />
        <input
          id={id}
          className={styles.input}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className={styles.sampleNote}>
          A loja não está ligada a este editor, por isso não há lista para escolher.
        </span>
      </div>
    );
  }

  return (
    <div className={styles.field}>
      <Label id={id} field={field} />
      <select
        id={id}
        className={styles.select}
        style={{ maxWidth: 420 }}
        value={value}
        disabled={shop.loading}
        onChange={(event) => onChange(event.target.value)}
      >
        {allowNone !== undefined ? <option value="">{allowNone}</option> : null}
        {shop.loading ? <option value={value}>a carregar…</option> : null}
        {missing ? <option value={value}>{value} — já não está na loja</option> : null}
        {options.map((option) => (
          <option key={option.handle} value={option.handle}>
            {option.title}
          </option>
        ))}
      </select>
      {missing ? (
        <span className={styles.warning}>
          Isto já não existe na loja. Escolhe outra coisa, ou publica-o de novo no Shopify.
        </span>
      ) : null}
    </div>
  );
}

/* ── Colour ─────────────────────────────────────────────────────────────── */

function ColorField({
  field,
  value,
  document,
  onChange,
}: {
  field: Extract<Field, { kind: 'color' }>;
  value: string;
  document: unknown;
  onChange: (next: string) => void;
}) {
  const id = useId();
  const key = field.path.split('.').pop() ?? '';

  /*
   * Contrast is checked against the other colours as they currently stand, so
   * the warning reflects the palette being built rather than the one shipped.
   */
  const warnings = useMemo(() => {
    const colors = (getPath(document, 'colors') ?? {}) as Record<string, string>;
    return CONTRAST_PAIRS.filter((pair) => pair.ink === key || pair.against === key)
      .map((pair) => {
        const ink = pair.ink === 'white' ? '#ffffff' : colors[pair.ink];
        const ground = pair.against === 'white' ? '#ffffff' : colors[pair.against];
        if (!ink || !ground) return null;
        const verdict = checkContrast(ink, ground);
        if (!verdict) return null;
        const ok = pair.largeText ? verdict.passesLarge : verdict.passesBody;
        return ok ? null : { where: pair.where, ratio: verdict.ratio };
      })
      .filter((entry): entry is { where: string; ratio: number } => entry !== null);
  }, [document, key]);

  const valid = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);

  return (
    <div className={styles.field}>
      <Label id={id} field={field} />
      <div className={styles.colorRow}>
        <input
          className={styles.swatch}
          type="color"
          value={valid ? value : '#000000'}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${field.label} — escolher cor`}
        />
        <input
          id={id}
          className={styles.hexInput}
          value={value}
          spellCheck={false}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>

      {!valid ? (
        <span className={styles.warning}>
          Isto não é uma cor válida. Usa o quadrado ao lado, ou escreve algo como #1e2f52.
        </span>
      ) : null}

      {warnings.length > 0 ? (
        <div className={styles.warning}>
          <strong>Esta cor vai ficar difícil de ler.</strong>
          <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
            {warnings.map((warning) => (
              <li key={warning.where}>
                {warning.where} — contraste {warning.ratio}:1, o mínimo recomendado é 4,5:1
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/* ── Size ───────────────────────────────────────────────────────────────── */

function ScaleField({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { kind: 'scale' }>;
  value: unknown;
  onChange: (next: number) => void;
}) {
  const id = useId();
  const scale = typeof value === 'number' && Number.isFinite(value) ? value : 1;
  const percent = Math.round(scale * 100);

  const sampleClass = field.preview === 'display' ? styles.sampleDisplay : styles.sampleSerif;

  return (
    <div className={styles.field}>
      <Label id={id} field={field} />
      <div className={styles.scaleRow}>
        <input
          id={id}
          className={styles.slider}
          type="range"
          min={0.7}
          max={1.5}
          step={0.05}
          value={scale}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <span className={styles.scaleValue}>{percent}%</span>
        {scale !== 1 ? (
          <button type="button" className={styles.resetLink} onClick={() => onChange(1)}>
            repor
          </button>
        ) : null}
      </div>
      <p className={sampleClass} style={{ fontSize: `calc(1em * ${scale})` }}>
        {field.sample}
      </p>
      <span className={styles.sampleNote}>
        {scale === 1 ? 'Tamanho original do design.' : `${percent}% do tamanho original.`}
      </span>
    </div>
  );
}

/* ── Repeating groups of objects ────────────────────────────────────────── */

function ListField({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { kind: 'list' }>;
  value: unknown[];
  onChange: (next: unknown[]) => void;
}) {
  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  }

  function blank(): unknown {
    // A new row starts with every sub-field present and empty, so the shape
    // stays identical to the rows already in the file.
    if (field.fields.length === 1 && field.fields[0]!.path === '') return '';
    const item: Record<string, unknown> = {};
    for (const sub of field.fields) {
      if (!sub.path) continue;
      item[sub.path] = sub.kind === 'strings' ? [''] : sub.kind === 'toggle' ? false : '';
    }
    return item;
  }

  const atMax = field.max !== undefined && value.length >= field.max;
  const atMin = field.min !== undefined && value.length <= field.min;

  return (
    <div className={styles.field}>
      <span className={styles.label}>{field.label}</span>
      {field.help ? <span className={styles.help}>{field.help}</span> : null}

      <div className={styles.group}>
        {value.map((item, index) => {
          const summary =
            field.titleField && typeof item === 'object' && item !== null
              ? String((item as Record<string, unknown>)[field.titleField] ?? '')
              : typeof item === 'string'
                ? item
                : '';

          return (
            <div className={styles.groupItem} key={index}>
              <div className={styles.groupItemHead}>
                <span className={styles.groupItemTitle}>
                  {summary || `${field.itemLabel} ${index + 1}`}
                </span>
                <RowActions
                  onUp={() => move(index, -1)}
                  onDown={() => move(index, 1)}
                  onRemove={() => onChange(value.filter((_, position) => position !== index))}
                  canUp={index > 0}
                  canDown={index < value.length - 1}
                  canRemove={!atMin}
                  label={summary || `${field.itemLabel} ${index + 1}`}
                />
              </div>

              <div className={styles.groupItemFields}>
                {field.fields.map((sub) => (
                  <FieldControl
                    key={`${index}-${sub.path}-${sub.label}`}
                    field={sub}
                    document={item}
                    onChange={(next) =>
                      onChange(value.map((entry, position) => (position === index ? next : entry)))
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}

        {value.length === 0 ? (
          <p className={styles.groupItem} style={{ color: 'var(--muted)' }}>
            Ainda não há nada aqui.
          </p>
        ) : null}

        <button
          type="button"
          className={styles.addButton}
          disabled={atMax}
          onClick={() => onChange([...value, blank()])}
        >
          {atMax
            ? `Máximo de ${field.max} ${field.itemLabel.toLowerCase()}`
            : `+ adicionar ${field.itemLabel.toLowerCase()}`}
        </button>
      </div>
    </div>
  );
}
