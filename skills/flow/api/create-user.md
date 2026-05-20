### Create user
1. I have a valid access token `7d384327c8eee7f576ee1fb490e7f22796d59bbafd6065a59bf7c76c774becd1`
2. I send a `POST` request to `https://gorest.co.in/public/v2/users` with a unique `name` and unique `email`, and the following details:
      | gender | status |
      | female | active |
3. The user should be created successfully with status `201`
4. And I save the `id`
5. And I print the created user id
6. And I send a `GET` request to `https://gorest.co.in/public/v2/users/{user id}`
7. The user details should be returned successfully with status `200`
8. And the returned `id`, `name`, `email`, `gender`, and `status` should match the created user
