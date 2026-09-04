import 'server-only';

import { getCustomerAccountConfig } from '@/lib/commerce/config';

import { readAccessToken } from './session';

/**
 * Customer Account API reads.
 *
 * Every call is `no-store`: customer data must never enter a shared cache.
 */

const API_VERSION = '2025-07';

export type CustomerProfile = {
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  emailAddress: string | null;
};

export type CustomerOrder = {
  id: string;
  name: string;
  processedAt: string;
  statusPageUrl: string | null;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  total: { amount: string; currencyCode: string };
  lineItems: { title: string; quantity: number }[];
};

async function customerGraphQL<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
  const config = getCustomerAccountConfig();
  const token = await readAccessToken();
  if (!config || !token) return null;

  const response = await fetch(`${config.apiUrl}/account/customer/api/${API_VERSION}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });

  if (!response.ok) return null;

  const body = (await response.json()) as { data?: T; errors?: unknown[] };
  if (body.errors?.length || !body.data) return null;
  return body.data;
}

const CUSTOMER_QUERY = /* GraphQL */ `
  query Customer {
    customer {
      firstName
      lastName
      displayName
      emailAddress {
        emailAddress
      }
    }
  }
`;

const ORDERS_QUERY = /* GraphQL */ `
  query Orders($first: Int!) {
    customer {
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          statusPageUrl
          financialStatus
          fulfillments(first: 1) {
            nodes {
              status
            }
          }
          totalPrice {
            amount
            currencyCode
          }
          lineItems(first: 20) {
            nodes {
              title
              quantity
            }
          }
        }
      }
    }
  }
`;

export async function getCustomer(): Promise<CustomerProfile | null> {
  const data = await customerGraphQL<{
    customer: {
      firstName: string | null;
      lastName: string | null;
      displayName: string;
      emailAddress: { emailAddress: string } | null;
    } | null;
  }>(CUSTOMER_QUERY);

  if (!data?.customer) return null;

  return {
    firstName: data.customer.firstName,
    lastName: data.customer.lastName,
    displayName: data.customer.displayName,
    emailAddress: data.customer.emailAddress?.emailAddress ?? null,
  };
}

export async function getOrders(first = 20): Promise<CustomerOrder[] | null> {
  const data = await customerGraphQL<{
    customer: {
      orders: {
        nodes: {
          id: string;
          name: string;
          processedAt: string;
          statusPageUrl: string | null;
          financialStatus: string | null;
          fulfillments: { nodes: { status: string }[] };
          totalPrice: { amount: string; currencyCode: string };
          lineItems: { nodes: { title: string; quantity: number }[] };
        }[];
      };
    } | null;
  }>(ORDERS_QUERY, { first });

  if (!data?.customer) return null;

  return data.customer.orders.nodes.map((order) => ({
    id: order.id,
    name: order.name,
    processedAt: order.processedAt,
    statusPageUrl: order.statusPageUrl,
    financialStatus: order.financialStatus,
    fulfillmentStatus: order.fulfillments.nodes[0]?.status ?? null,
    total: order.totalPrice,
    lineItems: order.lineItems.nodes,
  }));
}
