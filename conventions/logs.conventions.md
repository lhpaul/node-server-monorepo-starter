# Logs Conventions

This document outlines the logging conventions used in this repository. Adhering to these guidelines ensures consistency and maintainability.

## Required Fields

Production logs should always define a `logId` field with a unique string identifier (unique in an execution) to correlate logs across different executions.

**Example:**

```typescript
/*
lets assume that the values are defined a constant like this:
export const RESOURCE_NOT_FOUND_ERROR = {
    logId: 'resource-not-found',
    logMessage: 'The requested resource was not found',
}
*/
request.log.warn(
  {
    logId: RESOURCE_NOT_FOUND_ERROR.logId,
    requestId: request.id,
    url: request.url,
  },
  RESOURCE_NOT_FOUND_ERROR.logMessage,
);
```

## Monitoring Performance

To effectively monitor performance, wrap asynchronous calls with the `startStep` and `endStep` functions provided by the logger object. These functions generate logs that measure the total time elapsed during execution, making it easier to identify and troubleshoot slow operations.

**Important:** When using the `startStep` function, always supply a log group to ensure performance logs are well-organized and easy to trace. The recommended approach is to use the class name combined with the function name (e.g., `${ClassName}.${functionName}`), or at minimum, the function name itself. This practice helps categorize logs by context and improves traceability across the codebase.

**Example:**

```typescript
/*
lets assume that the STEPS constant is defined like this:
export const STEPS = {
  UPDATE_USER: 'proxy-request',
  NOTIFY_USER: 'notify-user'
};
*/

class SomeClass {
  // ...

  async function someFunction(..args): Promise<void> {

    const logGroup = `${SomeClass.name}.${this.someFunction.name}`;
    try {
      logger.startStep(STEPS.UPDATE_USER, logGroup);
      await usersService
        .updateUser()
        .finally(() => logger.endStep(STEPS.UPDATE_USER));
      logger.endStep(STEPS.UPDATE_USER);
      logger.startStep(STEPS.NOTIFY_USER, logGroup);
      await usersService
        .notifyUser()
        .finally(() => logger.endStep(STEPS.NOTIFY_USER));
      // Continue with further logic...
    } catch (error) {
      // Handle the error...
    }
  }
}
```

### Best Practices

1. Use meaningful step names to clearly indicate the operation being monitored (e.g., `'update-user'`, `'fetch-data'`).
2. Always ensure `endStep` is called, even in error scenarios, to maintain accurate performance logs.

By following these practices, you can ensure that performance monitoring logs remain clear, consistent, and actionable.
