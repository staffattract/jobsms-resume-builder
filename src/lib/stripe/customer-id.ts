export function stripeCustomerIdFromSessionLike(
  customer: string | { id?: string } | null | undefined,
): string | null {
  if (!customer) {
    return null;
  }
  if (typeof customer === "string") {
    return customer;
  }
  return customer.id ?? null;
}
