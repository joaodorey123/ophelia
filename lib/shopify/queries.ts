import {
  CART_FRAGMENTS,
  COLLECTION_FRAGMENTS,
  IMAGE_FRAGMENT,
  MONEY_FRAGMENT,
  PRODUCT_FRAGMENT,
  PRODUCT_FRAGMENTS,
  VARIANT_FRAGMENT,
} from './fragments';

export const GET_PRODUCT = /* GraphQL */ `
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
  ${PRODUCT_FRAGMENTS}
`;

export const GET_PRODUCTS = /* GraphQL */ `
  query GetProducts($first: Int!, $sortKey: ProductSortKeys, $reverse: Boolean, $query: String, $after: String) {
    products(first: $first, sortKey: $sortKey, reverse: $reverse, query: $query, after: $after) {
      nodes {
        ...ProductFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${PRODUCT_FRAGMENTS}
`;

export const GET_PRODUCT_HANDLES = /* GraphQL */ `
  query GetProductHandles($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes {
        handle
        updatedAt
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * Shopify's own related-products engine. `intent: RELATED` is the merchandising
 * recommendation; it returns an empty list on a small or new catalogue, which
 * the adapter treats as "no recommendation", not as an error.
 */
export const GET_PRODUCT_RECOMMENDATIONS = /* GraphQL */ `
  query GetProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId, intent: RELATED) {
      ...ProductFields
    }
  }
  ${PRODUCT_FRAGMENTS}
`;

export const GET_COLLECTION = /* GraphQL */ `
  query GetCollection($handle: String!) {
    collection(handle: $handle) {
      ...CollectionFields
    }
  }
  ${COLLECTION_FRAGMENTS}
`;

export const GET_COLLECTION_PRODUCTS = /* GraphQL */ `
  query GetCollectionProducts(
    $handle: String!
    $first: Int!
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $after: String
  ) {
    collection(handle: $handle) {
      ...CollectionFields
      products(first: $first, sortKey: $sortKey, reverse: $reverse, after: $after) {
        nodes {
          ...ProductFields
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${VARIANT_FRAGMENT}
  ${PRODUCT_FRAGMENT}
  fragment CollectionFields on Collection {
    id
    handle
    title
    description
    descriptionHtml
    updatedAt
    seo {
      title
      description
    }
    image {
      ...ImageFields
    }
  }
`;

export const GET_COLLECTIONS = /* GraphQL */ `
  query GetCollections($first: Int!) {
    collections(first: $first) {
      nodes {
        ...CollectionFields
      }
    }
  }
  ${COLLECTION_FRAGMENTS}
`;

export const SEARCH_PRODUCTS = /* GraphQL */ `
  query SearchProducts($query: String!, $first: Int!) {
    search(query: $query, first: $first, types: PRODUCT, unavailableProducts: LAST) {
      nodes {
        ... on Product {
          ...ProductFields
        }
      }
    }
  }
  ${PRODUCT_FRAGMENTS}
`;

export const GET_CART = /* GraphQL */ `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
  ${CART_FRAGMENTS}
`;
