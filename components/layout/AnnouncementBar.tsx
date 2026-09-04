import styles from './Header.module.css';

/**
 * "Enviamos de segunda a quinta-feira · Receba a sua encomenda até 2 dias"
 * Copy is the client's own shipping rule, from the Termos e Condições document.
 */
export function AnnouncementBar() {
  return (
    <div className={styles.announcement}>
      Enviamos de segunda a quinta-feira · Receba a sua encomenda até 2 dias
    </div>
  );
}
