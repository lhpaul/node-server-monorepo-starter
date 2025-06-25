# Firestore Configuration Management

Firestore configuration management for [rules](https://firebase.google.com/docs/firestore/security/get-started#use_the_cli) and [indexes](https://firebase.google.com/docs/firestore/query-data/indexing#use_the_firebase_cli) using the CLI.

## Project Structure

```bash
firestore.indexes.json  # Indexes configuration
firestore.rules         # Security rules configuration
```

## Deployment

All deployment commands should be run from the root directory of the repository.

### Deploy Firestore Rules

Deploy only the Firestore security rules:

```bash
pnpm run deploy:firestore:rules
```

### Deploy Firestore Indexes

Deploy only the Firestore indexes:

```bash
pnpm run deploy:firestore:indexes
```

### Deploy Both Rules & Indexes

Deploy both rules and indexes in a single command:

```bash
pnpm run deploy:firestore
```

## Troubleshooting

### Permission Denied on Deployment

If you encounter an error like:

```bash
Request to https://serviceusage.googleapis.com/v1/projects/node-starter-project-dev/services/cloudfunctions.googleapis.com had HTTP Error: 403, Permission denied to get service [cloudfunctions.googleapis.com]
Help Token: AeNz4PjfzIUS4gQ1p-GMtnaKe4xK7_kxgrGna_n1kLZv_Ch6dMR5pgQRgJnQocnfuBg0gWg6ncldOaLIU6w4OGzin6RdL-GkA7MwiQAr95zls-wc
```

This may be due to service account impersonation settings.

**Solution:**

Unset impersonation with:

```bash
gcloud config unset auth/impersonate_service_account
```

## References

- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Google Cloud CLI Reference](https://cloud.google.com/sdk/gcloud)
