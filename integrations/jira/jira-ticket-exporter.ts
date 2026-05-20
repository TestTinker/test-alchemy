import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { JiraClient, type JiraTicket } from './jira.client';
import { getJiraConfig } from './jira.config';

export interface ExportJiraTicketOptions {
  ticketKeyInput: string | undefined;
  outputDir?: string;
}

export interface ExportJiraTicketResult {
  ticket: JiraTicket;
  outputPath: string;
}

export async function exportJiraTicket(options: ExportJiraTicketOptions): Promise<ExportJiraTicketResult> {
  const ticketKey = resolveJiraTicketKey(options.ticketKeyInput);
  const outputDir = options.outputDir ?? path.join('skills', 'jira');
  const client = new JiraClient(getJiraConfig());
  const ticket = await client.getTicket(ticketKey);
  const outputPath = path.join(outputDir, `${ticket.key}.md`);

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, buildJiraTicketMarkdown(ticket), 'utf8');

  return {
    ticket,
    outputPath,
  };
}

export function buildJiraTicketMarkdown(ticket: Pick<JiraTicket, 'key' | 'summary' | 'description'>): string {
  return [
    `# ${ticket.key}: ${ticket.summary}`,
    '',
    '## Description',
    '',
    ticket.description,
    '',
  ].join('\n');
}

export function resolveJiraTicketKey(input: string | undefined): string {
  const value = input?.trim();

  if (!value) {
    throw new Error('Ticket key is required. Example: npm run jira -- ETI-150752');
  }

  if (/^\d+$/.test(value)) {
    return `${process.env.JIRA_PROJECT_KEY ?? 'ETI'}-${value}`;
  }

  return value.toUpperCase();
}
