locals {
  project_id = "node-starter-project-dev"
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
    "dev.app.react-native-playground.lhpaul.cl"
  ]
  android_app_package_id = "cl.lhpaul.reactNativePlayground.dev"
  apple_app_bundle_id = "cl.lhpaul.reactNativePlayground.dev"
  github_repository = "lhpaul/node-starter-project"
}