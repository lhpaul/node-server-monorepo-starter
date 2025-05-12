# Development Prompts

This document contains example prompts for common development tasks.

## Creating a New Domain Entity

```markdown
Create a domain model and its corresponding repository for the "Transaction" entity in the "shared" package with the following attributes:

- amount: numeric value representing the transaction amount
- date: timestamp of when the transaction occurred
- id: unique identifier for the database document
- type: transaction type (credit or debit)
```

### Files as context:

- contexts/code.conventions.md
- contexts/general.conventions.md
- contexts/logs.conventions.md
- contexts/tests.conventions.md

## Creating a New API Endpoint

```markdown
Implement a new "/transactions" endpoint in the "rest-api" application with full CRUD operations.
Use the Transaction Repository from the "shared" package.
```

### Files as context:

- contexts/code.conventions.md
- contexts/endpoints.conventions.md
- contexts/general.conventions.md
- contexts/logs.conventions.md
- contexts/tests.conventions.md

## Writing Unit Tests

```markdown
Write the unit tests for transactions.list.handler.ts file
```

### Files as context:

- transactions.list.handler.spec.ts
- contexts/code.conventions.md
- contexts/tests.conventions.md
