// Enable the required APIs for the Cloud Run service.
resource "google_project_service" "default" {
  project  = var.project_id
  for_each = toset([
    "billingbudgets.googleapis.com", # Used to create billing budgets
  ])
  service = each.key
  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

resource "google_billing_budget" "default" {
  billing_account = var.billing_account_id
  display_name = var.project_id
  budget_filter {
    projects = ["projects/${var.project_number}"]
  }
  amount {
    specified_amount {
      currency_code = var.amount.currency_code
      units = var.amount.units
    }
  }
  threshold_rules {
    threshold_percent = 0.5
    spend_basis = "CURRENT_SPEND"
  }
  threshold_rules {
    threshold_percent = 0.75
    spend_basis = "CURRENT_SPEND"
  }
  threshold_rules {
    threshold_percent = 0.9
    spend_basis = "CURRENT_SPEND"
  }
  threshold_rules {
    threshold_percent = 1
    spend_basis = "CURRENT_SPEND"
  }
  threshold_rules {
    threshold_percent = 1
    spend_basis = "FORECASTED_SPEND"
  }
}