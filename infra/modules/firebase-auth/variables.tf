variable "project_id" {
  type = string
  description = "The ID of the project to deploy to"
}

variable "authorized_domains" {
  type = list(string)
  description = "The authorized domains that can be used to authenticate with the Firebase project"
  default = []
}