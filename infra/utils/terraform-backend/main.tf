resource "google_project_service" "default" {
  project = var.project_id
  for_each = toset([
    "storage.googleapis.com", # Used to store the terraform state files
  ])
  service = each.key
  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

// Create a storage bucket to store the terraform state files.
resource "google_storage_bucket" "default" {
  name     = "${var.project_id}-terraform-remote-backend"
  location = var.location

  force_destroy               = false
  public_access_prevention    = "enforced"
  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }
}