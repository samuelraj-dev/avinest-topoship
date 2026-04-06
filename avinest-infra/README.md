# Terraform commands
- `terraform fmt` - format source code
- `terraform init` - initialize and install required definitions
- `terraform validate` - check configuration
- `terraform apply` - shows plan and applies it using workspace provider
- `terraform show` - show all state


# Aws CLI profile config
- command: `aws configure --profile avinest`
- The prompt will ask for access key, secret access key, and region. enter the required.

- To verify if connected: `aws --profile avinest sts get-caller-identity`

- The config is stored in `~/.aws/config` and `~/.aws/credentials`

# Aws pem key

- download after creating it.
- chmod 400 <secret-key>.pem
- ssh -i <secret-key>.pem ubuntu@public_ip

# One time spring boot ec2 setup

- cd ~
- git clone https://github.com/samuelraj-dev/avinest-topoship.git
- cd ~/avinest-topoship/avinest-backend
- ./mvnw clean package -Dflyway.skip=true -Djooq.codegen.skip=true -DskipTests