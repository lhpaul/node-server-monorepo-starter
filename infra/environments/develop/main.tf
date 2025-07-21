locals {
  project_id = "node-starter-project-dev"
}

module "main" {
  source = "../../"
  env = "DEV"
  project_id = local.project_id
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