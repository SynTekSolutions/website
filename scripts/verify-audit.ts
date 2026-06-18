import ts from "typescript";
import fs from "fs";
import path from "path";

const srcDir = path.resolve(process.cwd(), "src");
const typesFilePath = path.join(srcDir, "audit", "types.ts");
const errors: string[] = [];
const warnings: string[] = [];

// Helper to recursively collect all ts/tsx files in a directory
function collectFiles(dir: string): string[] {
  let files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Exclude generated files
      if (entry.name !== "generated" && entry.name !== "node_modules") {
        files = files.concat(collectFiles(fullPath));
      }
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      files.push(fullPath);
    }
  }
  return files;
}

// Helper to extract static string value from an expression (e.g. "product.create" or AuditAction.PRODUCT_CREATE)
function getStaticValueText(expr: ts.Expression): string | undefined {
  if (ts.isStringLiteral(expr)) {
    return expr.text;
  }
  if (ts.isPropertyAccessExpression(expr)) {
    return expr.getText();
  }
  return undefined;
}

// Maps static AuditAction values to their Enum names
function getPropNameForValue(actionVal: string): string | undefined {
  // e.g. "product.create" -> "PRODUCT_CREATE"
  const mappings: Record<string, string> = {
    "product.create": "PRODUCT_CREATE",
    "product.update": "PRODUCT_UPDATE",
    "product.delete": "PRODUCT_DELETE",
    "order.create": "ORDER_CREATE",
    "order.update": "ORDER_UPDATE",
    "order.cancel": "ORDER_CANCEL",
    "customer.create": "CUSTOMER_CREATE",
    "customer.update": "CUSTOMER_UPDATE",
    "customer.delete": "CUSTOMER_DELETE",
    "contact.create": "CONTACT_CREATE",
    "contact.update": "CONTACT_UPDATE",
    "contact.delete": "CONTACT_DELETE",
    "user.create": "USER_CREATE",
    "user.update": "USER_UPDATE",
    "user.delete": "USER_DELETE",
    "user.login": "USER_LOGIN",
    "user.logout": "USER_LOGOUT",
    "user.permission_denied": "user.permission_denied",
    "admin.access": "ADMIN_ACCESS",
  };
  return mappings[actionVal];
}

// Validates coherence between AuditAction and AuditOperation
function validateCoherence(action: string, operation: string, filePath: string, handlerName: string) {
  const actionName = action.split(".").pop() || "";
  const operationName = operation.split(".").pop() || "";

  if (actionName.endsWith("_CREATE") || actionName === "create") {
    if (operationName !== "CREATE") {
      errors.push(`${filePath}: [${handlerName}] incoherent pairing: action '${action}' resolves to CREATE, but operation is '${operation}'.`);
    }
  } else if (actionName.endsWith("_UPDATE") || actionName === "update") {
    if (operationName !== "UPDATE") {
      errors.push(`${filePath}: [${handlerName}] incoherent pairing: action '${action}' resolves to UPDATE, but operation is '${operation}'.`);
    }
  } else if (actionName.endsWith("_DELETE") || actionName === "delete") {
    if (operationName !== "DELETE") {
      errors.push(`${filePath}: [${handlerName}] incoherent pairing: action '${action}' resolves to DELETE, but operation is '${operation}'.`);
    }
  } else if (actionName === "ADMIN_ACCESS" || actionName === "access") {
    if (operationName !== "READ") {
      errors.push(`${filePath}: [${handlerName}] incoherent pairing: action '${action}' resolves to READ, but operation is '${operation}'.`);
    }
  }
}

// Validates the arguments passed to createAuditedAction
function checkAuditConfig(config: ts.ObjectLiteralExpression, filePath: string, handlerName: string) {
  let actionProp: ts.PropertyAssignment | undefined;
  let operationProp: ts.PropertyAssignment | undefined;
  let resourceTypeProp: ts.PropertyAssignment | undefined;
  let getResourceIdProp: ts.PropertyAssignment | undefined;
  let shouldAuditProp: ts.PropertyAssignment | undefined;

  for (const prop of config.properties) {
    if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
      const propName = prop.name.text;
      if (propName === "action") actionProp = prop;
      else if (propName === "operation") operationProp = prop;
      else if (propName === "resourceType") resourceTypeProp = prop;
      else if (propName === "getResourceId") getResourceIdProp = prop;
      else if (propName === "shouldAudit") shouldAuditProp = prop;
    }
  }

  if (!actionProp) {
    errors.push(`${filePath}: [${handlerName}] missing mandatory 'action' property.`);
  }
  if (!operationProp) {
    errors.push(`${filePath}: [${handlerName}] missing mandatory 'operation' property.`);
  }
  if (!resourceTypeProp) {
    errors.push(`${filePath}: [${handlerName}] missing mandatory 'resourceType' property.`);
  }
  if (!getResourceIdProp) {
    errors.push(`${filePath}: [${handlerName}] missing mandatory 'getResourceId' property.`);
  }

  // Coherence validation between action and operation
  if (actionProp && operationProp) {
    const actionText = getStaticValueText(actionProp.initializer);
    const operationText = getStaticValueText(operationProp.initializer);
    if (actionText && operationText) {
      validateCoherence(actionText, operationText, filePath, handlerName);
    }
  }

  // shouldAudit: () => false bypass checks
  if (shouldAuditProp) {
    const initText = shouldAuditProp.initializer.getText().replace(/\s/g, "");
    const isAlwaysFalse = initText === "()=>false" || initText === "function(){returnfalse;}";
    if (isAlwaysFalse) {
      const isPermitted = filePath.includes("healthcheck") || filePath.includes("status");
      if (!isPermitted) {
        errors.push(`${filePath}: [${handlerName}] permanently disabling audits via 'shouldAudit: () => false' is forbidden.`);
      }
    }
  }
}

