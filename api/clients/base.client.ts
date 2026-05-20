import { APIRequestContext, APIResponse, request } from '@playwright/test';

export class BaseApiClient {
  private context?: APIRequestContext;

  constructor(
    private readonly baseURL: string,
    private readonly extraHTTPHeaders?: Record<string, string>,
  ) {}

  async getContext(): Promise<APIRequestContext> {
    if (!this.context) {
      this.context = await request.newContext({
        baseURL: this.baseURL,
        extraHTTPHeaders: this.extraHTTPHeaders,
      });
    }

    return this.context;
  }

  async get(path: string): Promise<APIResponse> {
    const context = await this.getContext();
    return context.get(path);
  }

  async post(path: string, data?: unknown): Promise<APIResponse> {
    const context = await this.getContext();
    return context.post(path, { data });
  }

  async dispose(): Promise<void> {
    await this.context?.dispose();
  }
}
