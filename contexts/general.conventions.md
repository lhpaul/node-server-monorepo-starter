# General conventions

This document outlines the general conventions used in this repository. Adhering to these guidelines ensures consistency and maintainability.

## File Naming Suffixes

Use the following suffixes in filenames (before the extension, e.g., `users.service.ts`) to indicate the file's purpose:

- `.constants.ts`: Contains constant values. No logic should be included.
- `.errors.ts`: Defines custom error classes with minimal logic.
- `.interfaces.ts`: Holds TypeScript interfaces and type definitions. No logic should be included.
- `.service.ts`: Implements classes that encapsulate core business logic or interact with data sources.
- `.utils.ts`: Contains reusable utility functions, typically pure and stateless.
- `.class.ts`: Defines utility classes.
- `.mocks.ts`: Provides mock classes, constants, or functions for testing purposes.

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

Similarly, when making requests to external APIs, define which fields should be masked in the request and response logs.

**Example:**

```typescript
const { data: responseData, error } = await apiRequest<any>(
  {
    method,
    url,
    payload,
    headers,
  },
  {
    maskOptions: {
      requestPayloadFields: ["email", "password"],
      requestHeaders: ["x-api-key"],
      responsePayloadFields: ["token"],
    },
  },
);
```

For more details, refer to the [IMaskRequestOptions](src/utils/api-requests/api-requests.utils.interfaces.ts) interface in `src/utils/api-requests/api-requests.utils.interfaces.ts`.
