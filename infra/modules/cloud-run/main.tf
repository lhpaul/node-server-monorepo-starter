resource "google_project_service" "default" {
  project  = var.project_id
  for_each = toset([
    "artifactregistry.googleapis.com", # Used to store build artifacts
    "cloudbuild.googleapis.com", # Used to build container images
    "iam.googleapis.com", # Used to manage IAM roles for Cloud Run services
    "logging.googleapis.com", # Used to enable services to write logs to Cloud Logging
    "run.googleapis.com", # Used to run services
    "runtimeconfig.googleapis.com", # Used to store runtime configuration for Cloud Run services
    "storage.googleapis.com" # Used to store container images
  ])
  service = each.key
  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

resource "google_cloud_run_v2_service" "default" {
  project = var.project_id
  name     = var.service_name
  location = var.region
  ingress = var.allow_public_access ? "INGRESS_TRAFFIC_ALL" : "INGRESS_TRAFFIC_INTERNAL_ONLY"

  # This attributes are added when deploying the service using the gcloud CLI. Had to add them in order to avoid constant terraform state updates.
  # client = "gcloud"
  # client_version = "527.0.0"
  
  traffic {
    type = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
  template {
    service_account = var.service_account_email
    scaling {
      min_instance_count = var.min_instance_count
      max_instance_count = var.max_instance_count
    }
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.artifact_registry_repository_name}/${var.service_name}"
      resources {
        limits = {
          cpu = var.cpus
          memory = var.memory
        }
      }
      dynamic "env" {
        for_each = try(var.environment_variables, [])

        content {
          name  = try(env.value.name, null)
          value = try(env.value.value, null)

          dynamic "value_source" {
            for_each = try(env.value.value_source, null) != null ? [env.value.value_source] : []

            content {
              secret_key_ref {
                secret = value_source.value.secret
                version = value_source.value.version
              }
            }
          }
        }
      }
    }
    annotations = var.annotations
  }
  build_config {
    service_account = "projects/${var.project_id}/serviceAccounts/${var.build_service_account_email}"
    # base_image = "gcr.io/buildpacks/google-22/run"
    # image_uri = "${var.region}-docker.pkg.dev/${var.project_id}/${var.artifact_registry_repository_name}/${var.service_name}"
    # name = "projects/357801570334/locations/us-central1/builds/f9b2265e-0831-4673-9cb0-4251b0945216"
    # source_location =  "gs://run-sources-node-starter-project-dev-us-central1/services/public-api/1751994741.954452-9e6084f41f744ad99d9737a3e69f7b7c.zip#1751994743430511"
  }
  depends_on = [
    google_project_service.default
  ]
}

resource "google_cloud_run_service_iam_member" "public_access" {
  count = var.allow_public_access ? 1 : 0
  project = var.project_id
  service  = google_cloud_run_v2_service.default.name
  location = google_cloud_run_v2_service.default.location
  role     = "roles/run.invoker"
  member   = "allUsers"
  depends_on = [
    google_cloud_run_v2_service.default
  ]
}

# resource "google_compute_region_network_endpoint_group" "service_neg" {
#   name                  = "${var.service_name}-neg"
#   network_endpoint_type = "SERVERLESS"
#   region                = var.region
#   cloud_run {
#     service = google_cloud_run_service.service.name
#   }
# }
