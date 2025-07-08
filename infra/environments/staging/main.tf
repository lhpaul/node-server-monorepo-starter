locals {
  project_id = "node-starter-project-stg"
}

module "main" {
  source = "../../"
  env = "stg"
  project_id = local.project_id
  authorized_domains = [
    "localhost",
    "${local.project_id}.firebaseapp.com",
    "${local.project_id}.web.app",
    "stg.app.react-native-playground.lhpaul.cl"
  ]
  android_app_package_id = "com.lhpaul.reactNativePlayground.stg"
  apple_app_bundle_id = "com.lhpaul.reactNativePlayground.stg"
}