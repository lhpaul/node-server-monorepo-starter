# Template Setup Guide

This guide will help you set up your new repository created from the Node Server Monorepo Starter template.

> **Note**: This is a bare-bones starter template with minimal examples. You'll need to implement your own domain models, services, and endpoints. The template provides the infrastructure foundation and development tooling.

## Prerequisites

Before starting, ensure you have the following installed:

- Node.js **v22** ([nvm recommended](https://github.com/nvm-sh/nvm))
- [pnpm](https://pnpm.io/installation)
- [Turborepo CLI](https://turborepo.com/) (`pnpm install turbo --global`)
- [Google Cloud CLI (gcloud)](https://cloud.google.com/sdk/docs/install)
- [Firebase CLI](https://firebase.google.com/docs/cli)

## Step 1: Update Project Identifiers

### 1.1 Firebase Project Configuration

Update `.firebaserc` with your Firebase project IDs:

```json
{
  "projects": {
    "default": "your-actual-project-dev",
    "dev": "your-actual-project-dev",
    "stg": "your-actual-project-stg",
    "prod": "your-actual-project-prod"
  }
}
```

### 1.2 Environment Variables

Update the environment constants in `packages/shared/src/constants/environments.constants.ts`:

```typescript
export const ENV_VALUES: Record<string, Record<string, string>> = {
  [ENV_VARIABLES_KEYS.FIREBASE_DATABASE_URL]: {
    DEV: 'https://your-actual-project-dev.firebaseio.com',
    STG: 'https://your-actual-project-stg.firebaseio.com',
    PROD: 'https://your-actual-project-prod.firebaseio.com',
  },
  [ENV_VARIABLES_KEYS.FIREBASE_PROJECT_ID]: {
    DEV: 'your-actual-project-dev',
    STG: 'your-actual-project-stg',
    PROD: 'your-actual-project-prod',
  },
  [ENV_VARIABLES_KEYS.MOCK_TRANSACTIONS_ENDPOINT]: {
    DEV: 'your-transactions-dev',
    STG: 'your-transactions-stg',
    PROD: 'your-transactions-prod',
  },
};
```

## Step 2: Google Cloud Setup

### 2.1 Create Google Cloud Projects

Create three Google Cloud projects for your environments:

1. **Development**: `your-actual-project-dev`
2. **Staging**: `your-actual-project-stg`
3. **Production**: `your-actual-project-prod`

### 2.2 Enable Required APIs

Enable the following APIs in each project:

- Firebase API
- Cloud Run API
- Cloud Functions API
- Secret Manager API
- Firestore API

### 2.3 Authentication

```bash
# Authenticate with Google Cloud
gcloud auth login

# Set default project (choose your dev project)
gcloud config set project your-actual-project-dev

# Authenticate with Firebase
firebase login
```

## Step 3: Environment Variables Setup

### 3.1 Copy Environment Files

Copy the example environment files to create your local environment files:

```bash
# For each application
cp apps/internal-api/.env.example apps/internal-api/.env
cp apps/public-api/.env.example apps/public-api/.env
cp apps/functions/.env.example apps/functions/.env
```

### 3.2 Update Environment Files

Edit each `.env` file and replace the placeholder values:

- `APP_ENV`: Set to `dev` for development
- `FIREBASE_DATABASE_URL`: Your actual Firebase database URL
- `FIREBASE_PROJECT_ID`: Your actual Firebase project ID
- `ENCRYPTION_KEY`: Generate a secure encryption key
- `MOCK_API_PROJECT_SECRET`: Generate a secure API secret

### 3.3 Configure Secrets in Google Cloud

Set up secrets in Google Cloud Secret Manager for each environment:

```bash
# For development environment
gcloud secrets create ENCRYPTION_KEY --data-file=- <<< "your-encryption-key"
gcloud secrets create MOCK_API_PROJECT_SECRET --data-file=- <<< "your-api-secret"

# Repeat for staging and production environments
```

## Step 4: Infrastructure Setup

### 4.1 Update Terraform Variables

Update the Terraform variables in `infra/environments/*/variables.tf` with your project-specific values.

### 4.2 Deploy Infrastructure

```bash
cd infra

# Deploy development environment
cd environments/develop
terraform init
terraform plan
terraform apply

# Repeat for staging and production
```

## Step 5: Install Dependencies

```bash
# Install all dependencies
pnpm install
```

## Step 6: Initial Deployment

### 6.1 Deploy Firestore Configuration

```bash
# Deploy Firestore rules and indexes
pnpm run deploy:firestore
```

### 6.2 Deploy Cloud Functions

```bash
# Deploy all functions
pnpm run deploy:functions
```

### 6.3 Deploy APIs

```bash
# Deploy internal API
pnpm run deploy:internal-api

# Deploy public API
pnpm run deploy:public-api
```

## Step 7: Update Documentation

### 7.1 Update README.md

- Replace template-specific information with your project details
- Update contact information
- Customize project description

### 7.2 Update TODOs.md

- Replace example TODOs with your project-specific tasks
- Remove this section when you've completed your setup

### 7.3 Review Conventions

- Review files in the `conventions/` folder
- Customize coding conventions to match your team's preferences

## Step 8: Development Setup

### 8.1 Start Development Servers

```bash
# Start internal API in development mode
pnpm run dev:internal-api

# Start public API in development mode (in another terminal)
pnpm run dev:public-api
```

### 8.2 Run Tests

```bash
# Run all tests
pnpm run test

# Run tests for specific package
cd packages/shared && pnpm run test
```

## Step 9: Clean Up Template Files

After completing your setup:

1. Remove `SETUP.md` (this file)
2. Remove `.github/TEMPLATE_CHECKLIST.md`
3. Update `README.md` to remove template-specific sections
4. Commit all your changes

## Troubleshooting

### Common Issues

1. **Firebase Authentication Issues**: Ensure you're logged in with `firebase login`
2. **Google Cloud Permission Issues**: Check that your account has the necessary permissions
3. **Build Failures**: Ensure all dependencies are installed with `pnpm install`
4. **Environment Variable Issues**: Verify that all required environment variables are set

### Getting Help

- Check the individual README files in each app directory
- Review the conventions in the `conventions/` folder
- Refer to the original template documentation if needed

## Next Steps

Once setup is complete:

1. **Implement Your Domain Models**: Create your actual business entities in `packages/shared/src/domain/entities/`
2. **Build Your Services**: Implement your business logic in `packages/shared/src/domain/services/`
3. **Create Your API Endpoints**: Build your actual endpoints in the API applications
4. **Implement Your Cloud Functions**: Replace the example function with your actual business functions
5. **Set Up Your Data Layer**: Implement repositories and data access patterns
6. Start developing your application features
7. Set up CI/CD pipelines for automated deployment
8. Configure monitoring and logging
9. Set up proper backup and disaster recovery procedures

Happy coding! 🚀

