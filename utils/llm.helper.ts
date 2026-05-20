export function buildPrompt(task: string, context: string): string {
  return `Task: ${task}\nContext: ${context}\nReturn a concise structured answer.`;
}
