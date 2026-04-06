output "ec2_public_ip" {
  value = aws_instance.app_server.public_ip
}

output "rds" {
  value = aws_db_instance.postgres.endpoint
}