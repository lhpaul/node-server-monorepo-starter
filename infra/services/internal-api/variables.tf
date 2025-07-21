variable "project_id" {
  description = "The project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
}

variable "artifact_registry_repository_name" {
  description = "The name of the Artifact Registry repository"
  type        = string
}

variable "env" {
  description = "The environment of the app"
  type = string
}
