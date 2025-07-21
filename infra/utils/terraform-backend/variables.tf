variable "project_id" {
  type        = string
  description = "The ID of the project where the terraform state will be stored."
}

variable "location" {
  type        = string
  description = "The location for the bucket."
  default     = "US"
}