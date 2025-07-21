// Create a workload identity pool for the CI/CD.
resource "google_iam_workload_identity_pool" "default" {
  provider = google-beta
  project = var.project_id
  workload_identity_pool_id = "ci-cd"
  display_name = "CI/CD"
  description = "Pool for CI/CD"
  disabled = false
}

// Create a workload identity pool provider for the GitHub.
resource "google_iam_workload_identity_pool_provider" "github" {
  project = var.project_id
  workload_identity_pool_id = google_iam_workload_identity_pool.default.workload_identity_pool_id
  workload_identity_pool_provider_id = "github"
  display_name = "GitHub"
  attribute_mapping = {
    "google.subject" = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
    "attribute.ref" = "assertion.ref"
  }
  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
  attribute_condition = "assertion.repository == '${var.github_repository}'"
  depends_on = [ google_iam_workload_identity_pool.default ]
}

// Create a service account for managing the infrastructure from GitHub Actions.
module "infra_management_service_account" {
  source  = "terraform-google-modules/service-accounts/google"
  version = "~> 4.0"

  project_id    = var.project_id
  names         = ["infra-management"]
  project_roles = [
    "${var.project_id}=>roles/editor", // Needed to manage the infrastructure
  ]
  display_name  = "Infra Management"
  description   = "Service account for managing the infrastructure from GitHub Actions"
}

// Create a service account for deploying Cloud Run services from GitHub Actions.
module "cloud_run_deployment_service_account" {
  source  = "terraform-google-modules/service-accounts/google"
  version = "~> 4.0"

  project_id    = var.project_id
  names         = ["cloud-run-deployment"]
  project_roles = [
     "${var.project_id}=>roles/artifactregistry.writer", // Needed to write to the Artifact Registry repository, used to store the Docker images of the Cloud Run services
    "${var.project_id}=>roles/cloudbuild.builds.editor", // Needed to deploy from GitHub Actions.
    "${var.project_id}=>roles/iam.serviceAccountUser", // Needed to attach the service account to the Cloud Run service
    "${var.project_id}=>roles/logging.logWriter", // Needed to write logs to Cloud Logging
    "${var.project_id}=>roles/run.developer", // Needed to deploy the Cloud Run service
    "${var.project_id}=>roles/storage.admin", // Needed to write to the Cloud Storage bucket, used to store the compiled code of the Cloud Run services
    "${var.project_id}=>roles/serviceusage.serviceUsageConsumer", // Needed to deploy from GitHub Actions.
  ]
  display_name  = "Cloud Run Deployment"
  description   = "Service account for deploying from GitHub Actions"
}

// Grant the workload identity user role to the service account to get the access token for deploying from GitHub Actions.
resource "google_service_account_iam_member" "workload_identity_user_infra_management" {
  service_account_id = module.infra_management_service_account.service_accounts[0].name
  role = "roles/iam.workloadIdentityUser"
  member = "principalSet://iam.googleapis.com/projects/${var.project_number}/locations/global/workloadIdentityPools/${google_iam_workload_identity_pool.default.workload_identity_pool_id}/attribute.repository/${var.github_repository}"
  depends_on = [ google_iam_workload_identity_pool.default, module.infra_management_service_account ]
}

// Grant the workload identity user role to the Cloud Run service account to get the access token for deploying from GitHub Actions.
resource "google_service_account_iam_member" "workload_identity_user_cloud_run" {
  service_account_id = module.cloud_run_deployment_service_account.service_accounts[0].name
  role = "roles/iam.workloadIdentityUser"
  member = "principalSet://iam.googleapis.com/projects/${var.project_number}/locations/global/workloadIdentityPools/${google_iam_workload_identity_pool.default.workload_identity_pool_id}/attribute.repository/${var.github_repository}"
  depends_on = [ google_iam_workload_identity_pool.default, module.cloud_run_deployment_service_account ]
}