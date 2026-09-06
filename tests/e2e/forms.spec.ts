import { expect, test } from '@playwright/test';

/**
 * The contact form.
 *
 * The point of these tests is that the form is never dishonest: it validates
 * before it submits, it says what went wrong, and it only shows "obrigada!"
 * when the server actually accepted the message.
 */
test.describe('contacto form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contacto');
  });

  test('every field has a real label', async ({ page }) => {
    for (const label of ['nome', 'email', 'assunto', 'mensagem']) {
      await expect(page.getByLabel(label, { exact: true })).toBeVisible();
    }
  });

  test('refuses to submit an empty form and reports each field', async ({ page }) => {
    let posted = false;
    await page.route('**/api/enquiry', async (route) => {
      posted = true;
      await route.abort();
    });

    await page.getByRole('button', { name: 'enviar mensagem' }).click();

    await expect(page.getByText('Nome é obrigatório.')).toBeVisible();
    await expect(page.getByText('Email é obrigatório.')).toBeVisible();
    await expect(page.getByText('Mensagem é obrigatório.')).toBeVisible();
    expect(posted, 'an invalid form was sent to the server').toBe(false);
  });

  test('rejects an address that is not an email', async ({ page }) => {
    await page.getByLabel('nome', { exact: true }).fill('Maria');
    await page.getByLabel('email', { exact: true }).fill('maria arroba example');
    await page.getByLabel('mensagem', { exact: true }).fill('Olá.');
    await page.getByRole('button', { name: 'enviar mensagem' }).click();
    await expect(page.getByText(/email/i).filter({ hasText: /válido|inválido/i })).toBeVisible();
  });

  test('shows the success panel only when the server accepts it', async ({ page }) => {
    await page.route('**/api/enquiry', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
    );

    await page.getByLabel('nome', { exact: true }).fill('Maria');
    await page.getByLabel('email', { exact: true }).fill('maria@example.com');
    await page.getByLabel('mensagem', { exact: true }).fill('Um bolo para sábado.');
    await page.getByRole('button', { name: 'enviar mensagem' }).click();

    await expect(page.getByText('obrigada!')).toBeVisible();
    await page.getByRole('button', { name: 'enviar outra' }).click();
    await expect(page.getByLabel('nome', { exact: true })).toBeVisible();
  });

  test('says so plainly when delivery is not configured', async ({ page }) => {
    await page.route('**/api/enquiry', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Escreve-nos para info@callmeophelia.com.' }),
      }),
    );

    await page.getByLabel('nome', { exact: true }).fill('Maria');
    await page.getByLabel('email', { exact: true }).fill('maria@example.com');
    await page.getByLabel('mensagem', { exact: true }).fill('Olá.');
    await page.getByRole('button', { name: 'enviar mensagem' }).click();

    await expect(page.locator('form [role="alert"]')).toContainText('info@callmeophelia.com');
    await expect(page.getByText('obrigada!')).toBeHidden();
  });

  test('survives a network failure without claiming success', async ({ page }) => {
    await page.route('**/api/enquiry', (route) => route.abort());

    await page.getByLabel('nome', { exact: true }).fill('Maria');
    await page.getByLabel('email', { exact: true }).fill('maria@example.com');
    await page.getByLabel('mensagem', { exact: true }).fill('Olá.');
    await page.getByRole('button', { name: 'enviar mensagem' }).click();

    await expect(page.locator('form [role="alert"]')).toBeVisible();
    await expect(page.getByText('obrigada!')).toBeHidden();
  });

  test('the subject can be pre-selected from the footer links', async ({ page }) => {
    await page.goto('/contacto?assunto=Eventos%20e%20catering');
    await expect(page.getByLabel('assunto', { exact: true })).toHaveValue('Eventos e catering');
  });
});
