# Endpoints Conventions

This document outlines the endpoints conventions used in this repository. Adhering to these guidelines ensures consistency and maintainability.

## Best Practices and Naming Conventions

When defining a new endpoint, take in consideration the [API Best Practices and Naming Conventions](https://github.com/saifaustcse/api-best-practices/blob/main/README.md)

## Masking Sensitive Information

When developing, ensure that sensitive data is properly masked in logs to protect user privacy and security. Sensitive information includes, but is not limited to:

- Credentials, such as passwords or API keys.
- Personally identifiable information (PII), including email addresses, phone numbers, full names, and identification numbers.

When defining a new endpoint (e.g., `src/endpoints/<endpoint-name>/<endpoint-name>.endpoint.ts`), specify the fields to be masked in both request and response logs.

**Example:**

```typescript
export const usersEndpoint: RouteOptions = createEndpoint(
  {
    method: ["POST"],
    path: "/users",
    handler: createUserHandler,
  },
  logger,
  {
    maskOptions: {
      requestHeaders: ["authorization"],
      requestPayloadFields: ["lastName", "email", "phoneNumber"],
      responseHeaders: ["authorization"],
      responsePayloadFields: ["sensitiveField"],
    },
  },
);
```

For more details, refer to the [EndpointOptions](packages/fastify/src/utils/endpoints/endpoints.utils.interfaces.ts) interface in `packages/fastify/src/utils/endpoints/endpoints.utils.interfaces.ts`.

## Error responses

When responding to an error, the payload must follow this structure:

```json
{
  "code": "error-code",
  "message": "Human readable error message",
  "data": {} // Optional, only for 4XX errors
}
```

### Required Fields

- `code`: A unique identifier for the error type (e.g., "INVALID_INPUT", "RESOURCE_NOT_FOUND")
- `message`: A clear, user-friendly description of what went wrong

### Optional Fields

- `data`: Additional error information (only for 4XX errors)
  - Contains specific validation errors, missing fields, or other relevant details
  - Should be a JSON object with structured information

### Error Status Codes

- **4XX Errors (Client Errors)**

  - May include a `data` field with specific error information
  - Example:

    ```json
    {
      "code": "invalid-input",
      "message": "Invalid input data",
      "data": {
        "email": "Must be a valid email address",
        "password": "Must be at least 8 characters"
      }
    }
    ```

- **5XX Errors (Server Errors)**

  - Should not expose internal implementation details
  - No `data` field should be included
  - Example:

    ```json
    {
      "code": "1",
      "message": "An unexpected error occurred"
    }
    ```

Note: 5XX and 404 errors are handled globally in the server file (normally in src/server.ts) and don't need to be handled in individual endpoints.

// Start of work in progress. Ignore for now

## Endpoint Composition

The root file for an endpoint should be called `<endpoint_name>.endpoint.ts` and it expose a const named `<endpoint_name>endpointBuilder` that for each action (or HTTP method) should use `createEndpoint` method of the `Fastify Package` (`@repo/fastify`) declaring the method to be used, the url, the handler and the schemas for either body, params and querystring. Optionally, it can receive [EndpointOptions](../packages/fastify/src/utils/endpoints/endpoints.utils.interfaces.ts) that can be used to avoid requiring authentication or masking fields for the default logs of the `createEndpoint` method. TODO: specify what logs are made by the method

### Create Action

For create action, the http method should be POST and it should specify a the schema for the body and the params in case its a nested endpoint (eg: /company/:companyId/transactions).

### Example

```typescript
// TODO: add constants values
createEndpoint(server, {
  method: [HTTP_METHODS_MAP.CREATE],
  url: URL_V1,
  handler: createTransactionHandler,
  schema: {
    body: CREATE_COMPANY_TRANSACTION_BODY_JSON_SCHEMA,
    params: COMPANY_TRANSACTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA,
  },
})

```

## Read Action

For the read action, the http method should be GET and it should specify the schema for the params. Normally the params should include the "id" field and optionally the fields for the nested ids (eg: /company/:companyId/transactions).

### Example

```typescript
```

## List Action

For the list action, the method should be GET and it should specify the schema for filtering and paginating through `querystring`, and in case of nested endpoints the params to specify the ids (eg: /company/:companyId/transactions).

A field can be filtered by the following options:

- `eq`: to filter for an exact value. This can be done by two ways: simple (<field_name>=<value>) or composite(<field_name>[eq]=<value>). **Examples**:

  - simple: `/companies?name=Acme`
  - composite: `/companies?name[eq]=Acme`

- `gt` or `ge`: Greater than or greater or equal. **Examples**:

  - `/transactions?date[ge]=2025-07-01` // greater or equal than the specified date
  - `/transactions?date[gt]=2025-07-01` // greater than the specified date but not including it

- `lt` or `le`: Less than or less or equal. **Examples**:

  - `/transactions?date[le]=2025-07-01` // less or equal than the specified date
  - `/transactions?date[lt]=2025-07-01` // less than the specified date but not including it

To avoid writing too much code for specifying the filtering schema, use the [buildSchemaForQueryParamsProperty](../packages/fastify/src/utils/endpoints/endpoints.utils.ts) helper function.

### Example

This example allows filtering by `amount`, `companyId` and `date`. `amount` and `date` can be filtered by many way but `companyId` can only be equal to a value.

```typescript
export const QUERY_STRING_JSON_SCHEMA = {
  type: 'object',
  properties: {
    ...buildSchemaForQueryParamsProperty('amount', 'number', [
      'eq',
      'ge',
      'gt',
      'le',
      'lt',
    ]),
    companyId: { type: 'string' },
    ...buildSchemaForQueryParamsProperty('date', 'string', [
      'eq',
      'ge',
      'gt',
      'le',
      'lt',
    ]),
    type: { enum: Object.values(TransactionType) },
  },
} as const;
```

## Update Action

For the read action, the http method should be PATCH and it should specify the schema for the body (with the fields that can be updated) and the params. Normally the params should include the "id" field and optionally the fields for the nested ids (eg: /company/:companyId/transactions).

### Example

```typescript
```

## Delete Action

For the read action, the http method should be GET and it should specify the schema for the params. Normally the params should include the "id" field and optionally the fields for the nested ids (eg: /company/:companyId/transactions).

### Example

```typescript
```

// End of work in progress.
