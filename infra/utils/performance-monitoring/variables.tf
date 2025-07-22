variable "project_id" {
  description = "The project id"
  type        = string
}

variable "error_count_threshold" {
  description = "The threshold for the error count metric"
  type        = object({
    threshold = number
    issue_duration = string
    alignment_period = string
  })
}

variable "critical_errors_threshold" {
  description = "The threshold for the critical errors metric"
  type        = object({
    threshold = number
    issue_duration = string
    alignment_period = string
  })
}

variable "requests_latency_threshold" {
  description = "The threshold for the requests latency metric"
  type        = object({
    threshold = number
    issue_duration = string
    alignment_period = string
  })
}

variable "request_count_threshold" {
  description = "The threshold for the request count metric"
  type        = object({
    threshold = number
    issue_duration = string
    alignment_period = string
  })
}

variable "cloud_functions_execution_count_threshold" {
  description = "The threshold for the cloud functions execution count metric"
  type        = object({
    threshold = number
    issue_duration = string
    alignment_period = string
  })
}

variable "firestore_api_request_count_threshold" {
  description = "The threshold for the firestore api request count metric"
  type        = object({
    threshold = number
    issue_duration = string
    alignment_period = string
  })
}