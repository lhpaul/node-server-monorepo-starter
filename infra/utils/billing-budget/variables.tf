variable "project_id" {
  description = "The project ID to create the budget for"
  type        = string
}

variable "project_number" {
  description = "The project number to use for the budget"
  type        = string
}

variable "billing_account_id" {
  description = "The billing account ID to use for the budget"
  type        = string
}

variable "amount" {
  description = "The currency to use for the billing budget"
  type        = object({
    currency_code = string
    units         = number
  })
}

variable "email_addresses_to_notify" {
  description = "The email addresses to notify when the budget is exceeded"
  type        = list(string)
}