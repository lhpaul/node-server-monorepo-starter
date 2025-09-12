terraform {
  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      configuration_aliases = [google-beta.no_user_project_override]
    }
  }
}