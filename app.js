"use strict";

const STAGES = [
  {
    name: "Intent Extraction",
    detail: "Normalize product type, features, constraints, ambiguity, and assumptions.",
  },
  {
    name: "System Design",
    detail: "Infer entities, roles, user flows, and relationships from the intent.",
  },
  {
    name: "Schema Generation",
    detail: "Create UI, API, database, auth, and business rule contracts.",
  },
  {
    name: "Validation",
    detail: "Check JSON shape, required fields, types, and cross-layer references.",
  },
  {
    name: "Targeted Repair",
    detail: "Patch only failed layers while preserving valid compiler output.",
  },
  {
    name: "Runtime Execution",
    detail: "Render executable UI from the final application configuration.",
  },
];

const EXAMPLES = [
  "Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins can see analytics.",
  "Create a food delivery app with restaurants, menus, carts, order tracking, driver assignment, payments, and admin refunds.",
  "Make a task manager for teams with projects, comments, due dates, file attachments, and manager-only reports.",
  "Build a fitness tracker with workouts, nutrition logs, progress charts, wearable sync, and premium coaching.",
  "I need an ecommerce admin for inventory, orders, coupons, customer support, and revenue analytics.",
  "A booking system for salons with staff calendars, deposits, SMS reminders, and no-show penalties.",
  "Create a learning platform with courses, quizzes, certificates, instructor dashboards, and paid enrollments.",
  "Build an event ticketing app with venues, seating, QR check-in, refunds, and organizer analytics.",
  "Make a helpdesk with tickets, SLAs, agents, canned replies, escalations, and customer satisfaction scores.",
  "Create a real estate CRM with listings, leads, viewings, offers, agent roles, and premium market reports.",
  "Build something for my business.",
  "Create a CRM but do not store contacts; contacts must be searchable and editable.",
  "Make an app with admin analytics, but no users or login.",
  "Build a marketplace with sellers, products, checkout, and payments, but everything should be free.",
  "Create a dashboard.",
  "Make a healthcare app with patient records and let every user see everything.",
  "Build a finance tracker with transactions, budgets, bank sync, and no authentication.",
  "Create an app for schools with students, grades, attendance, parent access, and teacher roles.",
  "Make a subscription app with premium content, payments, refunds, and guest checkout.",
  "Build a project management app, then remove projects but keep project reports.",
];

const FEATURE_CATALOG = [
  {
    key: "authentication",
    terms: ["login", "auth", "sign in", "users", "account", "authentication"],
    entity: "User",
    pages: ["Login", "Account"],
  },
  {
    key: "contacts",
    terms: ["contacts", "leads", "customers", "crm"],
    entity: "Contact",
    pages: ["Contacts"],
  },
  {
    key: "analytics",
    terms: ["analytics", "reports", "dashboard", "charts", "metrics"],
    entity: "AnalyticsEvent",
    pages: ["Dashboard", "Analytics"],
  },
  {
    key: "payments",
    terms: ["payment", "payments", "checkout", "subscription", "premium", "paid", "deposits", "refunds"],
    entity: "Payment",
    pages: ["Billing"],
  },
  {
    key: "roles",
    terms: ["role", "roles", "admin", "manager", "agent", "teacher", "parent", "instructor", "organizer", "driver", "seller"],
    entity: "RoleAssignment",
    pages: ["Access Control"],
  },
  {
    key: "orders",
    terms: ["order", "orders", "cart", "delivery", "driver", "refund"],
    entity: "Order",
    pages: ["Orders"],
  },
  {
    key: "products",
    terms: ["product", "products", "inventory", "menu", "menus", "listings", "ticket", "tickets"],
    entity: "Item",
    pages: ["Catalog"],
  },
  {
    key: "tasks",
    terms: ["task", "tasks", "project", "projects", "comments", "due dates", "sla", "tickets"],
    entity: "Task",
    pages: ["Work Queue"],
  },
  {
    key: "booking",
    terms: ["booking", "calendar", "appointment", "staff", "reminders", "viewings"],
    entity: "Booking",
    pages: ["Schedule"],
  },
  {
    key: "learning",
    terms: ["course", "courses", "quiz", "quizzes", "certificate", "student", "grades", "attendance"],
    entity: "Course",
    pages: ["Learning"],
  },
  {
    key: "fitness",
    terms: ["fitness", "workout", "workouts", "nutrition", "wearable", "coaching"],
    entity: "Workout",
    pages: ["Progress"],
  },
  {
    key: "files",
    terms: ["file", "files", "attachments", "documents"],
    entity: "FileAsset",
    pages: ["Files"],
  },
];

