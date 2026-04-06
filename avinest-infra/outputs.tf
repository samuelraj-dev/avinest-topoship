output "ec2_public_ip" {
  value = aws_instance.app_server.public_ip
}

output "rds" {
  value = aws_db_instance.postgres.endpoint
}

output "acm_validation_records" {
  value = [
    for dvo in aws_acm_certificate.frontend.domain_validation_options : {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  ]
}