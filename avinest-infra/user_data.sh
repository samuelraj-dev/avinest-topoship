#!/bin/bash

set -e
exec > /var/log/user-data.log 2>&1

apt update -y

apt install openjdk-25-jdk -y

apt install git -y

apt install nginx -y

systemctl enable nginx
systemctl start nginx

mkdir -p /var/www/avinest

apt install certbot -y
apt install python3-certbot-nginx -y

apt install software-properties-common -y
apt add-apt-repository ppa:deadsnakes/ppa
apt update -y
apt install python3.13 -y
apt install python3.13-venv -y
apt install python3.13-dev -y
