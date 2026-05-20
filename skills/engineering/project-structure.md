# Project Structure

The repository is organized by responsibility:

- `tests/` contains executable tests.
- `flows/` contains reusable business actions.
- `pages/` contains UI abstractions.
- `api/` contains API abstractions.
- `fixtures/` contains Playwright fixture composition.
- `utils/`, `config/`, `hooks/`, and `integrations/` contain engineering support layers.

This split keeps test intent, technical mechanics, and environment concerns separate.
