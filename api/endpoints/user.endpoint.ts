import { BaseApiClient } from '../clients/base.client';
import { CreateUserRequest, UserResponse } from '../models/user.model';

export class UserEndpoint {
  constructor(private readonly client: BaseApiClient) {}

  async createUser(payload: CreateUserRequest): Promise<UserResponse> {
    const response = await this.client.post('/public/v2/users', payload);

    if (response.status() !== 201) {
      throw new Error(`Expected create user status 201, but received ${response.status()}: ${await response.text()}`);
    }

    return response.json() as Promise<UserResponse>;
  }

  async getUser(userId: number): Promise<UserResponse> {
    const response = await this.client.get(`/public/v2/users/${userId}`);

    if (response.status() !== 200) {
      throw new Error(`Expected get user status 200, but received ${response.status()}: ${await response.text()}`);
    }

    return response.json() as Promise<UserResponse>;
  }
}