const BASE_FIELDS = {
  User: [
    ["id", "uuid", true],
    ["email", "email", true],
    ["name", "string", true],
    ["role", "enum", true],
  ],
  Contact: [
    ["id", "uuid", true],
    ["name", "string", true],
    ["email", "email", false],
    ["status", "enum", true],
    ["ownerId", "uuid", true],
  ],
  AnalyticsEvent: [
    ["id", "uuid", true],
    ["eventName", "string", true],
    ["actorId", "uuid", false],
    ["createdAt", "datetime", true],
  ],
  Payment: [
    ["id", "uuid", true],
    ["userId", "uuid", true],
    ["amount", "number", true],
    ["status", "enum", true],
    ["providerRef", "string", false],
  ],
  RoleAssignment: [
    ["id", "uuid", true],
    ["userId", "uuid", true],
    ["role", "enum", true],
  ],
  Order: [
    ["id", "uuid", true],
    ["customerId", "uuid", true],
    ["status", "enum", true],
    ["total", "number", true],
  ],
  Item: [
    ["id", "uuid", true],
    ["name", "string", true],
    ["price", "number", false],
    ["status", "enum", true],
  ],
  Task: [
    ["id", "uuid", true],
    ["title", "string", true],
    ["status", "enum", true],
    ["assigneeId", "uuid", false],
    ["dueAt", "datetime", false],
  ],
  Booking: [
    ["id", "uuid", true],
    ["customerId", "uuid", true],
    ["scheduledAt", "datetime", true],
    ["status", "enum", true],
  ],
  Course: [
    ["id", "uuid", true],
    ["title", "string", true],
    ["instructorId", "uuid", true],
    ["published", "boolean", true],
  ],
  Workout: [
    ["id", "uuid", true],
    ["userId", "uuid", true],
    ["activity", "string", true],
    ["durationMinutes", "number", true],
  ],
  FileAsset: [
    ["id", "uuid", true],
    ["ownerId", "uuid", true],
    ["url", "url", true],
    ["mimeType", "string", true],
  ],
};

const state = {
  lastResult: null,
};

const stageGrid = document.querySelector("#stageGrid");
const promptInput = document.querySelector("#promptInput");
const exampleSelect = document.querySelector("#exampleSelect");
const compileButton = document.querySelector("#compileButton");
const runEvalButton = document.querySelector("#runEval");
const jsonOutput = document.querySelector("#jsonOutput");
const validationLog = document.querySelector("#validationLog");
const statusPill = document.querySelector("#statusPill");
const runtimePreview = document.querySelector("#runtimePreview");
const runtimeTitle = document.querySelector("#runtimeTitle");
const runtimeHealth = document.querySelector("#runtimeHealth");
const metrics = document.querySelector("#metrics");
const copyJson = document.querySelector("#copyJson");

function init() {
  stageGrid.innerHTML = STAGES.map(
    (stage, index) => `
      <article class="stage-card">
        <strong>${index + 1}</strong>
        <h3>${stage.name}</h3>
        <p>${stage.detail}</p>
      </article>
    `,
  ).join("");

  exampleSelect.innerHTML = EXAMPLES.map(
    (example, index) => `<option value="${index}">Example ${index + 1}: ${summarize(example)}</option>`,
  ).join("");

  exampleSelect.addEventListener("change", () => {
    promptInput.value = EXAMPLES[Number(exampleSelect.value)];
    compile();
  });

  compileButton.addEventListener("click", compile);
  runEvalButton.addEventListener("click", runEvaluation);
  copyJson.addEventListener("click", async () => {
    if (!state.lastResult) return;
    await navigator.clipboard.writeText(JSON.stringify(state.lastResult.config, null, 2));
    copyJson.textContent = "Copied";
    setTimeout(() => {
      copyJson.textContent = "Copy JSON";
    }, 1100);
  });

  compile();
}

function compile() {
  const result = compilePrompt(promptInput.value);
  state.lastResult = result;
  renderResult(result);
}

