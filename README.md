# routing-simulator

## rest api

### /users

```json
{
  "id": "andy"
}
```

- `GET /users`

- `GET /users/{id}`

- `POST /users`

### /connections

```json
{
  "from": "andy",
  "to": "bob
}
```

- `GET /connections?related-to={user_id}`

- `POST /connections`

### /messages

```json
{
  "body": "hi bob",
  "to": "andy",
  "from": "bob
}
```

- `POST /messages`

- `GET /users/{id}/messages`

- `GET /users/{id}/sent-messages`

