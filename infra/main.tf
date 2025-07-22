// Create a new Google Cloud project.
resource "google_project" "default" {
  name = var.project_id
  project_id = var.project_id
  org_id = var.organization_id
  billing_account = var.billing_account_id
  labels = {
    "firebase" = "enabled"
  }
}

// Enable the basic required services for the project. Other services may be enabled later inside modules or services.
resource "google_project_service" "default" {
  provider = google-beta.no_user_project_override
  project  = var.project_id
  for_each = toset([
    "cloudbilling.googleapis.com", # Billing is required for Firebase services.
    "cloudresourcemanager.googleapis.com", # Used to manage metadata for containers in Cloud Build deployments.
    "iam.googleapis.com", # Used to manage IAM roles
    "secretmanager.googleapis.com", # Used to store secrets
    "serviceusage.googleapis.com", # Enabling the ServiceUsage API allows the project to be quota checked.
  ])
  service = each.key
  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
  depends_on = [
    google_project.default
  ]
}

module "firebase" {
  source = "./modules/firebase"
  project_id = var.project_id
  region = var.region
  android_app_package_id = var.android_app_package_id
  apple_app_bundle_id = var.apple_app_bundle_id
  has_web_app = true
}

module "firebase_auth" {
  source = "./modules/firebase-auth"
  providers = {
    google-beta.no_user_project_override = google-beta.no_user_project_override
  }
  project_id = var.project_id
  authorized_domains = var.authorized_domains
}

module "firestore" {
  source = "./modules/firestore"
  project_id = var.project_id
}

// Create a repository for the Cloud Run deployment sources.
resource "google_artifact_registry_repository" "cloud_run_deployment_sources_repository" {
  project = var.project_id
  repository_id = "cloud-run-source-deploy" # This name is the default name created by GCP when deploying a Cloud Run service thought gcloud deploy command
  format = "DOCKER"
  location = var.region
  description = "Repository for Cloud Run artifacts"

  # Waits for the required APIs to be enabled.
  depends_on = [
    google_project_service.default
  ]
}

module "public_api" {
  source = "./services/public-api"
  project_id = var.project_id
  region = var.region
  artifact_registry_repository_name = google_artifact_registry_repository.cloud_run_deployment_sources_repository.repository_id
  env = var.env
  depends_on = [google_artifact_registry_repository.cloud_run_deployment_sources_repository]
}

module "internal_api" {
  source = "./services/internal-api"
  project_id = var.project_id
  region = var.region
  artifact_registry_repository_name = google_artifact_registry_repository.cloud_run_deployment_sources_repository.repository_id
  env = var.env
  depends_on = [google_artifact_registry_repository.cloud_run_deployment_sources_repository]
}

module "billing_budget" {
  source = "./utils/billing-budget"
  project_id = var.project_id
  project_number = google_project.default.number
  billing_account_id = var.billing_account_id
  email_addresses_to_notify = var.billing_budget_notification_emails
  amount = var.billing_budget_amount
}

module "terraform_backend" {
  source = "./utils/terraform-backend"
  project_id = var.project_id
}

module "github_actions" {
  source = "./utils/github-actions"
  project_id = var.project_id
  project_number = google_project.default.number
  github_repository = var.github_repository
}