function compilePrompt(prompt) {
  const start = performance.now();
  const trace = [];
  const intent = extractIntent(prompt, trace);
  const architecture = designSystem(intent, trace);
  const draft = generateSchemas(intent, architecture, trace);
  const validationBeforeRepair = validateConfig(draft);
  const repaired = repairConfig(draft, validationBeforeRepair, trace);
  const validationAfterRepair = validateConfig(repaired);
  const executable = validationAfterRepair.errors.length === 0;
  const latencyMs = Math.round(performance.now() - start);

  return {
    trace,
    validationBeforeRepair,
    validationAfterRepair,
    config: {
      compilerVersion: "1.0.0",
      generatedAt: new Date().toISOString(),
      deterministicSignature: hashPrompt(prompt),
      executable,
      intent,
      architecture,
      ...repaired,
      execution: {
        runtime: "static-html-runtime",
        entryPage: repaired.ui.pages[0]?.id || "dashboard",
        checks: validationAfterRepair.errors.length === 0 ? ["schema-valid", "cross-layer-valid", "renderable"] : ["blocked"],
      },
      metrics: {
        latencyMs,
        repairCount: trace.filter((entry) => entry.type === "repair").length,
        validationErrors: validationAfterRepair.errors.length,
        validationWarnings: validationAfterRepair.warnings.length,
      },
    },
  };
}

function extractIntent(prompt, trace) {
  const normalized = prompt.trim().replace(/\s+/g, " ");
  const lower = normalized.toLowerCase();
  const features = FEATURE_CATALOG.filter((item) => item.terms.some((term) => lower.includes(term))).map((item) => item.key);
  const productType = detectProductType(lower, features);
  const roles = detectRoles(lower, features);
  const assumptions = [];
  const conflicts = [];
  const ambiguities = [];

  if (!normalized || normalized.length < 28) {
    ambiguities.push("Prompt is underspecified; generated a minimal internal tool scaffold.");
    assumptions.push("Defaulted to dashboard, authentication, and admin role.");
  }

  if (features.includes("payments") && /\bfree\b|no payments|without payment/.test(lower)) {
    conflicts.push("Payments were requested alongside a free/no-payment constraint.");
    assumptions.push("Kept payment schema but added business rule that checkout is optional.");
  }

  if (features.includes("contacts") && /do not store contacts|no contacts/.test(lower)) {
    conflicts.push("Contacts are both required and disallowed.");
    assumptions.push("Modeled contacts as external references with editable metadata only.");
  }

  if ((features.includes("analytics") || features.includes("roles")) && !features.includes("authentication") && /no authentication|no login|no users/.test(lower)) {
    conflicts.push("Protected analytics or role behavior requires identity, but authentication was denied.");
    assumptions.push("Added lightweight guest identity with admin-only elevated routes disabled by default.");
  }

  if (features.length === 0) {
    features.push("authentication", "analytics");
  }

  if ((features.includes("roles") || features.includes("payments")) && !features.includes("authentication")) {
    features.unshift("authentication");
    assumptions.push("Added authentication because roles or payments need identity.");
  }

  trace.push({
    stage: "Intent Extraction",
    type: ambiguities.length || conflicts.length ? "repair" : "ok",
    message: `Detected ${productType} with ${features.length} feature groups.`,
  });

  return {
    rawPrompt: normalized,
    appType: productType,
    features: unique(features),
    constraints: detectConstraints(lower),
    roles,
    assumptions,
    ambiguities,
    conflicts,
  };
}

function designSystem(intent, trace) {
  const entities = unique(
    intent.features
      .map((feature) => FEATURE_CATALOG.find((item) => item.key === feature)?.entity)
      .filter(Boolean),
  );

  if (!entities.includes("User")) entities.unshift("User");

  const flows = unique([
    ...intent.features.map((feature) => humanize(feature)),
    "Data validation",
    "Runtime rendering",
  ]);

  const relationships = entities
    .filter((entity) => entity !== "User")
    .map((entity) => ({
      from: entity,
      to: "User",
      type: entity === "AnalyticsEvent" ? "optional_actor" : "owned_by",
    }));

  trace.push({
    stage: "System Design",
    type: "ok",
    message: `Created ${entities.length} entities, ${intent.roles.length} roles, and ${flows.length} flows.`,
  });

  return {
    entities,
    roles: intent.roles,
    flows,
    relationships,
  };
}

