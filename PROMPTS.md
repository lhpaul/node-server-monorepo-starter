# Development Prompts

This document contains example prompts for common development tasks.

## Create a New Domain Entity

```markdown
Create a domain model and its corresponding repository for the "Transaction" entity in the "shared" package with the following attributes:

- amount: numeric value representing the transaction amount
- date: timestamp of when the transaction occurred
- id: unique identifier for the database document
- type: transaction type (credit or debit)

Add next to each attribute a comment explaining in what they consist.

Use model "Company" as guidance.

Do not make the unit tests.
```

`Files as context:`

- contexts/code.conventions.md
- contexts/general.conventions.md
- contexts/logs.conventions.md
- contexts/tests.conventions.md

```markdown
Add the unit tests for the created file
```

## Creating a New API Endpoint

```markdown
Implement a new "/transactions" endpoint in the "public-api" application with full CRUD operations.
Use the TransactionsRepository from the "shared" package.

Use the "/companies" as guidance.

Do not write the unit tests.
```

### Files as context

- contexts/code.conventions.md
- contexts/endpoints.conventions.md
- contexts/general.conventions.md
- contexts/logs.conventions.md
- contexts/tests.conventions.md

```markdown
Add the unit tests for the created files. As before, use "/companies" endpoint as guidance
```

## Writing Unit Tests

```markdown
Write the unit tests for transactions.list.handler.ts file
```

`Files as context:`

- transactions.list.handler.spec.ts
- contexts/code.conventions.md
- contexts/tests.conventions.md
