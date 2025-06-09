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

Do not make the unit tests yet.
```

`Files as context:`

- contexts/code.conventions.md
- contexts/general.conventions.md
- contexts/logs.conventions.md

```markdown
Add the unit tests for the model and the repository file.
```

## Create the Repository of An Existing Entity

```markdown
Create the repository for the User model.

Do not make the unit tests yet.
```

`Files as context:`

- <model file>
- contexts/code.conventions.md
- contexts/general.conventions.md
- contexts/logs.conventions.md

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

## Writing Unit Tests Option 1: From Scratch

```markdown
Write the unit tests for this file file
```

`Files as context:`

- <file to be tested>
- contexts/code.conventions.md
- contexts/tests.conventions.md

## Writing Unit Tests Option 2: Based On a Similar File

```markdown
Create the unit tests for this file. Use as guidance what was done in <similar file> and <unit tests file from similar file>
```

`Files as context:`

- <file to be tested>
- <similar file>
- <unit tests file from similar file>
- contexts/code.conventions.md
- contexts/tests.conventions.md

## Update Unit Tests

```markdown
Update this tests since the tested component have had some changes
```

`Files as context:`

- <current file with tests>
- contexts/code.conventions.md
- contexts/tests.conventions.md
