variable "project_id" {
  type = string
  description = "The ID of the project to deploy to"
}

variable "region" {
  type = string
  description = "The region to deploy to"
}

variable "has_web_app" {
  type = bool
  description = "Whether the project has a web app"
  default = false
}

variable "web_app_name" {
  type = string
  description = "The name of the web app"
  default = "Web App"
}

variable "android_app_package_id" {
  description = "The package id for the Firebase Android app"
  type        = string
}

variable "android_app_name" {
  description = "The name of the Firebase Android app"
  type        = string
  default = "Android App"
}

variable "apple_app_bundle_id" {
  description = "The bundle ID for the Firebase Apple app"
  type        = string
}

variable "apple_app_name" {
  description = "The name of the Firebase Apple app"
  type        = string
  default = "Apple App"
}