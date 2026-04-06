variable "region" {
  default = "ap-south-1"
}

variable "profile" {
  default   = "avinest"
  sensitive = true
}

variable "ec2_instance_type" {
  default = "t3.micro"
}

variable "db_username" {
  default   = "postgres"
  sensitive = true
}

variable "db_password" {
  default   = "postgres"
  sensitive = true
}

variable "db_name" {
  default   = "avinest"
  sensitive = true
}