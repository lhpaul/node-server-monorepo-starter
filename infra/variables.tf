variable "env" {
  type = string
  description = "The application environment of the project"
}

variable "project_id" {
  type = string
  description = "The ID of the project"
}

variable "region" {
  type = string
  description = "The region to deploy to"
  default = "us-central1"
}

variable "billing_account_id" {
  description = "The billing account to use for the project"
  type        = string
  default = "01DD4D-8D2323-4E9DA7"
}

variable "android_app_package_id" {
  description = "The package name for the Firebase Android app"
  type        = string
  default = null
}

variable "apple_app_bundle_id" {
  description = "The bundle ID for the Firebase Apple app"
  type        = string
  default = null
}

variable "authorized_domains" {
  description = "The authorized domains that can be used to authenticate with the Firebase project"
  type        = list(string)
  default = [
    "localhost"
  ]
}