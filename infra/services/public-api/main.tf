locals {
  service_account_name = "public-api-cloud-run"
}
module "service_account" {
  source  = "terraform-google-modules/service-accounts/google"
  version = "~> 4.0"

  project_id    = var.project_id
  names         = [local.service_account_name]
  project_roles = [
    "${var.project_id}=>roles/firebase.sdkAdminServiceAgent", // Needed to access Firebase Admin SDK
    "${var.project_id}=>roles/iam.serviceAccountTokenCreator", // Needed to create Firebase Auth tokens
    "${var.project_id}=>roles/iam.serviceAccountUser", // Needed to attach the service account to the Cloud Run service
    "${var.project_id}=>roles/logging.logWriter", // Needed to write logs to Cloud Logging
  ]
  display_name  = "Public API Cloud Run"
  description   = "Cloud Run service for the Public API"
}

module "cloud-run" {
  source = "../../modules/cloud-run"
  project_id = var.project_id
  region = var.region
  service_name = "public-api"
  artifact_registry_repository_name = var.artifact_registry_repository_name
  service_account_email = module.service_account.email
  build_service_account_email = var.build_service_account_email
  allow_public_access = true
  depends_on = [module.service_account]
  environment_variables = [
    {
      name = "FIREBASE_PROJECT_ID"
      value = var.firebase_project_id
    },
    {
      name = "FIREBASE_DATABASE_URL"
      value = var.firebase_database_url
    }
  ]
}