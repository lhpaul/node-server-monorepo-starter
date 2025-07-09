terraform {
  backend "gcs" {
    bucket = "node-starter-project-dev-terraform-remote-backend"
  }
}