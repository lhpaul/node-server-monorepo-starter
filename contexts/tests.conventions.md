# Tests Conventions

This document outlines the testing conventions used in this repository. Adhering to these guidelines ensures consistency and maintainability.

## Test File Organization

- Test files should be named with `.spec.ts` suffix
- Place test files in a `__tests__` folder in the same directory as the file being tested
- Name test files to match the file they're testing (e.g., `user.service.ts` → `__test__/user.service.spec.ts`)

## General Guidelines

- When possible, use class or functions name property instead of a string. This will avoid problems in case of renaming.

**Don't:**

```typescript
describe('proxyHandler', () => {
  ...
```

**Instead:**

```typescript
describe(proxyHandler.name, () => {
  ...
```

- When asserting, reference the constants values instead of defining them again.

**Don't:**

```typescript
expect(mockLogger.endStep).toHaveBeenCalledWith("proxy-request");
```

**Instead:**

```typescript
import { STEPS } from '../some.service.constants.ts';
...
expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.PROXY_REQUEST.id);
```
