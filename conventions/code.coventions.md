# Code Conventions

This document outlines the coding conventions used in this repository. Adhering to these guidelines ensures consistency, maintainability, and improved code quality across the project.

## String Literals

This project uses single quotes for string literals to maintain consistency across the codebase. Double quotes should only be used when required, such as for JSON properties or when escaping single quotes within a string.

**Example:**

```typescript
const message = 'Hello, world!';
const jsonString = '{"key": "value"}';
const escapedString = 'It\'s a beautiful day';
```

## Field Declaration Order

Fields must be declared in alphabetical order within interfaces, types, and classes. This convention improves code readability and makes it easier to locate specific fields during development and code reviews.

**❌ Incorrect:**

```typescript
interface Person {
  name: string;
  age: number;
  lastName: string;
  email?: string;
  firstName: string;
}
```

**✅ Correct:**

```typescript
interface Person {
  age: number;
  email?: string;
  firstName: string;
  lastName: string;
  name: string;
}
```

## Constants Over Hard-Coded Values

To ensure maintainability and consistency, always use constants instead of hard-coded values throughout the codebase. This approach improves readability, reduces duplication, and simplifies future updates.

### Benefits of Using Constants

- **Centralized Management**: Constants are defined in a single location, making updates straightforward and reducing the risk of inconsistencies.
- **Improved Readability**: Named constants provide meaningful context, making the code easier to understand and maintain.
- **Reduced Errors**: Eliminates accidental inconsistencies caused by duplicating hard-coded values across multiple files.
- **Better Refactoring**: Changes to constant values only require updates in one location.

### Guidelines

1. **Global Constants**: Define constants in the `src/constants/` directory when they apply across multiple modules or the entire application.
2. **Local Constants**: Place constants in the same folder as the related code when they only apply to a specific context (e.g., `users.service.constants.ts` alongside `users.service.ts`).
3. **Naming Convention**: Use descriptive, meaningful names in UPPER_SNAKE_CASE for constants.
4. **Documentation**: Add JSDoc comments for complex constants to explain their purpose and usage.

**Example:**

```typescript
// filepath: src/constants/app.constants.ts
/**
 * Base URL for all API endpoints
 */
export const API_BASE_URL = 'https://api.example.com';

/**
 * Default number of items per page for pagination
 */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Supported language codes for internationalization
 */
export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr'];
```

```typescript
// Usage in code
import { API_BASE_URL, DEFAULT_PAGE_SIZE } from '../constants/app.constants';

const fetchUsers = async (page: number) => {
  const response = await fetch(
    `${API_BASE_URL}/users?page=${page}&size=${DEFAULT_PAGE_SIZE}`,
  );
  return response.json();
};
```

By following these practices, the codebase remains clean, consistent, and significantly easier to maintain.

## Module Import Order

Maintain a consistent import order within each file to improve readability and make dependencies clear at a glance.

### Import Order Rules

1. **External Dependencies:**
   - Import all third-party packages first (e.g., `react`, `lodash`, `axios`).
   - Sort these alphabetically. Treat scoped packages or path aliases beginning with `@` (e.g., `@nestjs/common`, `@components`) as preceding other letters in the alphabet.

2. **Internal Project Modules:**
   - Import modules from within this project after external dependencies.
   - **Primary sort criterion**: Relative path depth. Imports from higher-level directories (e.g., `../../../config`) come before those from closer directories (e.g., `../services`, `./utils`).
   - **Secondary sort criterion**: Alphabetical order for modules at the same path depth.

3. **Import Statement Formatting:**
   - Components imported from a module should be declared in alphabetical order.
   - If the number of imported components exceeds 3, declare them in multiple lines for better readability.

**Example:**

```typescript
// External dependencies (alphabetical, @ first)
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as bcrypt from 'bcrypt';

// Internal modules (farthest path first, then alphabetical)
import { AppConfig, EnvironmentConfig } from '../../../config';
import {
  DatabaseService,
  DateField,
  FloatField,
  IntegerField
} from '../../database/database.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { hashPassword } from './utils/security.utils';
```

Following these import conventions makes the code more readable and helps developers quickly understand the dependencies of each module.
