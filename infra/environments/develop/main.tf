locals {
  project_id = "<PROJECT_ID>"  # TODO: Replace with your actual project ID
}

module "main" {
  source = "../../"
  providers = {
    google-beta = google-beta
    google-beta.no_user_project_override = google-beta.no_user_project_override
  }
  env = "DEV"
  project_id = local.project_id
  billing_account_id = var.billing_account_id
  billing_budget_amount = {
    currency_code = "CLP"
    units = 5000
  }
  authorized_domains = [
    "localhost",
    "${local.project_id}.firebaseapp.com",
    "${local.project_id}.web.app",
    "dev.your-app.your-domain.com"  # TODO: Replace with your actual domain
  ]
  android_app_package_id = "com.yourcompany.yourapp.dev"  # TODO: Replace with your actual package ID
  apple_app_bundle_id = "com.yourcompany.yourapp.dev"  # TODO: Replace with your actual bundle ID
  github_repository = "your-org/your-repo"  # TODO: Replace with your actual GitHub repository
}