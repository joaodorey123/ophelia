import styles from './editor.module.css';

/**
 * What to do when the tool is not finished being set up.
 *
 * A missing environment variable is a setup problem with an exact fix, not a
 * mysterious failure — so it says which one is missing rather than "something
 * went wrong".
 */
export function SetupNotice({ missing }: { missing: string[] }) {
  return (
    <div className={`${styles.notice} ${styles.noticeError}`} role="alert">
      <strong>O editor ainda não está ligado ao site.</strong>
      <p style={{ marginTop: 8 }}>
        {missing.length === 1 ? 'Falta uma definição:' : 'Faltam algumas definições:'}
      </p>
      <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
        {missing.map((key) => (
          <li key={key}>
            <code>{key}</code>
          </li>
        ))}
      </ul>
      <p style={{ marginTop: 10 }}>
        Quem trata do site adiciona isto nas definições do projecto na Vercel. Está explicado no
        ficheiro <code>.env.example</code>.
      </p>
    </div>
  );
}
