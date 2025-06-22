#!/bin/bash

# Instabids Command Center - Deployment Script
# This script sets up Directus with AgencyOS on a fresh Ubuntu server

set -e

echo "🚀 Instabids Command Center Deployment Script"
echo "============================================"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root (use sudo)" 
   exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
else
    echo "Docker already installed"
fi

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    apt-get install -y docker-compose-plugin
else
    echo "Docker Compose already installed"
fi

# Create app directory
echo "📁 Creating application directory..."
mkdir -p /opt/instabids-command-center
cd /opt/instabids-command-center

# Clone repository
echo "📥 Cloning repository..."
if [ ! -d ".git" ]; then
    git clone https://github.com/Instabidsai/instabids-command-center.git .
else
    git pull origin main
fi

# Create required directories
echo "📁 Creating data directories..."
mkdir -p data/database data/caddy uploads extensions

# Generate random keys if .env doesn't exist
if [ ! -f .env ]; then
    echo "🔐 Generating secure keys..."
    cp .env.example .env
    
    # Generate random keys
    KEY=$(openssl rand -base64 32)
    SECRET=$(openssl rand -base64 32)
    DB_PASSWORD=$(openssl rand -base64 16)
    ADMIN_PASSWORD=$(openssl rand -base64 16)
    
    # Update .env file with generated values
    sed -i "s/your-random-key-here/$KEY/g" .env
    sed -i "s/your-random-secret-here/$SECRET/g" .env
    sed -i "s/your-secure-password-here/$DB_PASSWORD/g" .env
    sed -i "s/your-admin-password-here/$ADMIN_PASSWORD/g" .env
    
    echo ""
    echo "⚡ IMPORTANT: Save these credentials!"
    echo "===================================="
    echo "Admin Email: admin@instabids.ai"
    echo "Admin Password: $ADMIN_PASSWORD"
    echo "Database Password: $DB_PASSWORD"
    echo "===================================="
    echo ""
fi

# Set proper permissions
echo "🔒 Setting permissions..."
chown -R 1000:1000 uploads extensions

# Start services
echo "🚀 Starting services..."
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
echo "✅ Checking service status..."
docker compose ps

echo ""
echo "🎉 Deployment complete!"
echo "======================="
echo "Directus is now running at:"
echo "- Local: http://localhost:8055"
echo "- Domain: https://command.instabids.ai (configure DNS first)"
echo ""
echo "Next steps:"
echo "1. Configure your domain DNS to point to this server"
echo "2. Update PUBLIC_URL in .env to your domain"
echo "3. Run: docker compose restart"
echo "4. Access Directus and start importing data"
echo ""
echo "To view logs: docker compose logs -f"
echo "To stop: docker compose down"
echo "To restart: docker compose restart"