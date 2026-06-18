/**
 * The complete vocabulary of permissions in the system.
 *
 * Rules (enforced by ESLint):
 * - Business logic must authorize via Permission values, never via Role strings.
 * - No module outside src/auth/ may inspect user.role directly.
 */
export enum Permission {
  // Products
  PRODUCT_READ = "products:read",
  PRODUCT_WRITE = "products:write",
  PRODUCT_DELETE = "products:delete",

  // Orders
  ORDER_READ = "orders:read",
  ORDER_WRITE = "orders:write",

  // Customers
  CUSTOMER_READ = "customers:read",
  CUSTOMER_WRITE = "customers:write",

  // Administration
  ADMIN_ACCESS = "admin:access",
}
