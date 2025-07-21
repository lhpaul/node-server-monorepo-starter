locals {
  project_id = "node-starter-project-prod"
}

module "main" {
  source = "../../"
  env = "PROD"
  project_id = local.project_id
  authorized_domains = [
    "localhost",
    "${local.project_id}.firebaseapp.com",
    "${local.project_id}.web.app",
    "app.react-native-playground.lhpaul.cl"
  ]
  android_app_package_id = "com.lhpaul.reactNativePlayground"
  apple_app_bundle_id = "com.lhpaul.reactNativePlayground"
  github_repository = "lhpaul/node-starter-project"
}