// Scans route handlers to make sure they are wrapped in createAuditedAction
function checkRouteHandlerAudit(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  // Exclude webhook files which don't have user session context
  if (filePath.includes(path.join("api", "webhooks"))) {
    return;
  }

  let routeHandlersCount = 0;
  let wrappedHandlersCount = 0;

  function visit(node: ts.Node) {
    if (ts.isVariableStatement(node)) {
      const isExported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
      if (isExported) {
        for (const decl of node.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) {
            const name = decl.name.text;
            if (["GET", "POST", "PUT", "DELETE", "PATCH"].includes(name)) {
              routeHandlersCount++;
              
              if (decl.initializer && ts.isCallExpression(decl.initializer)) {
                const callee = decl.initializer.expression;
                if (ts.isIdentifier(callee) && callee.text === "createAuditedAction") {
                  wrappedHandlersCount++;
                  const configArg = decl.initializer.arguments[0];
                  if (configArg && ts.isObjectLiteralExpression(configArg)) {
                    checkAuditConfig(configArg, filePath, name);
                  } else {
                    errors.push(`${filePath}: ${name} handler must pass an object literal to createAuditedAction.`);
                  }
                }
              }
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  if (routeHandlersCount > 0 && wrappedHandlersCount !== routeHandlersCount) {
    errors.push(`${filePath}: Found ${routeHandlersCount} route handler(s) but only ${wrappedHandlersCount} wrapped in createAuditedAction.`);
  }
}

// Scans files for direct calls or imports bypassing the wrapper
function checkBypassRestrictions(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");

  // Prevent comment-based bypass of rules
  if (content.includes("eslint-disable") && (content.includes("no-restricted-syntax") || content.includes("no-restricted-imports"))) {
    errors.push(`${filePath}: manual eslint-disable comments bypassing audit rules are forbidden.`);
  }

  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      if (ts.isIdentifier(callee)) {
        if (callee.text === "requirePermission") {
          errors.push(`${filePath}: direct call to requirePermission() is forbidden outside of src/audit/ and src/auth/. Use createAuditedAction wrapper instead.`);
        }
        if (callee.text === "getAuditLogger") {
          errors.push(`${filePath}: direct call to getAuditLogger() is forbidden outside of src/audit/. Use createAuditedAction wrapper instead.`);
        }
      }
    }

    if (ts.isPropertyAccessExpression(node)) {
      const obj = node.expression;
      const prop = node.name;
      if (ts.isIdentifier(obj) && obj.text === "prisma" && ts.isIdentifier(prop) && prop.text === "auditLog") {
        errors.push(`${filePath}: direct database write to prisma.auditLog is forbidden outside of src/audit/. Use createAuditedAction wrapper instead.`);
      }
    }

    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier;
      if (ts.isStringLiteral(moduleSpecifier)) {
        if (moduleSpecifier.text.includes("prisma-audit-logger")) {
          errors.push(`${filePath}: direct import of prisma-audit-logger is forbidden outside of src/audit/. Use createAuditedAction wrapper instead.`);
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

// Collects all declared actions in types.ts
function collectDefinedAuditActions(filePath: string): Set<string> {
  const actions = new Set<string>();
  if (!fs.existsSync(filePath)) return actions;

  const content = fs.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  function visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === "AuditAction") {
      if (node.initializer && ts.isAsExpression(node.initializer)) {
        const objExpr = node.initializer.expression;
        if (ts.isObjectLiteralExpression(objExpr)) {
          for (const prop of objExpr.properties) {
            if (ts.isPropertyAssignment(prop) && ts.isStringLiteral(prop.initializer)) {
              actions.add(prop.initializer.text);
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return actions;
}

// Main verification routine
function main() {
  console.log("Starting AST Audit Verification script...");
  const files = collectFiles(srcDir);
  const definedActions = collectDefinedAuditActions(typesFilePath);
  const usedActions = new Set<string>();

  for (const file of files) {
    const isInsideAudit = file.includes(path.join("src", "audit"));
    const isInsideAuth = file.includes(path.join("src", "auth"));

    // 1. Check bypass restrictions on all files outside audit/auth
    if (!isInsideAudit && !isInsideAuth) {
      checkBypassRestrictions(file);
    }

    // 2. Check route handler compliance
    if (file.includes(path.join("src", "app", "api")) && file.endsWith("route.ts")) {
      checkRouteHandlerAudit(file);
    }

    // 3. Track used AuditActions
    if (file !== typesFilePath) {
      const content = fs.readFileSync(file, "utf-8");
      for (const action of definedActions) {
        const propName = getPropNameForValue(action);
        if (content.includes(action) || (propName && content.includes(`AuditAction.${propName}`))) {
          usedActions.add(action);
        }
      }
    }
  }

  // 4. Report orphaned actions (actions declared but never used in routes or tests)
  for (const action of definedActions) {
    if (!usedActions.has(action)) {
      // Report as warning for now to avoid failing build during incremental updates,
      // but log it clearly to highlight dead code.
      warnings.push(`Orphaned AuditAction detected: "${action}" is defined in types.ts but not referenced anywhere in the codebase.`);
    }
  }

  // Print results
  if (warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    warnings.forEach(w => console.warn(`  - ${w}`));
  }

  if (errors.length > 0) {
    console.error("\n❌ AST Audit Verification failed with the following errors:");
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  } else {
    console.log("\n✅ AST Audit Verification passed successfully!");
    process.exit(0);
  }
}

main();
