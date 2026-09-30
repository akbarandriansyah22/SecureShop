variable "aws_region" {
  description = "AWS region. Default Singapore (ap-southeast-1)."
  type        = string
  default     = "ap-southeast-1"
}

variable "vpc_cidr" {
  description = "CIDR for the lab VPC."
  type        = string
  default     = "10.42.0.0/16"
}

variable "instance_type" {
  description = "EC2 instance type. Keep t3.micro for cheap lab (apply later)."
  type        = string
  default     = "t3.micro"
}

variable "ssh_cidr" {
  description = "CIDR allowed to SSH (port 22) on sg_app. Set in terraform.tfvars, for example YOUR_PUBLIC_IP/32. No default."
  type        = string
}

variable "allowed_app_cidr" {
  description = "CIDR allowed to reach the API (port 8080) on sg_app. Set in terraform.tfvars as a /32. No default."
  type        = string
}

variable "key_name" {
  description = "Existing EC2 key pair name in the region. Empty skips key_name on the instance."
  type        = string
  default     = ""
}

variable "ghcr_image" {
  description = "Container image published by CD."
  type        = string
  default     = "ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api:latest"
}

variable "environment" {
  description = "App ENVIRONMENT. Lab must be staging or development (not production with DB_SSLMODE=disable)."
  type        = string
  default     = "staging"
}

variable "db_name" {
  type    = string
  default = "ecommerce"
}

variable "db_user" {
  type    = string
  default = "postgres"
}

variable "db_password" {
  description = "Postgres password for the lab container. Set in terraform.tfvars locally; never commit."
  type        = string
  sensitive   = true
  default     = ""
}

variable "jwt_secret" {
  description = "JWT secret (>= 32 chars). Set locally; never commit."
  type        = string
  sensitive   = true
  default     = ""
}

variable "metrics_token" {
  description = "Metrics bearer token (>= 32 chars). Set locally; never commit."
  type        = string
  sensitive   = true
  default     = ""
}

variable "ghcr_username" {
  description = "GHCR username for docker login. Empty skips login (public pull)."
  type        = string
  default     = ""
}

variable "ghcr_token" {
  description = "GHCR token. Empty skips docker login. Never commit."
  type        = string
  sensitive   = true
  default     = ""
}
