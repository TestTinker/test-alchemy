export type UserGender = 'female' | 'male';
export type UserStatus = 'active' | 'inactive';

export interface CreateUserRequest {
  name: string;
  email: string;
  gender: UserGender;
  status: UserStatus;
}

export interface UserResponse extends CreateUserRequest {
  id: number;
}
