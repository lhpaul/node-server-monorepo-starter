resource "google_project_service" "default" {
  project = var.project_id
  for_each = toset([
    "cloudresourcemanager.googleapis.com", # Used to manage resources in the project
    "firebaseextensions.googleapis.com", # Used to manage extensions
  
  ])
  service = each.key
  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

# Creates a Firebase Android App in the new project created above.
resource "google_firebase_android_app" "default" {
  count = var.android_app_package_id != null ? 1 : 0
  provider = google-beta
  project = var.project_id
  display_name = "Android App"
  package_name = var.android_app_package_id
}

# Creates a Firebase Apple-platforms App in the new project created above.
resource "google_firebase_apple_app" "default" {
  count = var.apple_app_bundle_id != null ? 1 : 0
  provider = google-beta
  project = var.project_id
  display_name = "Apple App"
  bundle_id    = var.apple_app_bundle_id
}

# Creates a Firebase Web App in the new project created above.
resource "google_firebase_web_app" "default" {
  count = var.has_web_app ? 1 : 0
  provider = google-beta
  project = var.project_id
  display_name = "Web App"
}