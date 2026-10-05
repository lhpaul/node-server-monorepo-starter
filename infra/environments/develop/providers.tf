terraform {
  required_version = ">= 1.0.0"
  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 6.0"
      configuration_aliases = [google-beta.no_user_project_override]
    }
  }
  backend "gcs" {
    bucket = "<PROJECT_ID>-terraform-remote-backend"  # TODO: Replace with your actual bucket name
  }
}

# Configures the provider to use the resource block's specified project for quota checks.
provider "google-beta" {
  project = "<PROJECT_ID>"  # TODO: Replace with your actual project ID
  billing_project = "<PROJECT_ID>"  # TODO: Replace with your actual project ID
  user_project_override = true
}

# Configures the provider to not use the resource block's specified project for quota checks.
# This provider should only be used during project creation and initializing services.
provider "google-beta" {
  alias = "no_user_project_override"
  project = "<PROJECT_ID>"  # TODO: Replace with your actual project ID
  billing_project = "<PROJECT_ID>"  # TODO: Replace with your actual project ID
  user_project_override = false
}