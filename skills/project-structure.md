playwright-automation/
│
├── skills/                         # 📚 KNOWLEDGE BASE (MD files)
│   ├── flow/
│   │   ├── test-strategy.md
│   │   ├── hybrid-testing.md
│   │   ├── test-design.md
│   │   └── coverage.md
│   │
│   ├── technical/
│   │   ├── playwright-basics.md
│   │   ├── pom-pattern.md
│   │   ├── api-testing.md
│   │   └── locator-strategy.md
│   │
│   ├── engineering/
│   │   ├── project-structure.md
│   │   ├── ci-cd.md
│   │   ├── environment.md
│   │   ├── reporting.md
│   │   └── test-data.md
│   │
│   └── llm/
│       ├── gpt-usage.md
│       ├── prompt-engineering.md
│       └── self-healing.md
│
├── tests/                          # 🔹 FLOW LAYER (Test Strategy)
│   ├── web/
│   ├── api/
│   ├── hybrid/
│   ├── e2e/
│   └── test-specs/                 # High-level scenario definitions
│
├── flows/                          # 🔹 FLOW ABSTRACTION (Reusable business flow)
│   ├── auth.flow.ts
│   ├── user.flow.ts
│   └── order.flow.ts
│
├── pages/                          # 🔹 TECHNICAL (UI abstraction - POM)
│   ├── base.page.ts
│   ├── login.page.ts
│   └── dashboard.page.ts
│
├── api/                            # 🔹 TECHNICAL (API abstraction)
│   ├── clients/
│   ├── endpoints/
│   └── models/
│
├── fixtures/                       # 🔹 TECHNICAL (Playwright fixtures)
│   ├── ui.fixture.ts
│   ├── api.fixture.ts
│   └── test.fixture.ts
│
├── utils/                          # 🔹 TECHNICAL (helpers)
│   ├── logger.ts
│   ├── locator.helper.ts
│   ├── data.helper.ts
│   └── llm.helper.ts
│
├── test-data/                      # 🔹 ENGINEERING (data management)
│   ├── static/
│   ├── dynamic/
│   └── schemas/
│
├── config/                         # 🔹 ENGINEERING (environment)
│   ├── env/
│   │   ├── dev.env.ts
│   │   ├── staging.env.ts
│   │   └── prod.env.ts
│   └── test.config.ts
│
├── hooks/                          # 🔹 ENGINEERING (lifecycle management)
│   ├── global-setup.ts
│   └── global-teardown.ts
│
├── reporters/                      # Custom reporting
|
├── integrations/                   # 🔹 ENGINEERING (external systems)
│   ├── ci/
│   │   └── github-actions.yml
│   ├── reporting/
│   │   └── allure.config.ts
│   └── llm/
│       └── openai.client.ts
│
├── scripts/                        # 🔹 ENGINEERING (automation scripts)
│   ├── seed-data.ts
│   └── cleanup.ts
│
├── playwright.config.ts
├── package.json
├── tsconfig.json
└── README.md