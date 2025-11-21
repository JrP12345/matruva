# Admin API Reference

All admin endpoints require authentication (access_token cookie) and SUPER_ADMIN role.

Base path: `/v1/admin`

## Role Management

### List All Roles

```http
GET /v1/admin/roles
```

**Response:**

```json
{
  "roles": [
    {
      "_id": "...",
      "name": "ADMIN",
      "label": "Administrator",
      "description": "System administrator",
      "permissions": ["users.view", "users.manage"],
      "protected": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Role Details

```http
GET /v1/admin/roles/:name
```

**Response:**

```json
{
  "role": {
    "_id": "...",
    "name": "ADMIN",
    "label": "Administrator",
    "permissions": ["users.view"]
  }
}
```

### Create Role

```http
POST /v1/admin/roles
Content-Type: application/json

{
  "name": "MANAGER",
  "label": "Manager",
  "description": "Store manager",
  "permissions": ["users.view", "orders.manage"]
}
```

**Response:**

```json
{
  "role": {
    "_id": "...",
    "name": "MANAGER",
    "label": "Manager",
    "protected": false
  }
}
```

**Audit Log:** Creates `role.create` action log

### Update Role

```http
PATCH /v1/admin/roles/:name
Content-Type: application/json

{
  "label": "Updated Manager",
  "permissions": ["users.view", "orders.manage", "products.manage"]
}
```

**Response:**

```json
{
  "role": {
    "_id": "...",
    "name": "MANAGER",
    "label": "Updated Manager",
    "permissions": ["users.view", "orders.manage", "products.manage"]
  }
}
```

**Audit Log:** Creates `role.update` action log

**Restrictions:** Cannot modify protected roles (SUPER_ADMIN, ADMIN, USER)

### Delete Role

```http
DELETE /v1/admin/roles/:name
```

**Response:**

```json
{
  "message": "Role deleted successfully"
}
```

**Audit Log:** Creates `role.delete` action log

**Restrictions:** Cannot delete protected roles

---

## Permission Management

### List All Permissions

```http
GET /v1/admin/permissions
```

**Response:**

```json
{
  "permissions": [
    {
      "_id": "...",
      "key": "users.view",
      "description": "View users",
      "category": "users",
      "protected": false
    }
  ]
}
```

### Create Permission

```http
POST /v1/admin/permissions
Content-Type: application/json

{
  "key": "orders.manage",
  "description": "Manage orders",
  "category": "orders"
}
```

**Response:**

```json
{
  "permission": {
    "_id": "...",
    "key": "orders.manage",
    "description": "Manage orders",
    "category": "orders",
    "protected": false
  }
}
```

**Audit Log:** Creates `permission.create` action log

### Delete Permission

```http
DELETE /v1/admin/permissions/:key
```

**Response:**

```json
{
  "message": "Permission deleted successfully"
}
```

**Audit Log:** Creates `permission.delete` action log

**Restrictions:** Cannot delete protected permissions

---

## User Management

### List Users

```http
GET /v1/admin/users?page=1&limit=20&role=ADMIN
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `role` (optional): Filter by role name

**Response:**

```json
{
  "users": [
    {
      "_id": "...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "extraPermissions": [],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### Get User Details

```http
GET /v1/admin/users/:id
```

**Response:**

```json
{
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "extraPermissions": ["orders.view"]
  },
  "permissions": ["users.view", "orders.view"]
}
```

### Assign Role to User

```http
PATCH /v1/admin/users/:id/role
Content-Type: application/json

{
  "role": "ADMIN"
}
```

**Response:**

```json
{
  "message": "Role assigned successfully",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "ADMIN"
  }
}
```

**Audit Log:** Creates `user.assign_role` action log with old and new roles

### Add Extra Permissions to User

```http
PATCH /v1/admin/users/:id/permissions
Content-Type: application/json

