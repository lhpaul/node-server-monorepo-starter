# Internal API

A [Fastify](https://fastify.dev/) application that provides a REST API and MCP server implementation. Designed for server-to-server communication with authentication via API keys or service accounts. Ideally it should be used in a internal network to ensure secure data transmission.

## Structure

```bash
src/
├── constants/        # Global constants used throughout the project
├── definitions/      # TypeScript definitions, interfaces and types for type safety
├── mcp/              # Model Context Protocol (MCP) server implementation and resources
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

Most environment variables are used to reference secrets required by the application; for details on how secrets are managed and accessed, see the [Secret Management](#secret-management) section.

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

## Authentication

This API uses API keys for authentication. To authenticate your requests:

1. Include your API key in the `x-api-key` header
2. API keys are composed of a client ID and private key, formatted as `clientId:privateKey`
3. The combined string must be Base64 encoded

### Example

For testing purposes, you can use this pre-configured API key:

- Client ID: `client-1`
- Private Key: `private-key-1`
- Base64 Encoded: `Y2xpZW50LTE6cHJpdmF0ZS1rZXktMQ==`

Example request:

```bash
curl --location --request GET 'localhost:4001/v1/transactions?companyId=1' \
--header 'x-api-key: Y2xpZW50LTE6cHJpdmF0ZS1rZXktMQ=='
```
## Secret Management

This application uses Google Cloud Secret Manager to securely store sensitive configuration values that are injected as environment variables during deployment.

### How Secrets Work

Secrets are accessed in the application as regular environment variables. The `getSecret` utility function from `@repo/shared` provides a safe way to access these values with proper error handling.

```typescript
   import { getSecret } from '@repo/shared';

   const apiKey = getSecret('EXTERNAL_API_KEY');
```

   > **Note**: Always use the `getSecret` utility function from `@repo/shared` instead of directly accessing `process.env`. This utility provides proper error handling and ensures the secret exists.

**For Local Development:**
- Add secrets to your `.env` file with their actual values
- Also add them to `.env.example` file (without values) for documentation purposes

**When Deployed:**
- Secrets are configured in the Terraform infrastructure code (`infra/services/internal-api/main.tf`)
- They are automatically injected as environment variables when the Cloud Run service is deployed
- Changes to secrets require updating the infrastructure code and deploying the infrastructure. For more information checkout the infrastructure [README](../../infra/README.md)

### Adding a New Secret

#### For Local Development

##### Step 1: Define the Secret Constant

First, add your new secret to the `SECRETS` constant in the shared package:

```typescript
// packages/shared/src/constants/secrets.constants.ts
export const SECRETS = {
  // ... existing secrets
  DATABASE_PASSWORD: 'DATABASE_PASSWORD',
} as const;
```

##### Step 2: Create Environment Files

Create a `.env.example` file in the public-api directory (if it doesn't exist) and add your secret:

```bash
# apps/public-api/.env.example
# ... existing secrets and environment variables
DATABASE_PASSWORD= # Add your new secret here (leave value blank for documentation)
```

Then create your local `.env` file with actual values:

```bash
# apps/public-api/.env
# ... existing secrets and environment variables
# Add your actual secret value here
DATABASE_PASSWORD=my-secure-db-password
```

##### Step 3: Update Environment Schema

Update the `FASTIFY_ENV_SCHEMA` in the server constants to validate the new secret:

```typescript
// apps/public-api/src/constants/server.constants.ts
import { ENV_VARIABLES_KEYS, SECRETS } from '@repo/shared/constants';

export const FASTIFY_ENV_SCHEMA = {
  // ... existing properties
  [SECRETS.DATABASE_PASSWORD]: { type: 'string' },
  // ... existing required fields
  SECRETS.DATABASE_PASSWORD,
} as const;
```

##### Step 4: Use the Secret in Your Code

Access your secret using the `getSecret` utility function:

```typescript
import { getSecret } from '@repo/shared';
import { SECRETS } from '@repo/shared/constants';

const dbPassword = getSecret(SECRETS.DATABASE_PASSWORD);
// Use dbPassword in your database connection

#### For Deployment

To add a new secret that will be available as an environment variable in your deployed service:

1. **Ensure you're working with the correct Google Cloud project:**

   ```bash
   gcloud config get-value project
   ```

   If you need to switch to a different project:

   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Create the secret in Google Cloud Secret Manager:**

   ```bash
   gcloud secrets create SECRET_NAME --data-file=- <<< "your-secret-value"
   ```

   For example, to create an API key secret:

   ```bash
   gcloud secrets create external-api-key --data-file=- <<< "sk-1234567890abcdef"
   ```

3. **Update the infrastructure code** (`infra/services/internal-api/main.tf`):

   Add a new environment variable entry in the `environment_variables` list:

   ```hcl
   {
     name = "ENVIRONMENT_VARIABLE_NAME"
     value_source = {
       secret = "SECRET_NAME"
       version = "latest"
     }
   }
   ```

   For example, if you created a secret called `external-api-key` and want it available as `EXTERNAL_API_KEY`:

   ```hcl
   {
     name = "EXTERNAL_API_KEY"
     value_source = {
       secret = "external-api-key"
       version = "latest"
     }
   }
   ```

   Once you've updated the infrastructure code, apply the changes to deploy them. For detailed instructions, refer to the infrastructure [README](../../infra/README.md).


### Security Best Practices

- Never commit secret values to version control
- Use descriptive names for secrets that indicate their purpose
- Use the `:latest` version in deployment to ensure you always get the most recent value
- Limit access to secrets using IAM policies

### Additional Resources

- [Google Cloud Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Secret Manager Best Practices](https://cloud.google.com/secret-manager/docs/best-practices)