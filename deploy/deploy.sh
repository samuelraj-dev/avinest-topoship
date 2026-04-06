#!/bin/bash

set -e

BASE_DIR=/home/ubuntu/avinest-topoship

echo "Pull latest code..."
cd $BASE_DIR
git pull -f origin main

# ---------------- BACKEND ----------------

echo "Copy systemd service..."
sudo cp deploy/springboot.service /etc/systemd/system/

echo "Reload systemd..."
sudo systemctl daemon-reload
sudo systemctl enable springboot

echo "Update nginx config..."
sudo cp deploy/nginx.conf /etc/nginx/sites-available/default

echo "Restart nginx..."
sudo systemctl restart nginx

echo "Build spring boot..."
cd $BASE_DIR/avinest-backend
./mvnw clean package -Dflyway.skip=true -Djooq.codegen.skip=true -DskipTests

echo "Restart backend service..."
sudo systemctl restart springboot

# ---------------- SCRAPER ----------------

echo "Setting up scraper..."
cd $BASE_DIR/avinest-scraper

if [ ! -d ".venv" ]; then
  echo "Creating virtual environment..."
  python3.13 -m venv .venv
fi

echo "Installing dependencies..."
.venv/bin/pip install --upgrade pip
.venv/bin/pip install -r requirements.txt

echo "Copy systemd service..."
sudo cp deploy/scraper.service /etc/systemd/system/

echo "Reload systemd..."
sudo systemctl daemon-reload
sudo systemctl enable scraper

echo "Restart scraper service..."
sudo systemctl restart scraper

echo "Deploy completed successfully"