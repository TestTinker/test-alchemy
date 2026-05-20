import { exportJiraTicket } from '../integrations/jira/jira-ticket-exporter';

async function main(): Promise<void> {
  const result = await exportJiraTicket({
    ticketKeyInput: process.argv[2],
    outputDir: process.argv[3],
  });

  console.log(`Jira ticket exported: ${result.outputPath}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
