import { CART_FRAGMENTS } from './fragments';

/** Shopify returns `userErrors` on every cart mutation; the adapter surfaces
 *  them as CommerceError rather than silently returning a stale cart. */
const USER_ERRORS = /* GraphQL */ `
  userErrors {
    field
    message
  }
`;

export const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ...CartFields
      }
      ${USER_ERRORS}
    }
  }
  ${CART_FRAGMENTS}
`;

export const CART_LINES_ADD = /* GraphQL */ `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      ${USER_ERRORS}
    }
  }
  ${CART_FRAGMENTS}
`;

export const CART_LINES_UPDATE = /* GraphQL */ `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      ${USER_ERRORS}
    }
  }
  ${CART_FRAGMENTS}
`;

export const CART_LINES_REMOVE = /* GraphQL */ `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      ${USER_ERRORS}
    }
  }
  ${CART_FRAGMENTS}
`;
