# import {
#   to = module.main.google_project.default
#   id = "node-starter-project-dev"
# }

# import {
#   to = module.main.module.terraform_backend.google_storage_bucket.default
#   id = "node-starter-project-dev-terraform-remote-backend"
# }

# import {
#   to = module.main.module.firebase_auth.google_identity_platform_config.default
#   id = "projects/node-starter-project-dev"
# }

# import {
#   to = module.main.module.firestore.google_firestore_database.default
#   id = "projects/node-starter-project-dev/databases/(default)"
# }

# import {
#   to = module.main.module.firebase.google_firebase_android_app.default[0]
#   id = "projects/node-starter-project-dev/androidApps/1:357801570334:android:a21b577fb7133412f77e0f"
# }

# import {
#   to = module.main.module.firebase.google_firebase_apple_app.default[0]
#   id = "projects/node-starter-project-dev/iosApps/1:357801570334:ios:2737e445eeac9ad8f77e0f"
# }

# import {
#   to = module.main.module.firebase.google_firebase_web_app.default[0]
#   id = "projects/node-starter-project-dev/webApps/1:357801570334:web:06f2aec46bd511a4f77e0f"
# }

# import {
#   to = module.main.google_artifact_registry_repository.cloud_run_deployment_sources_repository
#   id = "projects/node-starter-project-dev/locations/us-central1/repositories/cloud-run-source-deploy"
# }

# import {
#   to = module.main.module.cloud_run_cloud_build_service_account.google_service_account.service_accounts["cloud-run-cloud-build"]
#   id = "projects/node-starter-project-dev/serviceAccounts/cloud-run-cloud-build@node-starter-project-dev.iam.gserviceaccount.com"
# }

# import {
#   to = module.main.module.public-api.module.service_account.google_service_account.service_accounts["public-api-cloud-run"]
#   id = "projects/node-starter-project-dev/serviceAccounts/public-api-cloud-run@node-starter-project-dev.iam.gserviceaccount.com"
# }

# import {
#   to = module.main.module.public-api.module.cloud-run.google_cloud_run_v2_service.default
#   id = "projects/node-starter-project-dev/locations/us-central1/services/public-api"
# }

# import {
#   to = module.main.module.public-api.module.cloud-run.google_cloud_run_service_iam_member.public_access[0]
#   id = "projects/node-starter-project-dev/locations/us-central1/services/public-api roles/run.invoker allUsers"
# }

# import {
#   to = module.main.module.internal-api.module.service_account.google_service_account.service_accounts["internal-api-cloud-run"]
#   id = "projects/node-starter-project-dev/serviceAccounts/internal-api-cloud-run@node-starter-project-dev.iam.gserviceaccount.com"
# }

# import {
#   to = module.main.module.internal-api.module.cloud-run.google_cloud_run_v2_service.default
#   id = "projects/node-starter-project-dev/locations/us-central1/services/internal-api"
# }
