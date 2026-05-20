# Test Strategy

This project separates tests by intent:

- `tests/web` for UI-only coverage.
- `tests/api` for API-only validation.
- `tests/hybrid` for scenarios mixing UI and API.
- `tests/e2e` for end-to-end business-critical journeys.

Prioritize fast feedback with API and focused UI tests, then reserve E2E coverage for core paths such as login, order placement, and user management.
