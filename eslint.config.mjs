import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "src/generated/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["src/**/*"],
    ignores: [
      "src/auth/**/*",
      "src/app/sign-in/**/*",
      "src/app/sign-up/**/*",
      "src/app/layout.tsx",
      "src/proxy.ts"
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@clerk/nextjs",
              message: "Imports from @clerk/nextjs are only allowed within src/auth/."
            },
            {
              name: "@clerk/nextjs/server",
              message: "Imports from @clerk/nextjs/server are only allowed within src/auth/."
            }
          ]
        }
      ],
      // Prevent direct role comparisons outside src/auth/.
      // Business logic must authorize via requirePermission() or hasPermission(), never via role strings.
      // ✅ Allowed: requirePermission(user, Permission.ADMIN_ACCESS)
      // ❌ Forbidden: if (user.role === "ADMIN") { ... }
      "no-restricted-syntax": [
        "error",
        {
          selector: "BinaryExpression > MemberExpression[property.name='role']",
          message:
            "Never compare user.role directly. Use requirePermission(user, Permission.X) or hasPermission({ role }, Permission.X) from @/auth instead."
        }
      ]
    }
  },
  {
    files: ["src/**/*"],
    ignores: [
      "src/audit/**/*",
      "src/auth/**/*"
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/audit/prisma-audit-logger", "**/audit/logger"],
              message: "Direct imports from prisma-audit-logger or logger are restricted outside of src/audit/. Use createAuditedAction instead."
            }
          ]
        }
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[object.name='prisma'][property.name='auditLog']",
          message: "Do not access prisma.auditLog directly. Use createAuditedAction instead."
        },
        {
          selector: "CallExpression[callee.name='getAuditLogger']",
          message: "Do not call getAuditLogger() directly outside of src/audit/. Use createAuditedAction instead."
        },
        {
          selector: "CallExpression[callee.name='requirePermission']",
          message: "Do not call requirePermission() directly outside of src/audit/ or src/auth/. Use createAuditedAction instead."
        }
      ]
    }
  }
];

export default eslintConfig;

