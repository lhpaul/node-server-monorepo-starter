variable "project_id" {
  type = string
  description = "The ID of the project to deploy to"
}

variable "region" {
  type = string
  description = "The region to deploy to"
  default = "nam5"
}

variable "name" {
  type = string
  description = "The name of the Firestore database"
  default = "(default)"
}
