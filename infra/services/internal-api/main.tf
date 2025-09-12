
module "service_account" {
  source  = "terraform-google-modules/service-accounts/google"
  version = "~> 4.0"

  project_id    = var.project_id
  names         = ["internal-api-cloud-run"]
  project_roles = [
    "${var.project_id}=>roles/firebase.sdkAdminServiceAgent", // Needed to access Firebase Admin SDK
    "${var.project_id}=>roles/iam.serviceAccountUser", // Needed to attach the service account to the Cloud Run service
    "${var.project_id}=>roles/logging.logWriter", // Needed to write logs to Cloud Logging
    "${var.project_id}=>roles/secretmanager.secretAccessor", // Needed to access secrets from Secret Manager
  ]
  display_name  = "Internal API Cloud Run"
  description   = "Cloud Run service for the Internal API"
}

module "cloud_run" {
  source = "../../modules/cloud-run"
  project_id = var.project_id
  region = var.region
  service_name = "internal-api"
  artifact_registry_repository_name = var.artifact_registry_repository_name
  service_account_email = module.service_account.email
  allow_public_access = false
  environment_variables = [
    {
      name = "APP_ENV"
      value = var.env
    },
    {
      name = "MOCK_API_PROJECT_SECRET"
      value_source = {
        secret = "MOCK_API_PROJECT_SECRET"
        version = "latest"
      }
    },
    {
      name = "ENCRYPTION_KEY"
      value_source = {
        secret = "ENCRYPTION_KEY"
        version = "latest"
      }
    }
  ]
  depends_on = [module.service_account]
}