# Infrastructure as Code (IaC)

This directory contains the Terraform configuration for managing the Google Cloud Platform (GCP) infrastructure for the Node.js server monorepo project. The infrastructure is designed to support a scalable, production-ready application with Firebase backend services and Cloud Run APIs.

## Architecture Overview

The infrastructure consists of the following main components:

### Core Services
- **Google Cloud Project**: Central project with billing and basic services enabled
- **Firebase**: Authentication, Firestore database, and mobile/web app configurations
- **Cloud Run Services**: 
  - `public-api`: Public-facing API with external access
  - `internal-api`: Internal API with restricted access
- **Artifact Registry**: Docker image repository for Cloud Run deployments

### Supporting Infrastructure
- **Service Accounts**: Dedicated service accounts with appropriate IAM roles
- **Secret Manager**: Secure storage for API keys and sensitive configuration
- **Monitoring**: Performance monitoring with alerting thresholds
- **Billing**: Budget management with spending alerts
- **GitHub Actions**: CI/CD integration for automated deployments

### Environment Structure
- **Development** (`develop/`): Development environment configuration
- **Staging** (`staging/`): Staging environment configuration  
- **Production** (`production/`): Production environment configuration

## Prerequisites

- Install [Terraform](https://www.terraform.io/downloads.html) (>= 1.0.0)
- Install [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) and authenticate
- Access to a Google Cloud Organization with billing account
- Appropriate permissions to create projects and manage resources

## Modules

### Core Modules (`modules/`)

#### `cloud-run/`
Manages Cloud Run services with configurable scaling, environment variables, and IAM permissions.
- **Features**: Auto-scaling, secret management, public/private access control
- **Variables**: Service name, region, CPU/memory limits, environment variables

#### `firebase/`
Sets up Firebase project with mobile and web app configurations.
- **Features**: Android/iOS app registration, web app setup
- **Variables**: Package names, bundle IDs, web app configuration

#### `firebase-auth/`
Configures Firebase Authentication with authorized domains.
- **Features**: Domain authorization, authentication providers
- **Variables**: Authorized domains list

#### `firestore/`
Creates and configures Firestore database.
- **Features**: Database creation, security rules, indexes
- **Variables**: Project ID, region

### Service Modules (`services/`)

#### `public-api/`
Deploys the public-facing API service.
- **Features**: Public access, Firebase Admin SDK integration, secret management
- **IAM Roles**: Firebase SDK Admin, Secret Manager Access, Logging

#### `internal-api/`
Deploys the internal API service.
- **Features**: Internal access only, service-to-service communication
- **IAM Roles**: Similar to public API but with restricted access

### Utility Modules (`utils/`)

#### `billing-budget/`
Creates billing budgets with spending alerts.
- **Features**: Multi-threshold alerts (50%, 75%, 90%, 100%)
- **Variables**: Budget amount, currency, project scope

#### `performance-monitoring/`
Sets up monitoring and alerting for application performance.
- **Features**: Error tracking, latency monitoring, request counting
- **Variables**: Thresholds for errors, latency, and request counts

#### `terraform-backend/`
Configures remote state storage in Cloud Storage.
- **Features**: State locking, versioning, team collaboration

#### `github-actions/`
Sets up GitHub Actions integration for CI/CD.
- **Features**: Service account for deployments, IAM permissions

## [Optional] Create Service Account For Terraform

For production environments, create a dedicated service account for Terraform operations:

1. Create the service account with the following roles:
   - Editor
   - Project IAM Admin  
   - Service Usage Consumer

2. Recommended name: `infra-management`

3. Impersonate the service account:
```bash
gcloud auth application-default login --impersonate-service-account <service-account-email>
```

## Initial Setup

### 1. Configure Environment Variables

Navigate to the desired environment directory (e.g., `environments/develop/`) and review the configuration in `main.tf`:

```hcl
locals {
  project_id = "your-project-id"
}

module "main" {
  source = "../../"
  # ... other configuration
}
```

### 2. Initialize Terraform

```bash
cd environments/develop
terraform init
```

### 3. Plan and Apply

```bash
terraform plan -out=tfplan
terraform apply -auto-approve tfplan
```

### 4. Import Existing Resources (if needed)

If you have existing GCP resources, import them:

```bash
terraform import google_project.default your-project-id
terraform import google_firestore_database.default projects/your-project-id/locations/nam5/databases/(default)
terraform import google_artifact_registry_repository.cloud_run_deployment_sources_repository projects/your-project-id/locations/us-central1/repositories/cloud-run-source-deploy
```

## Deployment

### Standard Deployment

```bash
# Navigate to environment directory
cd environments/develop

# Initialize Terraform (first time only)
terraform init

# Review changes
terraform plan -out=tfplan

# Apply changes
terraform apply -auto-approve tfplan
```

### Environment-Specific Deployment

Each environment has its own configuration:

- **Development**: `environments/develop/`
- **Staging**: `environments/staging/`  
- **Production**: `environments/production/`

### Continuous Deployment

The infrastructure supports automated deployments through GitHub Actions:

1. **Push to main branch**: Triggers deployment to production
2. **Push to develop branch**: Triggers deployment to development
3. **Create pull request**: Triggers deployment to staging

### Manual Imports

If you need to import existing GCP resources:

```bash
# Import project
terraform import google_project.default your-project-id

# Import Firestore database
terraform import google_firestore_database.default projects/your-project-id/locations/nam5/databases/(default)

# Import Artifact Registry repository
terraform import google_artifact_registry_repository.cloud_run_deployment_sources_repository projects/your-project-id/locations/us-central1/repositories/cloud-run-source-deploy
```

## State Management

### Remote State Storage

Configure Terraform to store state in a Cloud Storage bucket:

```bash
terraform init -migrate-state
```

This enables:
- **State locking**: Prevents concurrent modifications
- **Versioning**: Track state changes over time
- **Team collaboration**: Shared state across team members

### State Security

- State files are encrypted at rest
- Access is controlled through IAM permissions
- State locking prevents corruption during concurrent operations

## Resource Management

### Destroying Resources

⚠️ **Warning**: This will permanently delete all infrastructure resources.

```bash
# Review what will be destroyed
terraform plan -destroy

# Destroy resources
terraform destroy
```

### Selective Destruction

To destroy specific resources:

```bash
# Destroy specific resource
terraform destroy -target=module.public-api

# Destroy specific module
terraform destroy -target=module.firebase
```

## Configuration

### Environment Variables

Key configuration variables that can be customized per environment:

| Variable | Description | Default |
|----------|-------------|---------|
| `project_id` | GCP Project ID | Required |
| `env` | Environment name (DEV/STAGING/PROD) | Required |
| `region` | GCP region for resources | `us-central1` |
| `billing_account_id` | Billing account for the project | Required |
| `authorized_domains` | Domains allowed for Firebase Auth | `["localhost"]` |
| `android_app_package_id` | Android app package name | `null` |
| `apple_app_bundle_id` | iOS app bundle ID | `null` |

### Monitoring Configuration

Performance monitoring thresholds can be adjusted:

```hcl
error_count_threshold = {
  threshold = 10
  issue_duration = "600s"
  alignment_period = "60s"
}

requests_latency_threshold = {
  threshold = 1000  # milliseconds
  issue_duration = "600s"
  alignment_period = "60s"
}
```

### Billing Configuration

Set up budget alerts:

```hcl
billing_budget_amount = {
  currency_code = "USD"
  units = 100  # $100 budget
}
```

## Domain Mapping

### Custom Domain Setup

[Map a custom domain to a Cloud Run service](https://cloud.google.com/run/docs/mapping-custom-domains#map)

1. **Verify domain ownership**:
```bash
gcloud domains verify <BASE_DOMAIN>
```

2. **Add DNS records** at your domain registrar:
   - Follow the [DNS update instructions](https://cloud.google.com/run/docs/mapping-custom-domains#dns_update)
   - Configure CNAME records for your subdomains

3. **Update authorized domains** in your environment configuration:
```hcl
authorized_domains = [
  "localhost",
  "api.yourdomain.com",
  "yourdomain.com"
]
```

## Security

### Service Account Permissions

The infrastructure follows the principle of least privilege:

- **Public API Service Account**: Limited to Firebase Admin SDK, Secret Manager, and logging
- **Internal API Service Account**: Restricted access for internal communication
- **Terraform Service Account**: Editor, Project IAM Admin, Service Usage Consumer roles

### Secret Management

- All sensitive data is stored in Google Secret Manager
- Secrets are referenced in Cloud Run environment variables
- Access is controlled through IAM permissions

### Network Security

- **Public API**: Accessible from the internet with proper authentication
- **Internal API**: Restricted to internal traffic only
- **Firestore**: Configured with security rules

### Monitoring and Alerting

- Performance monitoring with configurable thresholds
- Billing alerts to prevent unexpected costs
- Error tracking and latency monitoring

## Troubleshooting

### Common Issues

#### 1. Image Naming Conventions

Ensure Docker images follow [Artifact Registry naming conventions](https://cloud.google.com/artifact-registry/docs/docker/names#containers):

```
{region}-docker.pkg.dev/{project-id}/{repository-name}/{image-name}:{tag}
```

#### 2. Cloud Run Deletion Protection

**Error**: Cannot destroy service without setting deletion_protection=false

```bash
Error: cannot destroy service without setting deletion_protection=false and running `terraform apply`
```

**Solution**: Add deletion protection override to your Terraform configuration:

```hcl
resource "google_cloud_run_v2_service" "service" {
  # ... other configuration
  
  template {
    annotations = {
      "run.googleapis.com/deletion-protection" = "false"
    }
  }
}
```

#### 3. Service Disabled Error

**Error**: Identity Platform API requires quota project

```bash
Error: Error when reading or editing IdentityPlatformConfig: 
googleapi: Error 403: Your application is authenticating by using local Application Default Credentials. 
The identitytoolkit.googleapis.com API requires a quota project
```

**Solution**: Use service account impersonation as described in the [Service Account setup](#optional-create-service-account-for-terraform) section.

#### 4. Permission Denied

**Error**: Insufficient permissions for Terraform operations

**Solution**: Reset authentication and re-authenticate:

```bash
gcloud config unset auth/impersonate_service_account
gcloud auth application-default login
```

#### 5. Terraform State Issues

**Problem**: State file conflicts or corruption

**Solutions**:
- Use remote state storage with locking
- Run `terraform refresh` to sync state
- Use `terraform import` for existing resources

#### 6. API Not Enabled

**Error**: Service not enabled for project

**Solution**: Ensure all required APIs are enabled in the `google_project_service` resources.

### Debugging Commands

```bash
# Check Terraform version
terraform version

# Validate configuration
terraform validate

# Check current state
terraform show

# List all resources
terraform state list

# Refresh state
terraform refresh
```

## Best Practices

### Infrastructure Management

1. **Environment Separation**: Use separate Terraform configurations for each environment
2. **State Management**: Always use remote state storage with locking
3. **Version Control**: Keep all Terraform files in version control
4. **Review Changes**: Always run `terraform plan` before applying changes
5. **Resource Naming**: Use consistent naming conventions across environments

### Security

1. **Least Privilege**: Grant minimal required permissions to service accounts
2. **Secret Management**: Store all secrets in Google Secret Manager
3. **Network Security**: Use appropriate ingress settings for Cloud Run services
4. **Regular Audits**: Review IAM permissions and resource access regularly

### Monitoring

1. **Set Appropriate Thresholds**: Configure monitoring alerts based on expected usage
2. **Budget Alerts**: Set up billing alerts to prevent unexpected costs
3. **Log Analysis**: Monitor application logs for errors and performance issues

### Development Workflow

1. **Feature Branches**: Create feature branches for infrastructure changes
2. **Pull Requests**: Require reviews for infrastructure changes
3. **Testing**: Test changes in development environment first
4. **Documentation**: Keep documentation updated with changes

## Resources

### Learning Materials
- [IaC Google Cloud](https://www.youtube.com/watch?v=84Ql00Bjh1Y)
- [Terraform Files](https://spacelift.io/blog/terraform-files)
- [Managing Terraform State Files](https://www.youtube.com/watch?v=UDBVCzg2IRo)
- [GCP Terraform](https://www.youtube.com/watch?v=t6TxyALn05Y)
- [How To Structure Terraform Project (3 Levels)](https://www.youtube.com/watch?v=nMVXs8VnrF4)

### Official Documentation
- [Managing infrastructure as code with Terraform, Cloud Build, and GitOps](https://cloud.google.com/docs/terraform/resource-management/managing-infrastructure-as-code)
- [IAM roles and permissions index](https://cloud.google.com/iam/docs/roles-permissions)
- [Best practices for Cloud Run networking](https://cloud.google.com/run/docs/configuring/networking-best-practices)
- [Secret Manager](https://cloud.google.com/security/products/secret-manager)
- [Running Terraform in automation](https://developer.hashicorp.com/terraform/tutorials/automation/automate-terraform)

### Terraform Modules
- [Google Cloud Terraform Modules](https://github.com/terraform-google-modules)
  - [Project Factory](https://github.com/terraform-google-modules/terraform-google-project-factory)
  - [Network](https://github.com/terraform-google-modules/terraform-example-foundation)
  - [Global HTTP Load Balancer](https://github.com/terraform-google-modules/terraform-google-lb-http)
  - [Google Scheduled Functions](https://github.com/terraform-google-modules/terraform-google-scheduled-function)
  - [Run CLI Commands](https://github.com/terraform-google-modules/terraform-google-gcloud)
  - [Pub/Subs](https://github.com/terraform-google-modules/terraform-google-pubsub)
  - [IAM](https://github.com/terraform-google-modules/terraform-google-iam)
    - [Cloud Run Service IAM](https://github.com/terraform-google-modules/terraform-google-iam/tree/main/modules/cloud_run_services_iam)

### Architecture References
- [Shared VPC](https://cloud.google.com/vpc/docs/shared-vpc)
- [Enterprise Foundations Blueprint](https://cloud.google.com/architecture/blueprints/security-foundations)
  - [terraform-example-foundation](https://github.com/terraform-google-modules/terraform-example-foundation)
