#!/usr/bin/env node
/**
 * Shopify integration doctor.
 *
 * Answers, in order, the questions that actually make a headless storefront
 * look broken: is the domain right, is the token accepted, is the API version
 * the one being served, do collections exist, are products published to the
 * Headless channel, and does the cart issue a checkout URL.
 *
 * It never prints the access token, and it never writes anything to the shop.
 *
 *   npm run shopify:doctor
 *   npm run shopify:doctor -- <product-handle>
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Reads .env.local / .env without pulling in a dependency. */
function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    try {
      const text = readFileSync(resolve(process.cwd(), file), 'utf8');
      for (const line of text.split('\n')) {
        const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
        if (!match) continue;
        const [, key, raw] = match;
        if (process.env[key]) continue;
        process.env[key] = raw.trim().replace(/^["']|["']$/g, '');
      }
    } catch {
      // Absent file: the variables may come from the real environment instead.
    }
  }
}

loadEnv();

const domain = (process.env.SHOPIFY_STORE_DOMAIN ?? '')
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '');
const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN?.trim();
const publicToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
const token = privateToken || publicToken;
const version = process.env.SHOPIFY_STOREFRONT_API_VERSION?.trim() || '2026-07';

let failures = 0;
const pass = (label, detail = '') => console.log(`PASS  ${label}${detail ? `  (${detail})` : ''}`);
const fail = (label, detail = '') => {
  failures += 1;
  console.log(`FAIL  ${label}${detail ? `\n      ${detail}` : ''}`);
};
const warn = (label, detail = '') =>
  console.log(`WARN  ${label}${detail ? `\n      ${detail}` : ''}`);

console.log('\nShopify Storefront API - diagnostic\n');

if (!domain) fail('SHOPIFY_STORE_DOMAIN is not set.');
else if (!/\.myshopify\.com$/.test(domain))
  warn(
    `SHOPIFY_STORE_DOMAIN is "${domain}".`,
    'The Storefront API wants the *.myshopify.com domain, not the custom one.',
  );
else pass('SHOPIFY_STORE_DOMAIN', domain);

// Length only: the token value is never printed.
if (!token) fail('No Storefront token (SHOPIFY_STOREFRONT_PRIVATE_TOKEN or ..._ACCESS_TOKEN).');
else
  pass(`Storefront token present, ${privateToken ? 'private' : 'public'}`, `${token.length} chars`);

if (!domain || !token) {
  console.log('\nCannot continue without a domain and a token.\n');
  process.exit(1);
}

const endpoint = `https://${domain}/api/${version}/graphql.json`;
const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  ...(privateToken
    ? { 'Shopify-Storefront-Private-Token': privateToken }
    : { 'X-Shopify-Storefront-Access-Token': publicToken }),
};

async function gql(query, variables) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });
  let body = null;
  try {
    body = await response.json();
  } catch {
    // Non-JSON body: the status is the useful part.
  }
  return {
    status: response.status,
    statusText: response.statusText,
    served: response.headers.get('x-shopify-api-version'),
    body,
  };
}

const shop = await gql('{ shop { name paymentSettings { currencyCode countryCode } } }');

if (shop.status === 401 || shop.status === 403) {
  fail(
    `Storefront API rejected the token (HTTP ${shop.status}).`,
    'Regenerate it: Shopify admin > Sales channels > Headless > Storefront API.',
  );
} else if (shop.status !== 200) {
  fail(`Storefront API responded HTTP ${shop.status} ${shop.statusText}.`);
} else if (shop.body?.errors) {
  fail('Storefront API returned GraphQL errors.', JSON.stringify(shop.body.errors).slice(0, 400));
} else {
  pass('Storefront API reachable', `shop "${shop.body.data.shop.name}"`);
  const settings = shop.body.data.shop.paymentSettings;
  pass('Currency / country', `${settings.currencyCode} / ${settings.countryCode}`);
}

if (shop.served && shop.served !== version) {
  fail(
    `Requested API version ${version}, but Shopify served ${shop.served}.`,
    `Shopify downgrades unsupported versions silently. Set SHOPIFY_STOREFRONT_API_VERSION="${shop.served}" or newer.`,
  );
} else if (shop.served) {
  pass('Storefront API version', shop.served);
}

const collections = await gql('{ collections(first: 50) { nodes { handle } } }');
const collectionNodes = collections.body?.data?.collections?.nodes ?? [];
if (collections.body?.errors) {
  fail('Could not read collections.', JSON.stringify(collections.body.errors).slice(0, 300));
} else if (collectionNodes.length === 0) {
  fail(
    'No collections are visible to the Storefront API.',
    'Every /comprar/<handle> page will 404, and the home page hides its collections band.\n' +
      '      Create the collections in Shopify admin and publish each to the Headless channel.',
  );
} else {
  pass(
    `Collections visible: ${collectionNodes.length}`,
    collectionNodes.map((node) => node.handle).join(', '),
  );
}

const products = await gql(
  '{ products(first: 100) { nodes { handle availableForSale featuredImage { url } } } }',
);
const productNodes = products.body?.data?.products?.nodes ?? [];

if (products.body?.errors) {
  fail('Could not read products.', JSON.stringify(products.body.errors).slice(0, 300));
} else if (productNodes.length === 0) {
  fail(
    'No products are published to the Headless sales channel.',
    'A product can be Active in admin and still be invisible here.\n' +
      '      Open the product > Publishing > tick the Headless channel.',
  );
} else {
  pass(`Products published to Headless: ${productNodes.length}`);

  const noImage = productNodes.filter((node) => !node.featuredImage);
  if (noImage.length)
    warn(`${noImage.length} product(s) have no image.`, noImage.map((n) => n.handle).join(', '));

  const soldOut = productNodes.filter((node) => !node.availableForSale);
  if (soldOut.length)
    warn(
      `${soldOut.length} product(s) are not available for sale.`,
      soldOut.map((n) => n.handle).join(', '),
    );
}

const wantedHandle = process.argv[2];
if (wantedHandle) {
  const single = await gql('query($handle: String!) { product(handle: $handle) { title } }', {
    handle: wantedHandle,
  });
  if (single.body?.data?.product)
    pass(`Handle "${wantedHandle}" resolves`, single.body.data.product.title);
  else
    fail(
      `Handle "${wantedHandle}" does not resolve.`,
      'Check it exists, is Active, is published to Headless, and that the handle matches exactly.',
    );
}

const cart = await gql(
  'mutation { cartCreate(input: {}) { cart { checkoutUrl } userErrors { message } } }',
);
const created = cart.body?.data?.cartCreate;
if (created?.cart?.checkoutUrl) {
  pass('Cart API works', 'checkout URL issued');
  if (new URL(created.cart.checkoutUrl).host.endsWith('.myshopify.com'))
    warn(
      'Checkout points at the myshopify.com domain.',
      'Fine for testing. If the store is password-protected, customers land on the\n' +
        '      password page instead of checkout - remove it before launch.',
    );
} else {
  fail(
    'Cart could not be created.',
    JSON.stringify(created?.userErrors ?? cart.body?.errors ?? {}).slice(0, 300),
  );
}

console.log(
  failures === 0
    ? '\nShopify integration looks healthy.\n'
    : `\n${failures} problem(s) found. Fix the FAIL lines above.\n`,
);
process.exit(failures === 0 ? 0 : 1);
