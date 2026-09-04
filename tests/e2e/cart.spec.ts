import { expect, test, type Locator, type Page } from '@playwright/test';

/** The money on a cart line, as opposed to the same figure in the summary. */
function lineTotal(scope: Locator) {
  return scope.locator('[class*="total"]').first();
}

/** A labelled row in the cart summary — Subtotal, Envio or Total. */
function summaryRow(scope: Locator, label: string) {
  return scope.locator('div').filter({ hasText: new RegExp(`^${label}`) }).last();
}

/** Opens the cart drawer from whichever header is showing. */
async function openCart(page: Page) {
  await page.getByRole('button', { name: 'Abrir o cesto' }).filter({ visible: true }).click();
  await expect(page.getByRole('dialog', { name: 'O teu cesto' })).toBeVisible();
}

async function addCookiesFromProductPage(page: Page, size = '12 unidades') {
  await page.goto('/produto/ophelia-cookies');
  await page.getByRole('button', { name: new RegExp(size) }).click();
  await page.getByRole('button', { name: /^Adicionar ao cesto · / }).click();
}

test.describe('adding to the cart', () => {
  test('a card add raises a toast but does not open the drawer', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Adicionar Ophelia Cookies ao cesto' }).click();

    await expect(page.getByText('Ophelia Cookies no cesto')).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByText('1 artigos no cesto').first()).toBeAttached();
  });

  test('a product-page add opens the drawer with the chosen variant', async ({ page }) => {
    await addCookiesFromProductPage(page);

    const drawer = page.getByRole('dialog', { name: 'O teu cesto' });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText('Tradicional · 12 unidades')).toBeVisible();
    await expect(lineTotal(drawer)).toHaveText('€48');
    await expect(summaryRow(drawer, 'Total')).toContainText('€48');
  });

  test('selecting a variant updates the price and the button total', async ({ page }) => {
    await page.goto('/produto/ophelia-cookies');
    await expect(page.getByRole('button', { name: 'Adicionar ao cesto · €17' })).toBeVisible();

    await page.getByRole('button', { name: /8 unidades/ }).click();
    await expect(page.getByRole('button', { name: 'Adicionar ao cesto · €32' })).toBeVisible();

    await page.getByRole('button', { name: /12 unidades/ }).click();
    await expect(page.getByRole('button', { name: 'Adicionar ao cesto · €48' })).toBeVisible();
  });

  test('the quantity stepper drives the button total and respects its bounds', async ({ page }) => {
    await page.goto('/produto/ophelia-cookies');

    const decrease = page.getByRole('button', { name: 'Diminuir quantidade' });
    const increase = page.getByRole('button', { name: 'Aumentar quantidade' });

    // Minimum is 1, so decrease starts disabled.
    await expect(decrease).toBeDisabled();

    await increase.click();
    await expect(page.getByRole('button', { name: 'Adicionar ao cesto · €34' })).toBeVisible();
    await expect(decrease).toBeEnabled();

    await decrease.click();
    await expect(page.getByRole('button', { name: 'Adicionar ao cesto · €17' })).toBeVisible();
  });

  test('the gift card adds €4 and travels as its own line with the message', async ({ page }) => {
    await page.goto('/produto/ophelia-cookies');

    await page.getByRole('checkbox').check();
    await expect(page.getByRole('button', { name: 'Adicionar ao cesto · €21' })).toBeVisible();

    await page.getByRole('textbox', { name: 'A tua mensagem para o cartão' }).fill('Parabéns, mãe!');
    await page.getByRole('button', { name: /^Adicionar ao cesto · / }).click();

    const drawer = page.getByRole('dialog', { name: 'O teu cesto' });
    await expect(drawer.getByRole('link', { name: 'Ophelia Cookies' })).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'Cartão personalizado' })).toBeVisible();
    await expect(drawer.getByText('“Parabéns, mãe!”')).toBeVisible();
    // €17 cookies + €4 card
    await expect(summaryRow(drawer, 'Total')).toContainText('€21');
  });

  test('the card message is capped at 120 characters', async ({ page }) => {
    await page.goto('/produto/ophelia-cookies');
    await page.getByRole('checkbox').check();

    const textarea = page.getByRole('textbox', { name: 'A tua mensagem para o cartão' });
    await textarea.fill('x'.repeat(200));
    expect((await textarea.inputValue()).length).toBe(120);
    await expect(page.getByText('120/120 caracteres')).toBeVisible();
  });
});

