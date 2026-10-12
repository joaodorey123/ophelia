import { redirect } from 'next/navigation';

import { hasSession } from '@/lib/builder/session';

import { LoginForm } from './LoginForm';
import styles from './login.module.css';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await hasSession()) redirect('/builder');

  return (
    <main className={styles.screen}>
      <div className={styles.card}>
        <p className={styles.brand}>Ophelia</p>
        <p className={styles.subtitle}>editor do site</p>
        <LoginForm />
      </div>
    </main>
  );
}
