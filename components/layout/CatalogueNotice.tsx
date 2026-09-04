import { isUsingLocalCatalogue } from '@/lib/commerce/config';

import styles from './CatalogueNotice.module.css';

/**
 * Honest labelling: when Shopify credentials are absent the storefront runs on
 * the local development catalogue, products come from the client's documents
 * rather than from Shopify, and checkout is unavailable. Say so, on every page.
 */
export function CatalogueNotice() {
  if (!isUsingLocalCatalogue()) return null;

  return (
    <div className={styles.notice}>
      Pré-visualização: catálogo de desenvolvimento, sem ligação ao Shopify. Os preços são os do
      dossiê de produtos e não é possível concluir o pagamento.
    </div>
  );
}