function generateSchemas(intent, architecture, trace) {
  const tables = architecture.entities.map((entity) => ({
    name: entity,
    fields: (BASE_FIELDS[entity] || BASE_FIELDS.Item).map(([name, type, required]) => ({
      name,
      type,
      required,
    })),
  }));

  const apis = tables.flatMap((table) => [
    endpoint("list", table, "GET", `/${kebab(table.name)}`),
    endpoint("create", table, "POST", `/${kebab(table.name)}`),
    endpoint("update", table, "PATCH", `/${kebab(table.name)}/:id`),
  ]);

  const pages = createPages(intent, architecture, tables, apis);
  const auth = {
    provider: intent.constraints.includes("no_authentication") ? "guest-session" : "email-password",
    roles: architecture.roles,
    permissions: createPermissions(architecture.roles, apis),
  };

  const businessLogic = createBusinessRules(intent, tables);

  trace.push({
    stage: "Schema Generation",
    type: "ok",
    message: `Generated ${pages.length} pages, ${apis.length} endpoints, ${tables.length} tables, and ${businessLogic.length} rules.`,
  });

  return {
    ui: { framework: "runtime-components", pages },
    api: { basePath: "/api", endpoints: apis },
    database: { dialect: "portable-json-schema", tables },
    auth,
    businessLogic,
  };
}

function createPages(intent, architecture, tables, apis) {
  const pageNames = unique(
    intent.features.flatMap((feature) => FEATURE_CATALOG.find((item) => item.key === feature)?.pages || []),
  );

  if (!pageNames.includes("Dashboard")) pageNames.unshift("Dashboard");
  if (intent.features.includes("authentication") && !pageNames.includes("Login")) pageNames.unshift("Login");

  return pageNames.map((name) => {
    const targetTable = pickTableForPage(name, tables);
    const fields = targetTable.fields.slice(0, 4).map((field) => field.name);
    const listEndpoint = apis.find((api) => api.entity === targetTable.name && api.action === "list")?.id;
    const createEndpoint = apis.find((api) => api.entity === targetTable.name && api.action === "create")?.id;

    return {
      id: kebab(name),
      title: name,
      route: `/${kebab(name)}`,
      layout: name === "Dashboard" ? "analytics-grid" : "standard",
      components: [
        {
          id: `${kebab(name)}-summary`,
          type: "summary",
          sourceEndpoint: listEndpoint,
          fields,
        },
        {
          id: `${kebab(name)}-form`,
          type: "form",
          sourceEndpoint: createEndpoint,
          fields,
        },
      ],
    };
  });
}

function endpoint(action, table, method, path) {
  const writeMethods = new Set(["POST", "PATCH"]);
  return {
    id: `${action}${table.name}`,
    entity: table.name,
    method,
    path,
    requestFields: writeMethods.has(method) ? table.fields.filter((field) => field.name !== "id") : [],
    responseFields: table.fields,
    validation: table.fields
      .filter((field) => field.required && writeMethods.has(method) && field.name !== "id")
      .map((field) => ({ field: field.name, rule: "required" })),
  };
}

function createPermissions(roles, apis) {
  return roles.map((role) => ({
    role,
    allow: apis
      .filter((api) => role === "Admin" || api.method !== "PATCH")
      .map((api) => api.id),
  }));
}

function createBusinessRules(intent, tables) {
  const rules = [
    {
      id: "runtime_config_must_validate",
      description: "Application cannot execute until schema and cross-layer validation pass.",
      appliesTo: "execution",
    },
  ];

  if (intent.features.includes("payments")) {
    rules.push({
      id: "premium_access_requires_successful_payment",
      description: intent.constraints.includes("free_checkout")
        ? "Premium routes are available without charge, but payment records may exist for audit and refunds."
        : "Premium routes require an active successful payment.",
      appliesTo: "Payment",
    });
  }

  if (intent.features.includes("roles") || intent.roles.includes("Admin")) {
    rules.push({
      id: "analytics_requires_admin",
      description: "Analytics views are visible only to Admin role unless explicitly delegated.",
      appliesTo: tables.some((table) => table.name === "AnalyticsEvent") ? "AnalyticsEvent" : "User",
    });
  }

  if (intent.conflicts.length > 0) {
    rules.push({
      id: "documented_assumptions_required",
      description: "Conflicting or ambiguous requirements are recorded as compiler assumptions.",
      appliesTo: "intent",
    });
  }

  return rules;
}

