# Enables required APIs.
resource "google_project_service" "default" {
  project  = var.project_id
  for_each = toset([
    "cloudresourcemanager.googleapis.com",
    "serviceusage.googleapis.com",
    "identitytoolkit.googleapis.com",
  ])
  service = each.key

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

# Creates an Identity Platform config.
# Also enables Firebase Authentication with Identity Platform in the project if not.
resource "google_identity_platform_config" "default" {
  provider = google-beta
  project  = var.project_id
  
  # Auto-deletes anonymous users
  autodelete_anonymous_users = true

  # Configures local sign-in methods, like anonymous, email/password, and phone authentication.
  sign_in {
    email {
      enabled = true
      password_required = false
    }
  }

  # Configures authorized domains.
  authorized_domains = var.authorized_domains
}

