import { test } from '../../fixtures/test.fixture';
import { CreateUserRequest } from '../../api/models/user.model';
import { assertion } from '../../utils/assertion.helper';
import apiUsers from '../../test-data/static/api-users.json';

test('create user returns a new id', async ({ userEndpoint }) => {
  const suffix = Date.now();
  const userData = apiUsers.gorest.newUser;
  const name = `${userData.namePrefix}-${suffix}`;
  const email = `${name}@${userData.emailDomain}`;
  const payload: CreateUserRequest = {
    name,
    email,
    gender: userData.gender as CreateUserRequest['gender'],
    status: userData.status as CreateUserRequest['status'],
  };

  const createdUser = await userEndpoint.createUser(payload);

  const userId = createdUser.id;

  console.log(`Created user id: ${userId}`);

  assertion.toBeTruthy(userId);
  assertion.toMatchObject(createdUser, {
    name,
    email,
    gender: payload.gender,
    status: payload.status,
  });

  const savedUser = await userEndpoint.getUser(userId);

  assertion.toMatchObject(savedUser, {
    id: userId,
    name,
    email,
    gender: payload.gender,
    status: payload.status,
  });
});
