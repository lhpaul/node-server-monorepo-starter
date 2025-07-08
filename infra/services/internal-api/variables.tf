variable "project_id" {
  description = "The project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
}

// TODO: Check if is still needed after CI/CD is implemented
variable "artifact_registry_repository_name" {
  description = "The name of the Artifact Registry repository"
  type        = string
}

variable "build_service_account_email" {
  description = "The email of the Cloud Run Cloud Build service account. This service account should have 'roles/run.developer', 'roles/logging.logWriter', 'roles/artifactregistry.writer', 'roles/iam.serviceAccountUser' and 'roles/storage.admin' roles."
  type        = string
}

// TODO: Check if is still needed after CI/CD is implemented
variable "firebase_project_id" {
  description = "Value for FIREBASE_PROJECT_ID environment variable"
  type        = string
}

// TODO: Check if is still needed after CI/CD is implemented
variable "firebase_database_url" {
  description = "Value for FIREBASE_DATABASE_URL environment variable"
  type        = string
}