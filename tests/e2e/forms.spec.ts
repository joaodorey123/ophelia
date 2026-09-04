import { expect, test, type Page } from '@playwright/test';

/**
 * The suite runs without OPHELIA_ENQUIRY_WEBHOOK_URL, so the API answers 503.
 * That is the state the site ships in today, and these tests pin the promise
 * that it never claims success for a message nobody received.
 */

/**
 * The enquiry form's own status region. Scoped to `main` because the footer's
 * newsletter form has one too, and the page has other live regions besides.
 */
function formStatus(page: Page) {
  return enquiryForm(page).getByRole('status');
}

/** The page's enquiry form — the footer newsletter is a separate form. */
function enquiryForm(page: Page) {
  return page.locator('main form');
}

async function fillEvento(page: Page) {
  await page.getByLabel('Nome', { exact: true }).fill('Maria Silva');
  await page.getByLabel('Email', { exact: true }).fill('maria@example.com');
  await page.getByLabel('Tipo de evento').selectOption('Casamento');
  await page.getByLabel('Mensagem').fill('Casamento em maio, 80 pessoas.');
}

test.describe('Eventos enquiry', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/eventos');
  });

  test('every field has a real label', async ({ page }) => {
    const unlabelled = await page.evaluate(() => {
      const form = document.querySelector('form');
      const bad: string[] = [];
      for (const el of Array.from(
        form?.querySelectorAll<HTMLElement>('input, select, textarea') ?? [],
      )) {
        if (el.closest('[aria-hidden="true"]')) continue;
        const id = el.getAttribute('id');
        const labelled =
          (id && document.querySelector(`label[for="${id}"]`)) ||
          el.getAttribute('aria-label') ||
          el.closest('label');
        if (!labelled) bad.push(el.getAttribute('name') ?? el.tagName);
      }
      return bad;
    });
    expect(unlabelled).toEqual([]);
  });

  test('blocks an empty submission and announces the errors accessibly', async ({ page }) => {
    await page.getByRole('button', { name: 'Enviar pedido' }).click();

    await expect(formStatus(page)).toContainText('Verifica os campos assinalados');

    // Each offending field is marked and points at its message.
    for (const name of ['nome', 'email', 'tipoEvento', 'mensagem']) {
      const field = enquiryForm(page).locator(`[name="${name}"]`);
      await expect(field).toHaveAttribute('aria-invalid', 'true');
      const describedBy = await field.getAttribute('aria-describedby');
      expect(describedBy, `${name} has no error message`).toBeTruthy();
      await expect(page.locator(`#${describedBy}`)).toContainText('obrigatório');
    }

    // Focus moves to the first thing to fix.
    await expect(enquiryForm(page).locator('[name="nome"]')).toBeFocused();
  });

  test('rejects an invalid email without contacting the server', async ({ page }) => {
    let called = false;
    await page.route('**/api/enquiry', (route) => {
      called = true;
      return route.abort();
    });

    await fillEvento(page);
    await page.getByLabel('Email', { exact: true }).fill('nao-e-um-email');
    await page.getByRole('button', { name: 'Enviar pedido' }).click();

    await expect(enquiryForm(page).locator('[name="email"]')).toHaveAttribute('aria-invalid', 'true');
    expect(called).toBe(false);
  });

  test('reports honestly that delivery is not configured, and offers the email', async ({
    page,
  }) => {
    await fillEvento(page);
    await page.getByRole('button', { name: 'Enviar pedido' }).click();

    const status = formStatus(page);
    await expect(status).toContainText('ainda não está ligado');
    await expect(status).toContainText('info@callmeophelia.com');
    // Never a success message for a submission that went nowhere.
    await expect(status).not.toContainText('Recebemos o teu pedido');
  });

  test('shows a success state only when the endpoint really accepts it', async ({ page }) => {
    await page.route('**/api/enquiry', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
    );

    await fillEvento(page);
    await page.getByRole('button', { name: 'Enviar pedido' }).click();

    await expect(formStatus(page)).toContainText('Recebemos o teu pedido');
    // A delivered form resets, ready for the next enquiry.
    await expect(page.getByLabel('Nome', { exact: true })).toHaveValue('');
  });

  test('surfaces a server error rather than swallowing it', async ({ page }) => {
    await page.route('**/api/enquiry', (route) =>
      route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Não conseguimos enviar o teu pedido.' }),
      }),
    );

    await fillEvento(page);
    await page.getByRole('button', { name: 'Enviar pedido' }).click();
    await expect(formStatus(page)).toContainText('Não conseguimos enviar');
  });

  test('survives a network failure', async ({ page }) => {
    await page.route('**/api/enquiry', (route) => route.abort());

    await fillEvento(page);
    await page.getByRole('button', { name: 'Enviar pedido' }).click();
    await expect(formStatus(page)).toContainText('info@callmeophelia.com');
  });

  test('disables the controls while sending', async ({ page }) => {
    await page.route('**/api/enquiry', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });

    await fillEvento(page);
    await page.getByRole('button', { name: 'Enviar pedido' }).click();

    await expect(page.getByRole('button', { name: 'A enviar…' })).toBeDisabled();
    await expect(page.getByLabel('Nome', { exact: true })).toBeDisabled();
  });

  test('accepts a very long message without breaking the layout', async ({ page }) => {
    await fillEvento(page);
    await page.getByLabel('Mensagem').fill('Olá! '.repeat(600));

    const overflow = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(overflow.scroll).toBeLessThanOrEqual(overflow.client + 1);
  });
});

test.describe('Personalizadas enquiry', () => {
  test('enforces the 10-unit minimum the handoff requires', async ({ page }) => {
    await page.goto('/personalizadas');

    await page.getByLabel('Nome', { exact: true }).fill('João');
    await page.getByLabel('Email', { exact: true }).fill('joao@example.com');
    await page.getByLabel('Ocasião').selectOption('Casamento');
    await page.getByLabel('Quantidade').fill('4');
    await page.getByRole('button', { name: 'Enviar pedido' }).click();

    const field = enquiryForm(page).locator('[name="quantidade"]');
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    const describedBy = await field.getAttribute('aria-describedby');
    await expect(page.locator(`#${describedBy?.split(' ')[0]}`)).toContainText('mínimo é 10');
  });

  test('states the minimum before the visitor submits', async ({ page }) => {
    await page.goto('/personalizadas');
    await expect(page.getByText('Encomenda mínima de 10 unidades.')).toBeVisible();
  });

  test('describes the sticker upload honestly rather than faking it', async ({ page }) => {
    await page.goto('/personalizadas');
    await expect(page.getByRole('heading', { name: 'Envio da imagem' })).toBeVisible();
    // No file input pretending to work.
    await expect(page.locator('input[type="file"]')).toHaveCount(0);
  });
});

test.describe('newsletter', () => {
  test('reports honestly when delivery is not configured', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('O teu email').fill('maria@example.com');
    await page.getByRole('button', { name: 'Subscrever' }).click();

    await expect(page.locator('footer').getByRole('status')).toContainText('ainda não está ligado');
  });

  test('rejects an invalid email locally', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('O teu email').fill('nope');
    await page.getByRole('button', { name: 'Subscrever' }).click();

    await expect(page.locator('footer').getByRole('status')).toContainText('email válido');
  });
});
