locals {
  firebase_database_url = "https://${var.project_id}.firebaseio.com"
}

# Creates a new Google Cloud project.
resource "google_project" "default" {
  name = var.project_id
  project_id = var.project_id
  org_id = var.organization_id
  billing_account = var.billing_account_id
  labels = {
    "firebase" = "enabled"
  }
}

// Enabled the basic required services for the project. Other services may be enabled later inside modules or services.
resource "google_project_service" "default" {
  provider = google-beta.no_user_project_override
  project  = var.project_id
  for_each = toset([
    "cloudbilling.googleapis.com", # Billing is required for Firebase services.
    "iam.googleapis.com", # Used to manage IAM roles
    "secretmanager.googleapis.com", # Used to store secrets
    "serviceusage.googleapis.com", # Enabling the ServiceUsage API allows the project to be quota checked.
    "storage.googleapis.com", # Used to terraform state files
  ])
  service = each.key
  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
  depends_on = [
    google_project.default
  ]
}

module "terraform_backend" {
  source = "./services/terraform-backend"
  project_id = var.project_id
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
  project_id = var.project_id
  authorized_domains = var.authorized_domains
}

module "firestore" {
  source = "./modules/firestore"
  project_id = var.project_id
}

module "cloud_run_cloud_build_service_account" {
  source  = "terraform-google-modules/service-accounts/google"
  version = "~> 4.0"

  project_id    = var.project_id
  names         = ["cloud-run-cloud-build"]
  project_roles = [
    "${var.project_id}=>roles/artifactregistry.writer", // Needed to write to the Artifact Registry repository, used to store the Docker images of the Cloud Run services
    "${var.project_id}=>roles/iam.serviceAccountUser", // Needed to attach the service account to the Cloud Run service
    "${var.project_id}=>roles/logging.logWriter", // Needed to write logs to Cloud Logging
    "${var.project_id}=>roles/run.developer", // Needed to deploy the Cloud Run service
    "${var.project_id}=>roles/storage.admin", // Needed to write to the Cloud Storage bucket, used to store the compiled code of the Cloud Run services
  ]
  display_name  = "Cloud Build for Cloud Run"
  description   = "Service account of Cloud Build for Cloud Run"

  # Waits for the required APIs to be enabled.
  depends_on = [
    google_project_service.default
  ]
}

// TODO: Check if is still needed after CI/CD is implemented
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

module "public-api" {
  count = var.first_run ? 0 : 1
  source = "./services/public-api"
  project_id = var.project_id
  region = var.region
  artifact_registry_repository_name = google_artifact_registry_repository.cloud_run_deployment_sources_repository.repository_id
  build_service_account_email = module.cloud_run_cloud_build_service_account.email
  firebase_project_id = var.project_id
  firebase_database_url = local.firebase_database_url
  depends_on = [module.cloud_run_cloud_build_service_account, google_artifact_registry_repository.cloud_run_deployment_sources_repository]
}

module "internal-api" {
  count = var.first_run ? 0 : 1
  source = "./services/internal-api"
  project_id = var.project_id
  region = var.region
  artifact_registry_repository_name = google_artifact_registry_repository.cloud_run_deployment_sources_repository.repository_id
  build_service_account_email = module.cloud_run_cloud_build_service_account.email
  firebase_project_id = var.project_id
  firebase_database_url = local.firebase_database_url
  depends_on = [module.cloud_run_cloud_build_service_account, google_artifact_registry_repository.cloud_run_deployment_sources_repository]
}


