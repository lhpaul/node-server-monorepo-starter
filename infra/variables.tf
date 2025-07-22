variable "env" {
  type = string
  description = "The application environment of the project"
}

variable "organization_id" {
  type = string
  description = "The ID of the organization"
  default = "663153561274"
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

variable "billing_budget_amount" {
  description = "The amount to use for the billing budget"
  type        = object({
    currency_code = string
    units         = number
  })
  default = {
    currency_code = "USD"
    units         = 1
  }
}

variable "error_count_threshold" {
  description = "The threshold for the error count metric"
  type        = object({
    threshold = number
    issue_duration = string
    alignment_period = string
  })
  default     = {
    threshold = 10
    issue_duration = "600s"
    alignment_period = "60s"
  }
}

variable "critical_errors_threshold" {
  description = "The threshold for the critical errors metric"
  type        = object({
    threshold = number
    issue_duration = string
    alignment_period = string
  })
  default     = {
    threshold = 1
    issue_duration = "600s"
    alignment_period = "60s"
  }
}

variable "requests_latency_threshold" {
  description = "The threshold for the requests latency metric"
  type        = object({
    threshold = number
    issue_duration = string
    alignment_period = string
  })
  default     = {
    threshold = 1000
    issue_duration = "600s"
    alignment_period = "60s"
  }
}

variable "request_count_threshold" {
  description = "The threshold for the request count metric"
  type        = object({
    threshold = number
    issue_duration = string
    alignment_period = string
  })
  default     = {
    threshold = 600 # Average 10 requests per second.
    issue_duration = "600s"
    alignment_period = "60s"
  }
}

variable "cloud_functions_execution_count_threshold" {
  description = "The threshold for the cloud functions execution count metric"
  type        = object({
    threshold = number
    issue_duration = string
    alignment_period = string
  })
  default     = {
    threshold = 300 # Average 5 executions per second.
    issue_duration = "600s"
    alignment_period = "60s"
  }
}

variable "firestore_api_request_count_threshold" {
  description = "The threshold for the firestore api request count metric"
  type        = object({
    threshold = number
    issue_duration = string
    alignment_period = string
  })
  default     = {
    threshold = 600 # Average 10 requests per second.
    issue_duration = "600s"
    alignment_period = "60s"
  }
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

variable "github_repository" {
  type = string
  description = "The GitHub repository where the code is stored"
}