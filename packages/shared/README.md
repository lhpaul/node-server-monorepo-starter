# @monorepo/shared

This package contains reusable components, utilities, and business logic shared across all applications in the monorepo. It serves as a central location for common code to maintain consistency and reduce duplication.

## Project Structure

```bash
src/
├── constants/       # Global constants used throughout the project
├── domain/          # Domain models and use cases
├── mocks/           # Component's mock implementations
├── repositories/    # Data layer component
├── services/        # Business logic and service layer implementations 
├── utils/           # Reusable utility functions
.eslintrc.js         # ESLint linting rules
.prettierrc.js       # Prettier linting rules
jest.config.ts       # Jest configuration file
package.json         # Workspace configuration
tsconfig.json        # Typescript configuration
```
