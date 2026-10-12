'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import styles from './login.module.css';

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch('/api/builder/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // A full refresh so the guarded layout re-runs on the server.
        router.replace('/builder');
        router.refresh();
        return;
      }

      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? 'Não foi possível entrar.');
    } catch {
      setError('Sem ligação. Verifica a internet e tenta outra vez.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div>
        <label className={styles.label} htmlFor="password">
          Palavra-passe
        </label>
        <input
          id="password"
          className={styles.input}
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={busy}
        />
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <button className={styles.submit} type="submit" disabled={busy || password.length === 0}>
        {busy ? 'a entrar…' : 'entrar'}
      </button>
    </form>
  );
}
