'use client';

import styles from './editor.module.css';
import type { PublishState } from './usePublish';

/**
 * The one place an edit becomes public.
 *
 * It reports three genuinely different things — saved, site rebuilding, and
 * visibly live — because "saved" and "live" are a minute apart and telling
 * someone their change is live before it is would send them looking for a bug
 * that is not there.
 */
export function PublishBar({
  state,
  dirty,
  onPublish,
  onDiscard,
  viewUrl,
  idleMessage = 'Tens alterações por publicar.',
}: {
  state: PublishState;
  dirty: boolean;
  onPublish: () => void;
  onDiscard?: () => void;
  viewUrl?: string | null;
  idleMessage?: string;
}) {
  if (state.phase === 'idle' && !dirty) return null;

  const busy = state.phase === 'publishing' || state.phase === 'building';

  const { text, tone } = (() => {
    switch (state.phase) {
      case 'publishing':
        return { text: 'A guardar…', tone: '' };
      case 'building':
        return {
          text: 'Guardado. O site está a actualizar — demora cerca de um minuto.',
          tone: '',
        };
      case 'live':
        return { text: 'Pronto. As alterações já estão no site.', tone: styles.barMessageOk };
      case 'error':
        return { text: state.message, tone: styles.barMessageError };
      default:
        return { text: idleMessage, tone: '' };
    }
  })();

  return (
    <div className={styles.bar} role="status" aria-live="polite">
      <span className={`${styles.barMessage} ${tone}`}>
        {text}
        {state.phase === 'live' && viewUrl ? (
          <>
            {' '}
            <a href={viewUrl} target="_blank" rel="noreferrer">
              Ver
            </a>
          </>
        ) : null}
      </span>

      {dirty && !busy && onDiscard ? (
        <button type="button" className={styles.discard} onClick={onDiscard}>
          descartar
        </button>
      ) : null}

      {dirty || state.phase === 'error' ? (
        <button type="button" className={styles.publish} onClick={onPublish} disabled={busy}>
          {busy ? 'a publicar…' : 'publicar alterações'}
        </button>
      ) : null}
    </div>
  );
}
