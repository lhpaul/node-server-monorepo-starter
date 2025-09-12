# Firebase Functions

A [Firebase Functions](https://firebase.google.com/docs/functions) application for [Firestore](https://firebase.google.com/docs/firestore/extend-with-functions), [Pub/Subs](https://firebase.google.com/docs/functions/pubsub-events?gen=2nd), and [Schedulers](https://firebase.google.com/docs/functions/schedule-functions?gen=2nd) triggers.

## Project Structure

```bash
src/
├── constants/        # Global constants used throughout the project
├── definitions/      # TypeScript definitions, interfaces, and types for type safety
├── functions/        # Cloud Functions configurations and handlers (Firestore, Pub/Sub, Schedulers)
├── models/           # Models specific to the scope of cloud functions
├── repositories/     # Data access layer for collections that are exclusively used in cloud functions
├── services/         # Business logic and service layer implementations
├── utils/            # Reusable utility functions
├── index.ts          # Main application entry point to declare the cloud functions to be deployed
.eslint.config.js     # ESLint linting rules
jest.config.ts        # Jest configuration file
package.json          # Workspace configuration
tsconfig.json         # TypeScript configuration
```

## Deployment

To test your development, you must deploy the functions from your machine to the development environment project. Follow these steps:

1. **Configure projects** in [.firebaserc](../../.firebaserc). If you have only a develop environment, that's okay—you can leave the rest blank.

2. **Set the target environment:**

```bash
firebase use dev
```

> **Note 1:** Normally deployment from your machine should only be allowed for the develop environment since for other environments the deployments should be done in a workflow using CI/CD.
> **Note 2:** Environment values rely on the `APP_ENV` environment variable, so they are loaded automatically by the `.env.dev`, `.env.stg`, `.env.prod` files during deployment.

1. **Deploy from the root directory:**

```bash
pnpm run deploy:functions
```

### Deploy a Specific Function

To avoid deploying all functions, you can deploy a specific one with the following command:

```bash
turbo run build --parallel && firebase deploy --only functions:{function-name}
```

> **Note:** The structure of a function name is `{functionType}-{functionName}`. For example:

```typescript
// Firestore
export const firestore = {
  transactionUpdateRequestOnWrite: transactionUpdateRequestOnWriteFunction,
};

// Pub/Subs
export const pubSubs = {
  notifySubscriptionAboutToExpire: notifySubscriptionAboutToExpireFunction,
};

// Schedulers
export const schedulers = {
  checkForAboutToExpireSubscriptions: checkForAboutToExpireSubscriptionsFunction,
};
```

These translate to the following deployable function names:

- `firestore-transactionUpdateRequestOnWrite`
- `pubSubs-notifySubscriptionAboutToExpire`
- `schedulers-checkForAboutToExpireSubscriptions`

### Troubleshooting

#### Permission Denied on Deployment

If you encounter this error:

```bash
Request to https://serviceusage.googleapis.com/v1/projects/node-starter-project-dev/services/cloudfunctions.googleapis.com had HTTP Error: 403, Permission denied to get service [cloudfunctions.googleapis.com]
Help Token: ...
```

It might be because of service account impersonation used when developing in the APIs on this project.

**Solution:**

1. To unset impersonation, run the following command:

```bash
gcloud config unset auth/impersonate_service_account
```

### References

- [Firebase Functions](https://firebase.google.com/docs/functions)
- [Firestore Triggers](https://firebase.google.com/docs/firestore/extend-with-functions)
- [Pub/Subs Events](https://firebase.google.com/docs/functions/pubsub-events?gen=2nd)
- [Schedule Functions](https://firebase.google.com/docs/functions/schedule-functions?gen=2nd)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Google Cloud CLI Reference](https://cloud.google.com/sdk/gcloud)
- [Configure your environment](https://firebase.google.com/docs/functions/config-env)
- [Cloud Functions local debugging](https://www.youtube.com/watch?v=v6ll4UxS0Os)

## Secret Handling

This application uses Google Cloud Secret Manager to securely store sensitive configuration values that are injected as environment variables during deployment.

### How Secrets Work

Secrets are accessed in the application as regular environment variables. The `getSecret` utility function from `@repo/shared` provides a safe way to access these values with proper error handling.

```typescript
import { getSecret } from '@repo/shared';

const apiKey = getSecret('EXTERNAL_API_KEY');
```

> **Note**: Always use the `getSecret` utility function from `@repo/shared` instead of directly accessing `process.env`. This utility provides proper error handling and ensures the secret exists.

### Declaring Secrets in Functions

To access a secret as an environment variable, you must declare it when configuring the cloud function.

**Example:**

```typescript
import { SECRETS } from '@repo/shared/constants';

// When configuring your function, add the secrets array
export const myFunction = onMessagePublishedWrapper(
  MyMessage,
  myHandler,
  {
    topic: MY_TOPIC,
    maxInstances: MAX_INSTANCES,
    secrets: [SECRETS.MY_API_KEY] // ← Declare secrets here
  }
);
```

**Key points:**

- Import the secret constants from `@repo/shared/constants`
- Add a `secrets` array to your function configuration
- Each secret in the array becomes available as an environment variable

### Adding a New Secret

To add a new secret that will be available as an environment variable in your deployed service:

1. **Set the correct Google Cloud project:**

   ```bash
   firebase use dev
   ```

2. **Create the secret in Secret Manager:**

   ```bash
   firebase functions:secrets:set SECRET_NAME
   ```

   Enter the secret value when prompted.

3. ** Define the secret constant

First, add your new secret to the `SECRETS` constant in the shared package:

```typescript
// packages/shared/src/constants/secrets.constants.ts
export const SECRETS = {
  // ... existing secrets
  SECRET_NAME: 'SECRET_NAME',
} as const;
```

### Reference

- [Firebase Functions - Secret parameters](https://firebase.google.com/docs/functions/config-env#secret-parameters)
