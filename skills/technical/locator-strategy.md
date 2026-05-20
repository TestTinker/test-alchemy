# Locator Strategy

Prefer resilient selectors:

1. `getByRole`
2. `getByLabel`
3. `getByTestId`
4. Stable CSS or XPath only as a last resort

Selectors should express intent and survive cosmetic DOM changes.
