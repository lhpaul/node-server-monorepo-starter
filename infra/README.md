# Infra

TODO: add description

## Setup

- Install Terraform
- Install gcloud CLI and authenticate

## Deploy

```bash
terraform init
terraform plan -var-file=”dev.tfvars”
terraform plan -out=plan
```

## Imports

```bash
terraform import google_project.default node-starter-project-dev
terraform import google_firestore_database.default projects/node-starter-project-dev/locations/nam5/databases/(default)
terraform import google_artifact_registry_repository.cloud_run_deployment_sources_repository projects/node-starter-project-dev/locations/us-central1/repositories/cloud-run-source-deploy
```

## Destroy

```bash
terraform plan -destroy
terraform destroy
```

## Domain Mapping

[Map a custom domain to a service](https://cloud.google.com/run/docs/mapping-custom-domains#map)

```bash
gcloud domains verify <BASE DOMAIN>
```

[Add your DNS records at your domain registrar](https://cloud.google.com/run/docs/mapping-custom-domains#dns_update)

## TroubleShooting

### Image naming conventions

https://cloud.google.com/artifact-registry/docs/docker/names#containers

## Error: cannot destroy service without setting deletion_protection=false and running `terraform apply`

```bash
module.public-api.module.cloud-run.google_cloud_run_v2_service.service: Destroying... [id=projects/node-starter-project-dev/locations/us-central1/services/public-api]
╷
│ Error: cannot destroy service without setting deletion_protection=false and running `terraform apply`
```

```terraform
import {
  id = "projects/${var.project_id}/locations/${var.region}/services/public-api"
  to = module.public-api.module.cloud-run.google_cloud_run_v2_service.service
}
```

### Permission Denied

```bash
gcloud config unset auth/impersonate_service_account
gcloud auth application-default login
```

## Resources

- [IaC Google Cloud](https://www.youtube.com/watch?v=84Ql00Bjh1Y)
- [Terraform Files](https://spacelift.io/blog/terraform-files)
- [Managing Terraform State Files](https://www.youtube.com/watch?v=UDBVCzg2IRo)
- [GCP Terraform](https://www.youtube.com/watch?v=t6TxyALn05Y)
- [How To Structure Terraform Project (3 Levels)](https://www.youtube.com/watch?v=nMVXs8VnrF4)
- [Managing infrastructure as code with Terraform, Cloud Build, and GitOps](https://cloud.google.com/docs/terraform/resource-management/managing-infrastructure-as-code)
- [IAM roles and permissions index](https://cloud.google.com/iam/docs/roles-permissions)
- [Best practices for Cloud Run networking](https://cloud.google.com/run/docs/configuring/networking-best-practices)
- [Shared VPC](https://cloud.google.com/vpc/docs/shared-vpc)
- [Enterprise Foundations Blueprint](https://cloud.google.com/architecture/blueprints/security-foundations)
  - [terraform-example-foundation](https://github.com/terraform-google-modules/terraform-example-foundation)
- [Google Cloud Terraform Modules](https://github.com/terraform-google-modules)
  - [Project Factory](https://github.com/terraform-google-modules/terraform-google-project-factory)
  - [Network](https://github.com/terraform-google-modules/terraform-example-foundation)
  - [Global HTTP Load Balancer](https://github.com/terraform-google-modules/terraform-google-lb-http)
  - [Google Scheduled Functions](https://github.com/terraform-google-modules/terraform-google-scheduled-function)
  - [Run CLI Commands](https://github.com/terraform-google-modules/terraform-google-gcloud)
  - [Pub/Subs](https://github.com/terraform-google-modules/terraform-google-pubsub)
  - [IAM](https://github.com/terraform-google-modules/terraform-google-iam)
    - [Cloud Run Service IAM](https://github.com/terraform-google-modules/terraform-google-iam/tree/main/modules/cloud_run_services_iam)
- [Secret Manager](https://cloud.google.com/security/products/secret-manager)
  - [Terraform Resource](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/secret_manager_secret)
-[Running Terraform in automation](https://developer.hashicorp.com/terraform/tutorials/automation/automate-terraform)
