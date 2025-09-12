locals {
  error_count_metric_name = "error-count"
  critical_errors_metric_name = "critical-errors"
}

# Error count metric.
resource "google_logging_metric" "error_count" {
  project = var.project_id
  name = local.error_count_metric_name
  filter = "severity>=ERROR"
  metric_descriptor {
    metric_kind = "DELTA"
    value_type = "INT64"
    unit = "1"
  }
}

# Error count alert policy. To monitor that the error count doesn't get too high.
resource "google_monitoring_alert_policy" "error_count" {
  project = var.project_id
  display_name = "Error amount"
  severity = "ERROR"
  combiner = "OR"
  conditions {
    display_name = "Error count"
    condition_threshold {
      filter = "resource.type=\"cloud_composer_environment\" AND metric.type=\"logging.googleapis.com/user/${local.error_count_metric_name}\""
      duration = var.error_count_threshold.issue_duration
      trigger {
        count = 1
      }
      comparison = "COMPARISON_GT"
      threshold_value = var.error_count_threshold.threshold
      aggregations {
        alignment_period = var.error_count_threshold.alignment_period
        per_series_aligner = "ALIGN_SUM"
      }
    }
  }
  depends_on = [ google_logging_metric.error_count ]
}

# Critical errors metric.
resource "google_logging_metric" "critical_errors" {
  project = var.project_id
  name = local.critical_errors_metric_name
  filter = "severity>=CRITICAL"
  metric_descriptor {
    metric_kind = "DELTA"
    value_type = "INT64"
    unit = "1"
  }
}

# Critical errors alert policy. Critical errors must be taken care of immediately.
resource "google_monitoring_alert_policy" "critical_errors" {
  project = var.project_id
  display_name = "Critical errors amount"
  severity = "CRITICAL"
  combiner = "OR"
  conditions {
    display_name = "Critical errors count"
    condition_threshold {
      filter = "resource.type=\"cloud_run_revision\" AND metric.type=\"logging.googleapis.com/user/${local.critical_errors_metric_name}\""
      duration = var.critical_errors_threshold.issue_duration
      trigger {
        count = 1
      }
      comparison = "COMPARISON_GT"
      threshold_value = var.critical_errors_threshold.threshold
      aggregations {
        alignment_period = var.critical_errors_threshold.alignment_period
        per_series_aligner = "ALIGN_SUM"
      }
    }
  }
  depends_on = [ google_logging_metric.critical_errors ]
}

# Requests latency alert policy. To monitor that the requests latency doesn't get too high.
resource "google_monitoring_alert_policy" "requests_latency" {
  project = var.project_id
  display_name = "Requests latency"
  severity = "WARNING"
  combiner = "OR"
  conditions {
    display_name = "Requests latency"
    condition_threshold {
      filter = "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/request_latencies\""
      duration = var.requests_latency_threshold.issue_duration
      comparison = "COMPARISON_GT"
      threshold_value = var.requests_latency_threshold.threshold
      aggregations {
        alignment_period = var.requests_latency_threshold.alignment_period
        per_series_aligner = "ALIGN_PERCENTILE_95"
      }
    }
  }
}

# Request count alert policy. To monitor if the request count starts to increase over the expected amount.
resource "google_monitoring_alert_policy" "request_count" {
  project = var.project_id
  display_name = "Request amount"
  severity = "WARNING"
  combiner = "OR"
  conditions {
    display_name = "Request count"
    condition_threshold {
      filter = "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/request_count\""
      duration = var.request_count_threshold.issue_duration
      comparison = "COMPARISON_GT"
      threshold_value = var.request_count_threshold.threshold
      aggregations {
        alignment_period = var.request_count_threshold.alignment_period
        per_series_aligner = "ALIGN_SUM"
      }
    }
  }
}

# Cloud functions execution count alert policy. To monitor if the execution count starts to increase over the expected amount.
resource "google_monitoring_alert_policy" "cloud_functions_execution_count" {
  project = var.project_id
  display_name = "Cloud functions execution amount"
  severity = "WARNING"
  combiner = "OR"
  conditions {
    display_name = "Cloud functions execution count"
    condition_threshold {
      filter = "resource.type=\"cloud_function\" AND metric.type=\"cloudfunctions.googleapis.com/function/execution_count\""
      duration = var.cloud_functions_execution_count_threshold.issue_duration
      comparison = "COMPARISON_GT"
      threshold_value = var.cloud_functions_execution_count_threshold.threshold
      aggregations {
        alignment_period = var.cloud_functions_execution_count_threshold.alignment_period
        per_series_aligner = "ALIGN_SUM"
      }
    }
  }
}

# Firestore api request count alert policy. To monitor if the api request count starts to increase over the expected amount.
resource "google_monitoring_alert_policy" "firestore_api_request_count" {
  project = var.project_id
  display_name = "Firestore api request amount"
  severity = "WARNING"
  combiner = "OR"
  conditions {
    display_name = "Firestore api request count"
    condition_threshold {
      filter = "resource.type=\"firestore.googleapis.com/Database\" AND metric.type=\"firestore.googleapis.com/api/request_count\""
      duration = var.firestore_api_request_count_threshold.issue_duration
      comparison = "COMPARISON_GT"
      threshold_value = var.firestore_api_request_count_threshold.threshold
      aggregations {
        alignment_period = var.firestore_api_request_count_threshold.alignment_period
        per_series_aligner = "ALIGN_COUNT"
      }
    }
  }
}
