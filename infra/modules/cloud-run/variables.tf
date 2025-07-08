variable "project_id" {
  description = "The project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
}

variable "artifact_registry_repository_name" {
  description = "The name of the Artifact Registry repository"
  type        = string
}

variable "service_name" {
  description = "The name of the service (used for resource naming)"
  type        = string
}

variable "service_account_email" {
  type = string
  default = null
  description = "Email address of the IAM service account associated with the revision of the service. The service account represents the identity of the running revision, and determines what permissions the revision has. If not provided, the revision will use the project's default service account"
}

variable "build_service_account_email" {
  type = string
  default = null
  description = "Email address of the IAM service account associated with the Cloud Build service"
}

variable "allow_public_access" {
  type = bool
  default = false
  description = "Allow unauthenticated access to the service."
}

// TODO: Check if this is needed after setting up CI/CD.
variable "environment_variables" {
  type = list(object({
    name = string
    value = optional(string)
    value_from = optional(
      object({
        name = string
        key = string
      })
    )
  }))
  default = []
  description = "Environment variables to inject into container instances."
}

variable "annotations" {
  type = map(string)
  default = {}
  description = "Metadata annotation"
}

// TODO: Check if this is needed after setting up CI/CD.
variable "cpus" {
  type = string
  default = "1"
  description = "Number of CPUs to allocate per container."
}

// TODO: Check if this is needed after setting up CI/CD.
variable "memory" {
  type = string
  default = "512Mi"
  description = "Memory (in Mi) to allocate to containers. Minimum of 512Mi is required."
}

variable "min_instance_count" {
  type = number
  default = 0
  description = "Minimum number of instances to run."
}

variable "max_instance_count" {
  type = number
  default = 1
  description = "Maximum number of instances to run."
}
