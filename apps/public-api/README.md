# Public API

A [Fastify](https://fastify.dev/) application that provides a REST API implementation. Designed for secure internet-facing access with robust authentication and authorization protocol through Firebase Authentication.

## Structure

```bash
src/
├── constants/        # Global constants used throughout the project
├── definitions/      # TypeScript definitions, interfaces and types for type safety
├── endpoints/        # Api endpoints configurations and handlers
├── services/         # Business logic and service layer implementations
├── utils/            # Reusable utility functions
├── index.ts          # Main application entry point
├── routes.ts         # API route definitions and handlers
└── server.ts         # Server configuration and initialization
.eslintrc.js          # ESLint linting rules
.prettierrc.js        # Prettier linting rules
jest.config.ts        # Jest configuration file
package.json          # Workspace configuration
tsconfig.json         # Typescript configuration
```

## Development Setup

Follow these steps to set up your development environment:

### 1. Environment Configuration

Create a `.env` file in the root directory by copying the example file:

```bash
cp .env.example .env
```

### 2. Google Cloud Authentication

This project requires Google Cloud authentication for Firebase and other Google services. Follow these steps:

1. Install the Google Cloud CLI (gcloud) if you haven't already:
   - [Installation Guide](https://cloud.google.com/sdk/docs/install)

2. Log in to your Google Cloud account:

   ```bash
   gcloud auth login
   ```

3. Set up service account impersonation. For this you'll need the email of the `firebase-adminsdk` service account that can be found in `IAM & Admin/Service Accounts` from Google Cloud console of the project:

   ```bash
   gcloud auth application-default login --impersonate-service-account <service_account_email>
   ```

   After successful execution, note the path to the credentials file shown in the output. You'll need this for the `GOOGLE_APPLICATION_CREDENTIALS` environment variable.

### 3. Configure Environment Variables

Update the following in your `.env` file:

- Set `GOOGLE_APPLICATION_CREDENTIALS` to the path from step 2
- Configure other environment variables as needed for local development

> ⚠️ **Security Note**: Never commit the `.env` file to version control as it contains sensitive credentials.

### Troubleshooting

#### Service Account Permission Error

If you encounter this error:

```bash
Credential implementation provided to initializeApp() via the "credential" property failed to fetch a valid Google OAuth2 access token with the following error: "PERMISSION_DENIED: unable to impersonate: Permission 'iam.serviceAccounts.getAccessToken' denied on resource (or it may not exist)."
```

or

```bash
Permission 'iam.serviceAccounts.signBlob' denied on resource (or it may not exist).; Please refer to https://firebase.google.com/docs/auth/admin/create-custom-tokens for more details on how to use and troubleshoot this feature.
```

**Solution:**

1. Ensure your IAM user has the `roles/iam.serviceAccountTokenCreator` permission
   - [Required IAM Roles Documentation](https://cloud.google.com/docs/authentication/use-service-account-impersonation#required-roles). Contact your technical lead if you need permission updates
2. After receiving permissions, run the service account impersonation command again (step 2.3)

#### Additional Resources

- [Google Cloud Authentication Setup](https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment)
- [Service Account Impersonation Guide](https://cloud.google.com/docs/authentication/use-service-account-impersonation#adc)
