terraform {
  required_version = ">= 1.0.0"
  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 6.0"
      configuration_aliases = [google-beta.no_user_project_override]
    }
  }
}