function validateConfig(config) {
  const errors = [];
  const warnings = [];

  for (const key of ["ui", "api", "database", "auth", "businessLogic"]) {
    if (!config[key]) errors.push(`Missing required top-level key: ${key}`);
  }

  if (!Array.isArray(config.database?.tables)) errors.push("database.tables must be an array.");
  if (!Array.isArray(config.api?.endpoints)) errors.push("api.endpoints must be an array.");
  if (!Array.isArray(config.ui?.pages)) errors.push("ui.pages must be an array.");
  if (!Array.isArray(config.auth?.roles) || config.auth.roles.length === 0) errors.push("auth.roles must include at least one role.");

  const tables = config.database?.tables || [];
  const endpoints = config.api?.endpoints || [];
  const pages = config.ui?.pages || [];
  const tableMap = new Map(tables.map((table) => [table.name, table]));
  const endpointMap = new Map(endpoints.map((endpointItem) => [endpointItem.id, endpointItem]));

  tables.forEach((table) => {
    if (!table.name) errors.push("A database table is missing a name.");
    if (!Array.isArray(table.fields) || table.fields.length === 0) errors.push(`Table ${table.name || "unknown"} has no fields.`);
    const names = new Set();
    table.fields?.forEach((field) => {
      if (names.has(field.name)) errors.push(`Duplicate field ${table.name}.${field.name}.`);
      names.add(field.name);
      if (!field.name || !field.type || typeof field.required !== "boolean") {
        errors.push(`Field ${table.name}.${field.name || "unknown"} is missing name, type, or required flag.`);
      }
    });
  });

  endpoints.forEach((api) => {
    if (!tableMap.has(api.entity)) errors.push(`Endpoint ${api.id} references missing table ${api.entity}.`);
    const tableFields = new Set(tableMap.get(api.entity)?.fields.map((field) => field.name) || []);
    [...(api.requestFields || []), ...(api.responseFields || [])].forEach((field) => {
      if (!tableFields.has(field.name)) errors.push(`Endpoint ${api.id} references hallucinated field ${api.entity}.${field.name}.`);
    });
  });

  pages.forEach((page) => {
    if (!page.route?.startsWith("/")) errors.push(`Page ${page.id} route must start with "/".`);
    page.components?.forEach((component) => {
      const endpointItem = endpointMap.get(component.sourceEndpoint);
      if (!endpointItem) {
        errors.push(`Component ${component.id} references missing endpoint ${component.sourceEndpoint}.`);
        return;
      }
      const endpointFields = new Set(endpointItem.responseFields.map((field) => field.name));
      component.fields.forEach((field) => {
        if (!endpointFields.has(field)) errors.push(`Component ${component.id} references field ${field} missing from ${endpointItem.id}.`);
      });
    });
  });

  config.auth?.permissions?.forEach((permission) => {
    permission.allow.forEach((endpointId) => {
      if (!endpointMap.has(endpointId)) errors.push(`Permission for ${permission.role} references missing endpoint ${endpointId}.`);
    });
  });

  if ((config.ui?.pages || []).length === 0) warnings.push("No UI pages were generated.");
  if ((config.businessLogic || []).length === 0) warnings.push("No business rules were generated.");

  return { errors, warnings };
}