test.describe('cart line behaviour', () => {
  test('an identical line merges instead of appending a row', async ({ page }) => {
    await page.goto('/comprar/lifestyle');
    const add = page.getByRole('button', { name: 'Adicionar Vela aromática ao cesto' });
    await add.click();
    await expect(page.getByText('Vela aromática no cesto')).toBeVisible();
    await add.click();

    await openCart(page);
    const drawer = page.getByRole('dialog');
    await expect(drawer.getByRole('link', { name: 'Vela aromática' })).toHaveCount(1);
    await expect(lineTotal(drawer)).toHaveText('€36');
    await expect(summaryRow(drawer, 'Total')).toContainText('€36');
  });

  test('stepping a line below one removes it', async ({ page }) => {
    await page.goto('/comprar/lifestyle');
    await page.getByRole('button', { name: 'Adicionar Vela aromática ao cesto' }).click();
    await openCart(page);

    const drawer = page.getByRole('dialog');
    await drawer.getByRole('button', { name: 'Diminuir quantidade de Vela aromática' }).click();
    await expect(drawer.getByText('O cesto ainda está vazio.')).toBeVisible();
  });

  test('remove empties the cart and shows the designed empty state', async ({ page }) => {
    await addCookiesFromProductPage(page, '4 unidades');
    const drawer = page.getByRole('dialog');
    await drawer.getByRole('button', { name: 'Remover Ophelia Cookies do cesto' }).click();

    await expect(drawer.getByText('O cesto ainda está vazio.')).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'Começar pelas cookies' })).toBeVisible();
  });

  test('rapid quantity clicks settle on the correct total', async ({ page }) => {
    await addCookiesFromProductPage(page, '4 unidades');
    const drawer = page.getByRole('dialog');
    const increase = drawer.getByRole('button', { name: 'Aumentar quantidade de Ophelia Cookies' });

    // Five clicks with no waiting: the mutation queue must not drop or reorder.
    for (let i = 0; i < 5; i += 1) await increase.click({ delay: 0 });

    // 6 x €17 — no lost update, no reordered response.
    await expect(lineTotal(drawer)).toHaveText('€102', { timeout: 15_000 });
    await expect(summaryRow(drawer, 'Total')).toContainText('€102');
  });

  test('cross-sell excludes what is already in the cart and caps at three', async ({ page }) => {
    await addCookiesFromProductPage(page, '4 unidades');
    const drawer = page.getByRole('dialog');
    const suggestions = drawer.getByRole('button', { name: /^Juntar / });
    await expect(suggestions).toHaveCount(3);

    await drawer.getByRole('button', { name: 'Juntar Café da Ophelia ao cesto' }).click();
    await expect(drawer.getByRole('button', { name: 'Juntar Café da Ophelia ao cesto' })).toHaveCount(
      0,
    );
  });
});

test.describe('cart persistence and the cart page', () => {
  test('the cart survives a reload and a route change', async ({ page }) => {
    await addCookiesFromProductPage(page, '4 unidades');
    await expect(lineTotal(page.getByRole('dialog'))).toHaveText('€17');
    await page.keyboard.press('Escape');

    await page.reload();
    await expect(page.getByText('1 artigos no cesto').first()).toBeAttached();

    await page.goto('/carrinho');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('O teu cesto');
    await expect(page.getByRole('link', { name: 'Ophelia Cookies' })).toBeVisible();
    await expect(page.locator('main [class*="total"]').first()).toHaveText('€17');
  });

  test('the cart page and the drawer agree on the totals', async ({ page }) => {
    await addCookiesFromProductPage(page, '12 unidades');
    await expect(summaryRow(page.getByRole('dialog'), 'Total')).toContainText('€48');
    await page.keyboard.press('Escape');
    await page.goto('/carrinho');

    await expect(page.getByText('Calculado no pagamento')).toBeVisible();

    // Total equals Subtotal until real shipping rates exist.
    const summary = page.getByRole('complementary');
    await expect(summaryRow(summary, 'Subtotal')).toContainText('€48');
    await expect(summaryRow(summary, 'Total')).toContainText('€48');
  });

  test('the empty cart page offers a way back into the catalogue', async ({ page }) => {
    await page.goto('/carrinho');
    await expect(page.getByText('O cesto ainda está vazio.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Começar pelas cookies' })).toBeVisible();
  });
});

test.describe('checkout handoff', () => {
  test('says plainly that checkout needs Shopify, and never fakes an order', async ({ page }) => {
    await addCookiesFromProductPage(page, '4 unidades');
    const drawer = page.getByRole('dialog');

    await drawer.getByRole('button', { name: 'Continuar para pagamento' }).click();

    await expect(drawer.getByRole('alert')).toContainText('Shopify');
    await expect(drawer.getByRole('alert')).toContainText('info@callmeophelia.com');
    // No navigation, no confirmation, no order number.
    await expect(page).toHaveURL(/\/produto\/ophelia-cookies$/);
    await expect(page.getByText(/encomenda confirmada|obrigado pela sua compra/i)).toHaveCount(0);
  });

  test('checkout is disabled while the cart is empty', async ({ page }) => {
    await page.goto('/');
    await openCart(page);
    await expect(
      page.getByRole('dialog').getByRole('button', { name: 'Continuar para pagamento' }),
    ).toBeDisabled();
  });
});
