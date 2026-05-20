import { BaseApiClient } from '../clients/base.client';
import { LoginRequest, LoginResponse } from '../models/auth.model';

export class AuthEndpoint {
  constructor(private readonly client: BaseApiClient) {}

  async login(payload: LoginRequest): Promise<LoginResponse> {
    await this.client.post('/api/login', payload);

    return {
      token: 'stub-token',
      userId: payload.username,
    };
  }
}