function repairConfig(config, validation, trace) {
  const repaired = structuredClone(config);
  const repairs = [];

  if (!Array.isArray(repaired.auth.roles) || repaired.auth.roles.length === 0) {
    repaired.auth.roles = ["Admin", "Member"];
    repairs.push("Added fallback Admin and Member roles.");
  }

  const tableMap = new Map(repaired.database.tables.map((table) => [table.name, table]));

  repaired.api.endpoints.forEach((api) => {
    if (!tableMap.has(api.entity)) {
      repaired.database.tables.push({
        name: api.entity,
        fields: BASE_FIELDS.Item.map(([name, type, required]) => ({ name, type, required })),
      });
      repairs.push(`Created missing table ${api.entity}.`);
    }
  });

  const freshTableMap = new Map(repaired.database.tables.map((table) => [table.name, table]));
  repaired.api.endpoints.forEach((api) => {
    const table = freshTableMap.get(api.entity);
    const tableFields = new Map(table.fields.map((field) => [field.name, field]));
    api.requestFields = api.requestFields.filter((field) => {
      const keep = tableFields.has(field.name);
      if (!keep) repairs.push(`Removed hallucinated request field ${api.entity}.${field.name}.`);
      return keep;
    });
    api.responseFields = api.responseFields.filter((field) => {
      const keep = tableFields.has(field.name);
      if (!keep) repairs.push(`Removed hallucinated response field ${api.entity}.${field.name}.`);
      return keep;
    });
  });

  const endpointMap = new Map(repaired.api.endpoints.map((api) => [api.id, api]));
  repaired.ui.pages.forEach((page) => {
    page.route = page.route?.startsWith("/") ? page.route : `/${page.route || page.id}`;
    page.components.forEach((component) => {
      if (!endpointMap.has(component.sourceEndpoint)) {
        const fallback = repaired.api.endpoints[0];
        component.sourceEndpoint = fallback.id;
        component.fields = fallback.responseFields.slice(0, 4).map((field) => field.name);
        repairs.push(`Rewired ${component.id} to ${fallback.id}.`);
      } else {
        const endpointItem = endpointMap.get(component.sourceEndpoint);
        const endpointFields = new Set(endpointItem.responseFields.map((field) => field.name));
        const nextFields = component.fields.filter((field) => endpointFields.has(field));
        if (nextFields.length !== component.fields.length) {
          repairs.push(`Trimmed invalid UI fields from ${component.id}.`);
          component.fields = nextFields;
        }
      }
    });
  });

  repaired.auth.permissions = createPermissions(repaired.auth.roles, repaired.api.endpoints);

  trace.push({
    stage: "Validation",
    type: validation.errors.length ? "error" : "ok",
    message: validation.errors.length
      ? `${validation.errors.length} issue(s) found before repair.`
      : "All generated layers passed validation before repair.",
  });

  trace.push({
    stage: "Targeted Repair",
    type: repairs.length ? "repair" : "ok",
    message: repairs.length ? repairs.join(" ") : "No repair needed; preserved generated sections.",
  });

  return repaired;
}

function runEvaluation() {
  const start = performance.now();
  const results = EXAMPLES.map((prompt) => compilePrompt(prompt));
  const successCount = results.filter((result) => result.config.executable).length;
  const repairCount = results.reduce((sum, result) => sum + result.config.metrics.repairCount, 0);
  const errors = results.flatMap((result) => result.validationAfterRepair.errors);
  const avgLatency = Math.round(results.reduce((sum, result) => sum + result.config.metrics.latencyMs, 0) / results.length);
  const totalLatency = Math.round(performance.now() - start);

  const report = {
    datasetSize: results.length,
    standardPrompts: 10,
    edgeCases: 10,
    successRate: `${Math.round((successCount / results.length) * 100)}%`,
    averageRepairsPerRequest: Number((repairCount / results.length).toFixed(2)),
    averageLatencyMs: avgLatency,
    evaluationLatencyMs: totalLatency,
    failureTypes: categorizeFailures(errors),
  };

  const result = compilePrompt(promptInput.value);
  result.config.evaluation = report;
  result.trace.push({
    stage: "Evaluation Framework",
    type: "ok",
    message: `Ran ${results.length} prompts: ${report.successRate} success, ${report.averageRepairsPerRequest} repairs/request, ${report.evaluationLatencyMs}ms total.`,
  });
  state.lastResult = result;
  renderResult(result);
}

function renderResult(result) {
  const { config, trace, validationAfterRepair } = result;
  jsonOutput.textContent = JSON.stringify(config, null, 2);
  statusPill.textContent = config.executable ? "Valid executable" : "Blocked";
  statusPill.className = `pill ${config.executable ? "" : "danger"}`;

  const warnings = validationAfterRepair.warnings.map((message) => ({
    stage: "Validation",
    type: "repair",
    message,
  }));

  validationLog.innerHTML = [...trace, ...warnings]
    .map(
      (entry) => `
        <div class="log-item ${entry.type}">
          <b>${entry.stage}</b>
          <span>${entry.message}</span>
        </div>
      `,
    )
    .join("");

  runtimeTitle.textContent = config.intent.appType;
  runtimeHealth.textContent = config.executable ? "Executable" : "Needs repair";
  runtimeHealth.className = `pill ${config.executable ? "" : "danger"}`;
  runtimePreview.innerHTML = config.ui.pages.map(renderPage).join("");
  metrics.innerHTML = [
    metric("Latency", `${config.metrics.latencyMs}ms`),
    metric("Repairs", config.metrics.repairCount),
    metric("Errors", config.metrics.validationErrors),
    metric("Warnings", config.metrics.validationWarnings),
  ].join("");

  if (config.evaluation) {
    metrics.innerHTML += [
      metric("Eval success", config.evaluation.successRate),
      metric("Eval prompts", config.evaluation.datasetSize),
    ].join("");
  }
}

