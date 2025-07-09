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