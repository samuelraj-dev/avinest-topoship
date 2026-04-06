#!/bin/bash

set -e

BASE_DIR=/home/ubuntu/avinest-topoship

echo "Pull latest code..."
cd $BASE_DIR
git pull -f origin main

echo "Copy systemd service..."
sudo cp deploy/springboot.service /etc/systemd/system/

echo "Reload systemd..."
sudo systemctl enable springboot
sudo systemctl daemon-reload

echo "Update nginx config..."
sudo cp deploy/nginx.conf /etc/nginx/sites-available/default

echo "Restart nginx..."
sudo systemctl restart nginx

echo "Build spring boot..."
cd $BASE_DIR/avinest-backend
./mvnw clean package -Dflyway.skip=true -Djooq.codegen.skip=true -DskipTests

echo "Restart service..."
sudo systemctl restart springboot

echo "Building scrapper..."
cd $BASE_DIR/avinest-scrapper
rm -rf .venv
python3.13 -m venv .venv
source .venv/bin/activate

echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Copy systemd service..."
sudo cp deploy/scrapper.service /etc/systemd/system/

echo "Reload systemd..."
sudo systemctl enable scrapper
sudo systemctl daemon-reload

echo "Restart service..."
sudo systemctl restart scrapper