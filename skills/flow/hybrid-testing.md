# Hybrid Testing

Hybrid tests combine API setup or verification with UI interaction. Use them to reduce execution time and improve determinism.

Typical pattern:

1. Seed data with API clients.
2. Execute the user journey in the browser.
3. Verify side effects through API or database-facing services.
