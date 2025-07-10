resource "google_project_service" "default" {
  project  = var.project_id
  for_each = toset([
    "cloudfunctions.googleapis.com", # Used to run cloud functions and triggers
    "cloudresourcemanager.googleapis.com", # Used to manage resources in the project
    "cloudscheduler.googleapis.com", # Used to schedule cloud functions and triggers
    "eventarc.googleapis.com", # Used to trigger cloud functions and triggers
    "firestore.googleapis.com", # Needed for Firestore database
    "firebaserules.googleapis.com", # Used to manage Firestore rules
    "logging.googleapis.com", # Used to enable services to write logs to Cloud Logging
    "pubsub.googleapis.com", # Used to publish and subscribe to messages
    "run.googleapis.com", # Used to run cloud functions and triggers
    "runtimeconfig.googleapis.com", # Used to store runtime configuration for Firebase services.
    "serviceusage.googleapis.com", # Used to manage service usage
  ])
  service = each.key
  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

# Enables Firebase services for the new project created above.
resource "google_firestore_database" "default" {
  provider                    = google-beta
  project                     = var.project_id
  name                        = var.name
  # See available locations: https://firebase.google.com/docs/firestore/locations
  location_id                 = var.region
  # "FIRESTORE_NATIVE" is required to use Firestore with Firebase SDKs, authentication, and Firebase Security Rules.
  type                        = "FIRESTORE_NATIVE"
  concurrency_mode            = "OPTIMISTIC"

  depends_on = [google_project_service.default]
}

