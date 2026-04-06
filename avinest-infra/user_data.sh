#!/bin/bash

set -e
exec > /var/log/user-data.log 2>&1

apt update -y

apt install openjdk-25-jdk -y

apt install maven -y

apt install git -y