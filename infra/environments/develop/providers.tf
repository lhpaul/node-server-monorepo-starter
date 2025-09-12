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
    bucket = "node-starter-project-dev-terraform-remote-backend"
  }
}

# Configures the provider to use the resource block's specified project for quota checks.
provider "google-beta" {
  project = "node-starter-project-dev"
  billing_project = "node-starter-project-dev"
  user_project_override = true
}

# Configures the provider to not use the resource block's specified project for quota checks.
# This provider should only be used during project creation and initializing services.
provider "google-beta" {
  alias = "no_user_project_override"
  project = "node-starter-project-dev"
  billing_project = "node-starter-project-dev"
  user_project_override = false
}