function renderPage(page) {
  return `
    <section class="runtime-page">
      <header>
        <h3>${page.title}</h3>
        <span class="pill">${page.layout}</span>
      </header>
      <div class="component-list">
        ${page.components
          .map(
            (component) => `
              <div class="runtime-component">
                ${humanize(component.type)} · ${component.sourceEndpoint}
                <small>${component.fields.join(", ")}</small>
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function metric(label, value) {
  return `
    <div class="metric">
      <b>${value}</b>
      <span>${label}</span>
    </div>
  `;
}

function detectProductType(lower, features) {
  const productTypes = [
    ["crm", "CRM"],
    ["food delivery", "Food Delivery"],
    ["task", "Task Manager"],
    ["fitness", "Fitness Tracker"],
    ["ecommerce", "Ecommerce Admin"],
    ["booking", "Booking System"],
    ["salon", "Salon Booking"],
    ["learning", "Learning Platform"],
    ["course", "Learning Platform"],
    ["event", "Event Ticketing"],
    ["helpdesk", "Helpdesk"],
    ["real estate", "Real Estate CRM"],
    ["marketplace", "Marketplace"],
    ["healthcare", "Healthcare Portal"],
    ["finance", "Finance Tracker"],
    ["school", "School Management"],
  ];
  return productTypes.find(([term]) => lower.includes(term))?.[1] || `${humanize(features[0] || "internal")} App`;
}

function detectRoles(lower, features) {
  const roles = ["Admin", "Member"];
  const roleTerms = [
    ["manager", "Manager"],
    ["agent", "Agent"],
    ["teacher", "Teacher"],
    ["parent", "Parent"],
    ["instructor", "Instructor"],
    ["organizer", "Organizer"],
    ["driver", "Driver"],
    ["seller", "Seller"],
  ];
  roleTerms.forEach(([term, role]) => {
    if (lower.includes(term)) roles.push(role);
  });
  if (features.includes("payments")) roles.push("BillingAdmin");
  return unique(roles);
}

function detectConstraints(lower) {
  const constraints = [];
  if (/no authentication|no login|no users/.test(lower)) constraints.push("no_authentication");
  if (/\bfree\b|no payments|without payment/.test(lower)) constraints.push("free_checkout");
  if (/do not store contacts|no contacts/.test(lower)) constraints.push("external_contact_storage");
  return constraints;
}

function pickTableForPage(pageName, tables) {
  const lower = pageName.toLowerCase();
  const mapping = [
    ["login", "User"],
    ["account", "User"],
    ["contact", "Contact"],
    ["analytics", "AnalyticsEvent"],
    ["dashboard", "AnalyticsEvent"],
    ["billing", "Payment"],
    ["order", "Order"],
    ["catalog", "Item"],
    ["schedule", "Booking"],
    ["learning", "Course"],
    ["progress", "Workout"],
    ["files", "FileAsset"],
    ["access", "RoleAssignment"],
  ];
  const entity = mapping.find(([term]) => lower.includes(term))?.[1];
  return tables.find((table) => table.name === entity) || tables[0];
}

function categorizeFailures(errors) {
  if (errors.length === 0) return {};
  return errors.reduce((acc, error) => {
    const key = error.includes("hallucinated")
      ? "hallucinated_field"
      : error.includes("missing endpoint")
        ? "missing_endpoint"
        : error.includes("table")
          ? "schema_mismatch"
          : "other";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function kebab(value) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function humanize(value) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function summarize(value) {
  return value.length > 54 ? `${value.slice(0, 51)}...` : value;
}

function unique(values) {
  return [...new Set(values)];
}

function hashPrompt(prompt) {
  let hash = 2166136261;
  for (let index = 0; index < prompt.length; index += 1) {
    hash ^= prompt.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `cfg_${(hash >>> 0).toString(16)}`;
}

init();
