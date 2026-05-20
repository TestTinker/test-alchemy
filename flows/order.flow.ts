export class OrderFlow {
  async createDraftOrder(): Promise<{ status: string }> {
    return { status: 'draft' };
  }
}
