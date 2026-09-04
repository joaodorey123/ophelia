/**
 * Reusable GraphQL fragments. Every query composes these so the shapes the
 * transform layer receives stay identical across operations.
 */

export const IMAGE_FRAGMENT = /* GraphQL */ `
  fragment ImageFields on Image {
    url
    altText
    width
    height
  }
`;

export const MONEY_FRAGMENT = /* GraphQL */ `
  fragment MoneyFields on MoneyV2 {
    amount
    currencyCode
  }
`;

export const VARIANT_FRAGMENT = /* GraphQL */ `
  fragment VariantFields on ProductVariant {
    id
    title
    availableForSale
    quantityAvailable
    sku
    selectedOptions {
      name
      value
    }
    price {
      ...MoneyFields
    }
    compareAtPrice {
      ...MoneyFields
    }
    image {
      ...ImageFields
    }
  }
`;

/**
 * Editorial metafields live in the `ophelia` namespace. They are optional:
 * an unset metafield returns null and the UI omits the block.
 * See docs/SHOPIFY.md for the definitions to create.
 */
export const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    productType
    vendor
    tags
    availableForSale
    updatedAt
    seo {
      title
      description
    }
    featuredImage {
      ...ImageFields
    }
    images(first: 10) {
      nodes {
        ...ImageFields
      }
    }
    options {
      id
      name
      optionValues {
        name
      }
    }
    priceRange {
      minVariantPrice {
        ...MoneyFields
      }
      maxVariantPrice {
        ...MoneyFields
      }
    }
    variants(first: 100) {
      nodes {
        ...VariantFields
      }
    }
    kicker: metafield(namespace: "ophelia", key: "kicker") {
      value
    }
    badge: metafield(namespace: "ophelia", key: "badge") {
      value
    }
    shortDescription: metafield(namespace: "ophelia", key: "short_description") {
      value
    }
    ingredients: metafield(namespace: "ophelia", key: "ingredients") {
      value
    }
  }
`;

export const COLLECTION_FRAGMENT = /* GraphQL */ `
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

export const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        ...MoneyFields
      }
      totalAmount {
        ...MoneyFields
      }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        attributes {
          key
          value
        }
        cost {
          totalAmount {
            ...MoneyFields
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            selectedOptions {
              name
              value
            }
            image {
              ...ImageFields
            }
            product {
              id
              handle
              title
            }
          }
        }
      }
    }
  }
`;

/** Fragment bundles, so each operation declares exactly what it composes. */
export const PRODUCT_FRAGMENTS = [
  IMAGE_FRAGMENT,
  MONEY_FRAGMENT,
  VARIANT_FRAGMENT,
  PRODUCT_FRAGMENT,
].join('\n');

export const COLLECTION_FRAGMENTS = [IMAGE_FRAGMENT, COLLECTION_FRAGMENT].join('\n');

export const CART_FRAGMENTS = [IMAGE_FRAGMENT, MONEY_FRAGMENT, CART_FRAGMENT].join('\n');
