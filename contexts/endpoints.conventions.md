# Endpoints Conventions

This document outlines the endpoints conventions used in this repository. Adhering to these guidelines ensures consistency and maintainability.

## Best Practices and Naming Conventions

When defining a new endpoint, take in consideration the [API Best Practices and Naming Conventions](https://github.com/saifaustcse/api-best-practices/blob/main/README.md)

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

Note: 5XX and 404 errors are handled globally in the [server file](../src/server.ts) and don't need to be handled in individual endpoints.
