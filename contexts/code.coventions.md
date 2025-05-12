# Code Conventions

This document outlines the coding conventions used in this repository. Adhering to these guidelines ensures consistency and maintainability.

## String Literals

This project uses single quotes for string literals to maintain consistency across the codebase. Double quotes should only be used when required, such as for JSON properties or when escaping single quotes within a string.

## Fields Declaration Order

Fields must be declared in alphabetical order within interfaces, types, and classes. This convention improves code readability and makes it easier to locate specific fields.

**Don't:**

```typescript
interface Person {
  name: string;
  age: number;
  lastName: string;
  email?: string;
  firstName: string;
}
```

**Instead:**

```typescript
interface Person {
  age: number;
  email?: string;
  firstName: string;
  lastName: string;
  name: string;
}
```

## Constants Over Hard Coded Values

To ensure maintainability and consistency, always use constants instead of hard-coded values in the codebase. This approach improves readability, reduces duplication, and makes it easier to update values when needed.

### Benefits of Using Constants

- **Centralized Management**: Constants are defined in a single location, making updates straightforward.
- **Improved Readability**: Named constants provide context, making the code easier to understand.
- **Reduced Errors**: Avoids accidental inconsistencies caused by duplicating hard-coded values.

### Guidelines

1. Define constants in the `src/constants/` directory if they apply globally or inside a folder when constants only apply to specific context (e.g. `users.service.constants.ts` in the same folder as `users.service.ts`).
2. Use descriptive and meaningful names for constants.

**Example:**

```typescript
// filepath: src/constants/app.constants.ts
export const API_BASE_URL = "https://api.example.com";
export const DEFAULT_PAGE_SIZE = 20;
export const SUPPORTED_LANGUAGES = ["en", "es", "fr"];
```

```typescript
// Usage in code
import { API_BASE_URL, DEFAULT_PAGE_SIZE } from "../constants/app.constants";

const fetchUsers = async (page: number) => {
  const response = await fetch(
    `${API_BASE_URL}/users?page=${page}&size=${DEFAULT_PAGE_SIZE}`,
  );
  return response.json();
};
```

By following these practices, the codebase remains clean, consistent, and easier to maintain.

## Module Import Order

Maintain a consistent import order within each file:

1. **External Dependencies:**
   - Import all third-party packages first (e.g., `react`, `lodash`, `axios`).
   - Sort these alphabetically. Treat scoped packages or path aliases beginning with `@` (e.g., `@nestjs/common`, `@components`) as preceding other letters.
2. **Internal Project Modules:**
   - Import modules from within this project after external dependencies.
   - Primary sort criterion: Relative path depth. Imports from higher-level directories (e.g., `../../../config`) come before those from closer directories (e.g., `../services`, `./utils`).
   - Secondary sort criterion: Alphabetical order for modules at the same path depth.

**Example:**

```typescript
// External dependencies (alphabetical, @ first)
import { Injectable } from "@nestjs/common";
import axios from "axios";
import * as bcrypt from "bcrypt";

// Internal modules (farthest path first, then alphabetical)
import { AppConfig } from "../../../config";
import { DatabaseService } from "../../database/database.service";
import { User } from "../entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { hashPassword } from "./utils/security.utils";
```