{
  "permissions": ["orders.view", "products.manage"]
}
```

**Response:**

```json
{
  "message": "Permissions added successfully",
  "extraPermissions": ["orders.view", "products.manage"]
}
```

**Audit Log:** Creates `user.add_permissions` action log

**Note:** Permissions are added to existing extra permissions (not replaced)

### View User Sessions

```http
GET /v1/admin/users/:id/sessions
```

**Response:**

```json
{
  "sessions": [
    {
      "jti": "abc123...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "expiresAt": "2024-01-31T00:00:00.000Z",
      "ip": "127.0.0.1",
      "userAgent": "Mozilla/5.0...",
      "isExpired": false
    }
  ]
}
```

### Revoke Specific Session

```http
DELETE /v1/admin/users/:id/sessions/:jti
```

**Response:**

```json
{
  "message": "Session revoked successfully"
}
```

**Audit Log:** Creates `user.revoke_session` action log

**Effect:** User will be logged out on that specific device/session

### Revoke All Sessions

```http
DELETE /v1/admin/users/:id/sessions
```

**Response:**

```json
{
  "message": "All sessions revoked successfully",
  "revokedCount": 3
}
```

**Audit Log:** Creates `user.revoke_all_sessions` action log

**Effect:** User will be logged out from all devices

---

## Key Management

### List All Keys

```http
GET /v1/admin/keys
```

**Response:**

```json
{
  "keys": [
    {
      "kid": "a1b2c3d4e5f6g7h8",
      "use": "sig",
      "kty": "RSA",
      "alg": "RS256",
      "active": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "hasPrivateKey": true
    }
  ]
}
```

**Note:** Private keys are never exposed in API responses

### Add New Key

```http
POST /v1/admin/keys
Content-Type: application/json

{
  "publicKey": "-----BEGIN PUBLIC KEY-----\n...",
  "privateKey": "-----BEGIN PRIVATE KEY-----\n...",
  "use": "sig",
  "alg": "RS256"
}
```

**Response:**

```json
{
  "message": "Key added successfully",
  "kid": "a1b2c3d4e5f6g7h8",
  "use": "sig",
  "active": true
}
```

**Audit Log:** Creates `key.add` action log

**Note:** `privateKey` is optional. If not provided, only public key verification is possible.

### Update Key Status

```http
PATCH /v1/admin/keys/:kid
Content-Type: application/json

{
  "active": false
}
```

**Response:**

```json
{
  "message": "Key deactivated successfully",
  "kid": "a1b2c3d4e5f6g7h8",
  "active": false
}
```

**Audit Log:** Creates `key.activate` or `key.deactivate` action log

**Use Case:** Deactivate old keys after rotation grace period

### Delete Key

```http
DELETE /v1/admin/keys/:kid
```

**Response:**

```json
{
  "message": "Key deleted successfully",
  "kid": "a1b2c3d4e5f6g7h8"
}
```

**Audit Log:** Creates `key.delete` action log

**Note:** This is a soft delete (key is deactivated, not removed)

---

## Audit Log

All admin actions are logged to the `AdminActionLog` collection with:

- `actorId`: ObjectId of the admin performing the action
- `actorEmail`: Email of the admin
- `action`: Action type (e.g., `role.create`, `user.assign_role`)
- `targetType`: Type of resource affected (e.g., `Role`, `User`, `Key`)
- `targetId`: ID of the resource affected
- `metadata`: Additional context (e.g., old/new values)
- `ip`: IP address of the request
- `userAgent`: User agent string
- `createdAt`: Timestamp

### Action Types

**Roles:**

- `role.create`
- `role.update`
- `role.delete`

**Permissions:**

- `permission.create`
- `permission.delete`

**Users:**

- `user.assign_role`
- `user.add_permissions`
- `user.revoke_session`
- `user.revoke_all_sessions`

**Keys:**

- `key.add`
- `key.activate`
- `key.deactivate`
- `key.delete`

---

## Error Responses

All endpoints return standard error responses:

**400 Bad Request:**

```json
{
  "error": "name and label are required"
}
```

**403 Forbidden:**

```json
{
  "error": "Cannot modify protected role"
}
```

**404 Not Found:**

```json
{
  "error": "Role not found"
}
```

**409 Conflict:**

```json
{
  "error": "Role already exists"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Failed to create role"
}
```

---

## Authentication

All endpoints require:

1. Valid `access_token` cookie
2. User with `SUPER_ADMIN` role

**Example Request:**

```bash
curl -X GET http://localhost:3000/v1/admin/roles \
  -H "Cookie: access_token=eyJhbGciOiJS..."
```

**Unauthorized Response (401):**

```json
{
  "error": "Unauthorized"
}
```

**Forbidden Response (403):**

```json
{
  "error": "Forbidden: Insufficient permissions"
}
```
