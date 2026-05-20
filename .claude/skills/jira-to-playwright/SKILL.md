---
name: jira-to-playwright
description: "**WORKFLOW SKILL** — Export Jira ticket to steps, generate a Playwright test from those steps, and run it via Playwright CLI. Use when: converting Jira test cases into automated tests; testing checkout, auth, or user flows from exported ticket specifications; validating UI flows against Jira requirements. Generates .spec.ts test files, validates flow mappings, and optionally executes tests."
---

# Jira Ticket to Playwright Test Automation

Convert Jira test case steps into executable Playwright test files and validate them via the Playwright CLI.

## Workflow

This skill automates converting manual test steps from Jira tickets into runnable Playwright tests:

1. **Export Jira Ticket** → Markdown file (skills/jira/*.md)
2. **Parse Steps** → Extract test scenario and steps
3. **Map to Flow** → Match steps to existing flows (auth, order, user)
4. **Generate Test** → Create .spec.ts file with Playwright test code
5. **Validate & Run** → Execute test via Playwright CLI and capture results

## Use Cases

| Scenario | Input | Output |
|----------|-------|--------|
| Convert checkout test case | Jira ticket steps (ETI-150752.md) | checkout-test-generated.spec.ts |
| Automate auth flow validation | Jira login requirements | auth-test-generated.spec.ts |
| User profile update test | Jira user flow steps | user-profile-test-generated.spec.ts |

## Step-by-Step Process

### 1. Export Jira Ticket
Export a Jira ticket to markdown format in `skills/jira/`:
```bash
npx ts-node agents/export-jira-ticket.agent.ts ETI-150752 skills/jira
```
Output: `skills/jira/ETI-150752.md`

### 2. Parse Jira Steps
Read the exported markdown file to extract:
- Ticket title/ID
- Test scenario description
- Numbered steps with actions and assertions
- Expected outcomes

Example structure from ETI-150752.md:
```markdown
# ETI-150752: [Automation] Check, add, update and fix BasicSanityQA March 18

## Description
Checkout:
 # Add to chart
 # Verify total and amount
 # Click Confirm
 # Payment
 # Verify the payment
```

### 3. Map Steps to Flows
Match Jira steps to existing flows in `flows/`:
- **auth.flow.ts** — Login, signup, password reset steps
- **order.flow.ts** — Add to cart, checkout, payment steps
- **user.flow.ts** — Profile update, settings, preferences steps

**Discover Available Flow Methods**:
List all exported flow methods automatically:
```bash
# View available methods in each flow
npx ts-node -e "import('./flows/order.flow').then(m => console.log(Object.keys(m)))"
npx ts-node -e "import('./flows/auth.flow').then(m => console.log(Object.keys(m)))"
npx ts-node -e "import('./flows/user.flow').then(m => console.log(Object.keys(m)))"
```

Example mapping:
| Jira Step | Matched Flow | Method |
|-----------|--------------|--------|
| "Add to chart" | order.flow.ts | `addToCart()` |
| "Verify total and amount" | order.flow.ts | `verifyOrderTotal()` |
| "Click Confirm" | order.flow.ts | `confirmOrder()` |
| "Verify the payment" | order.flow.ts | `verifyPayment()` |

### 4. Generate Test File
Create a .spec.ts file with:
- Test case name from Jira ticket
- Import statements for fixtures and flows
- Step-by-step test code calling matched flow methods
- Assertions and verifications

Generated test structure:
```typescript
import { test, expect } from '@playwright/test';
import { orderFlow } from '../flows/order.flow';

test('ETI-150752: Check, add, update and fix BasicSanityQA March 18', async ({ page }) => {
  // Step 1: Add to cart
  await orderFlow.addToCart(page);
  
  // Step 2: Verify total and amount
  const total = await orderFlow.getOrderTotal(page);
  expect(total).toBeGreaterThan(0);
  
  // Step 3: Click Confirm
  await orderFlow.confirmOrder(page);
  
  // Step 4: Payment
  await orderFlow.processPayment(page);
  
  // Step 5: Verify the payment
  const paymentStatus = await orderFlow.verifyPayment(page);
  expect(paymentStatus).toBe('success');
});
```

### 5. Validate & Run Test

Run the generated test via Playwright CLI:
```bash
# Run the test file
npx playwright test test/jira/ETI-150752.spec.ts

# Run with UI mode for debugging
npx playwright test test/jira/ETI-150752.spec.ts --ui

# Run with headed browser
npx playwright test test/jira/ETI-150752.spec.ts --headed

# Generate HTML report
npx playwright test test/jira/ETI-150752.spec.ts --reporter=html
```

## Decision Points

### Q1: Which flow to use?
If steps mention:
- Login, signup, password → **auth.flow.ts**
- Cart, checkout, payment → **order.flow.ts**
- Profile, settings, preferences → **user.flow.ts**
- Multiple flows → Combine them in sequence

### Q2: Missing step mappings?
If a Jira step doesn't map to existing flows:
- Suggest creating a new helper function in the matched flow
- Or use raw Playwright locators as fallback
- Document the gap for future flow enhancement

### Q3: Test execution mode?
- **headless** (default) — Fast, CI/CD friendly
- **headed** (--headed) — Visual debugging
- **ui** (--ui) — Interactive debugging with Playwright Inspector
- **debug** (--debug) — Step-through with debugger

## Quality Checklist

Before running a generated test, verify:
- ✅ All Jira steps have corresponding flow methods or Playwright commands
- ✅ Test imports are correct and paths are valid
- ✅ Assertions match Jira ticket expected outcomes
- ✅ Flow methods are called with correct parameters
- ✅ No syntax errors in generated .spec.ts file
- ✅ Test name includes Jira ticket ID for traceability

## Common Patterns

### Pattern 1: Linear Workflow (most common)
Steps are sequential without branching:
```
Login → Add to Cart → Checkout → Payment → Verify
```
→ Generate single test with steps in sequence

### Pattern 2: Conditional Flow
Steps include if/else logic:
```
Login → Check Stock → If available: Add to Cart → Checkout
        → If unavailable: Show error message
```
→ Generate test with conditional assertions

### Pattern 3: Multi-Flow Test
Steps span multiple flows:
```
Login (auth) → Profile Update (user) → Add to Cart → Checkout (order)
```
→ Generate test that imports all required flows

## Example Prompts to Test This Skill

- `/jira-to-playwright export ETI-150752 and generate a test from the checkout steps`
- `/jira-to-playwright create a test file for QARDEX-1 using the order flow`
- `/jira-to-playwright generate and run the test from skills/jira/ETI-150752.md`
- `/jira-to-playwright map the Jira steps to flows, generate the test, and verify it with playwright CLI`

## Related Skills & Customizations

After using this skill, consider creating:
- **Flow Extension Skill** — If generated tests frequently need new flow methods
- **Test Report Aggregation** — To collect results from multiple generated tests
- **Playwright Debugging Hook** — Auto-capture screenshots on test failures
- **Jira Integration Hook** — Auto-comment test results back to Jira tickets

