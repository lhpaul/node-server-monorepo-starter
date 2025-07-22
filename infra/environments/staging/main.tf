locals {
  project_id = "node-starter-project-stg"
}

module "main" {
  source = "../../"
  env = "STG"
  project_id = local.project_id
  billing_account_id = "01DD4D-8D2323-4E9DA7"
  billing_budget_amount = {
    currency_code = "CLP"
    units = 5000
  }
  authorized_domains = [
    "localhost",
    "${local.project_id}.firebaseapp.com",
    "${local.project_id}.web.app",
    "stg.app.react-native-playground.lhpaul.cl"
  ]
  android_app_package_id = "com.lhpaul.reactNativePlayground.stg"
  apple_app_bundle_id = "com.lhpaul.reactNativePlayground.stg"
  github_repository = "lhpaul/node-starter-project"
}