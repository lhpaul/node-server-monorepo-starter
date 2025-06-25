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

To test your development, you must deploy the functions from your machine to the development environment project. This must be done from the root directory by running:

```bash
pnpm run deploy:functions
```

An alternative to avoid deploying all functions, you can deploy a specific one with the following command:

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

## Troubleshooting

### Permission Denied on Deployment

If you encounter this error:

```bash
Request to https://serviceusage.googleapis.com/v1/projects/node-starter-project-dev/services/cloudfunctions.googleapis.com had HTTP Error: 403, Permission denied to get service [cloudfunctions.googleapis.com]
Help Token: AeNz4PjfzIUS4gQ1p-GMtnaKe4xK7_kxgrGna_n1kLZv_Ch6dMR5pgQRgJnQocnfuBg0gWg6ncldOaLIU6w4OGzin6RdL-GkA7MwiQAr95zls-wc
```

It might be because of service account impersonation used when developing in the APIs on this project.

**Solution:**

1. To unset impersonation, run the following command:

```bash
gcloud config unset auth/impersonate_service_account
```

## References

- [Firebase Functions](https://firebase.google.com/docs/functions)
- [Firestore Triggers](https://firebase.google.com/docs/firestore/extend-with-functions)
- [Pub/Subs Events](https://firebase.google.com/docs/functions/pubsub-events?gen=2nd)
- [Schedule Functions](https://firebase.google.com/docs/functions/schedule-functions?gen=2nd)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Google Cloud CLI Reference](https://cloud.google.com/sdk/gcloud)
