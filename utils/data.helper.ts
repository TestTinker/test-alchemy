export function uniqueEmail(prefix = 'user'): string {
  return `${prefix}.${Date.now()}@example.com`;
}
