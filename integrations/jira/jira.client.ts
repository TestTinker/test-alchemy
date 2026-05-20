import type { JiraConfig } from './jira.config';

interface JiraDescriptionNode {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{
    type?: string;
    attrs?: Record<string, unknown>;
  }>;
  content?: JiraDescriptionNode[];
}

interface JiraIssueResponse {
  key: string;
  fields: {
    summary?: string;
    description?: JiraDescriptionNode | string | null;
  };
}

export interface JiraTicket {
  key: string;
  summary: string;
  description: string;
}

export class JiraClient {
  constructor(private readonly config: JiraConfig) {}

  async getTicket(ticketKey: string): Promise<JiraTicket> {
    const issue = await this.getIssue(ticketKey);

    return {
      key: issue.key,
      summary: issue.fields.summary ?? '',
      description: formatJiraDescription(issue.fields.description),
    };
  }

  private async getIssue(ticketKey: string): Promise<JiraIssueResponse> {
    const errors: string[] = [];

    for (const apiVersion of ['3', '2']) {
      const response = await this.requestIssue(ticketKey, apiVersion);
      const body = await response.text();
      const contentType = response.headers.get('content-type') ?? '';

      if (!response.ok) {
        errors.push(formatJiraError(response, body, apiVersion));
        continue;
      }

      if (!contentType.includes('application/json')) {
        errors.push(formatNonJsonError(response, body, apiVersion));
        continue;
      }

      return JSON.parse(body) as JiraIssueResponse;
    }

    throw new Error(errors.join('\n\n'));
  }

  private async requestIssue(ticketKey: string, apiVersion: string): Promise<Response> {
    const url = new URL(`${this.config.baseUrl}/rest/api/${apiVersion}/issue/${ticketKey}`);
    url.searchParams.set('fields', 'summary,description');

    return fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `${this.config.authType} ${this.config.token}`,
      },
    });
  }
}

function formatJiraError(response: Response, body: string, apiVersion: string): string {
  return [
    `Jira API v${apiVersion} request failed: ${response.status} ${response.statusText}`,
    trimResponseBody(body),
  ].join('\n');
}

function formatNonJsonError(response: Response, body: string, apiVersion: string): string {
  return [
    `Jira API v${apiVersion} returned ${response.headers.get('content-type') ?? 'unknown content-type'} instead of JSON.`,
    `Status: ${response.status} ${response.statusText}`,
    'Check JIRA_BASE_URL and authentication. If the response starts with HTML, Jira is likely returning a login or proxy page.',
    trimResponseBody(body),
  ].join('\n');
}

function trimResponseBody(body: string): string {
  return body.trim().slice(0, 500);
}

function formatJiraDescription(description: JiraIssueResponse['fields']['description']): string {
  if (!description) {
    return '_No description provided._';
  }

  if (typeof description === 'string') {
    return description;
  }

  return renderNode(description).trim() || '_No description provided._';
}

function renderNodes(nodes: JiraDescriptionNode[] | undefined): string {
  return nodes?.map(renderNode).join('') ?? '';
}

function renderNode(node: JiraDescriptionNode): string {
  const content = renderNodes(node.content);

  switch (node.type) {
    case 'doc':
      return renderNodes(node.content);
    case 'paragraph':
      return `${content.trim()}\n\n`;
    case 'heading':
      return `${'#'.repeat(Number(node.attrs?.level ?? 2))} ${content.trim()}\n\n`;
    case 'bulletList':
      return renderList(node.content, '- ');
    case 'orderedList':
      return renderList(node.content, '1. ');
    case 'listItem':
      return content;
    case 'text':
      return applyMarks(node.text ?? '', node.marks);
    case 'hardBreak':
      return '\n';
    case 'blockquote':
      return content
        .trim()
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n') + '\n\n';
    case 'codeBlock':
      return `\`\`\`\n${content.trim()}\n\`\`\`\n\n`;
    case 'rule':
      return '---\n\n';
    case 'mention':
      return String(node.attrs?.text ?? node.attrs?.id ?? '');
    case 'inlineCard':
      return String(node.attrs?.url ?? '');
    default:
      return content;
  }
}

function renderList(items: JiraDescriptionNode[] | undefined, marker: string): string {
  return items?.map((item) => {
    const text = renderNode(item).trim().replace(/\n/g, '\n  ');
    return `${marker}${text}\n`;
  }).join('') + '\n' || '';
}

function applyMarks(value: string, marks: JiraDescriptionNode['marks']): string {
  return marks?.reduce((text, mark) => {
    switch (mark.type) {
      case 'strong':
        return `**${text}**`;
      case 'em':
        return `_${text}_`;
      case 'code':
        return `\`${text}\``;
      case 'link':
        return `[${text}](${String(mark.attrs?.href ?? '')})`;
      default:
        return text;
    }
  }, value) ?? value;
}
