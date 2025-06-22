# 🚀 Instabids Command Center

AI-powered command center built on Directus with AgencyOS template - a complete Notion replacement for managing 25+ AI agents, team collaboration, and knowledge management.

## 🎯 Features

- **Complete Agency Management System** (via AgencyOS)
  - Project & Task Management
  - Team Collaboration
  - Client Portal
  - Knowledge Base
  - Document Management
  
- **AI Agent Dashboard** (Custom Extension)
  - Real-time monitoring of 25+ agents
  - Task queue visualization
  - Performance metrics
  - Agent health status
  
- **Built-in Integrations**
  - Slack webhook endpoints
  - GitHub integration
  - OpenAI API support
  - MCP (Model Context Protocol) server

## 🛠️ Tech Stack

- **Backend**: Directus 10.10.7 (Headless CMS)
- **Database**: PostgreSQL 15 with PostGIS
- **Cache**: Redis 7
- **Web Server**: Caddy 2 (automatic SSL)
- **Frontend**: Nuxt 3 (AgencyOS)
- **Infrastructure**: Docker Compose

## 🚀 Quick Deploy

### Prerequisites
- Ubuntu 24.04 server (DigitalOcean Droplet recommended)
- Domain pointed to your server
- 4GB RAM minimum

### One-Command Deploy

```bash
# SSH into your server
ssh root@your-server-ip

# Download and run deployment script
curl -fsSL https://raw.githubusercontent.com/Instabidsai/instabids-command-center/main/deploy.sh | sudo bash
```

The script will:
1. Install Docker & Docker Compose
2. Clone this repository
3. Generate secure keys automatically
4. Start all services
5. Display your admin credentials

### Manual Deploy

1. Clone the repository:
```bash
git clone https://github.com/Instabidsai/instabids-command-center.git
cd instabids-command-center
```

2. Copy and configure environment:
```bash
cp .env.example .env
# Edit .env with your values
```

3. Start services:
```bash
docker compose up -d
```

## 🔧 Configuration

### Domain Setup
1. Point your domain to the server IP
2. Update `PUBLIC_URL` in `.env`
3. Update domain in `Caddyfile`
4. Restart services: `docker compose restart`

### Email Configuration (Optional)
Add to `.env`:
```env
EMAIL_FROM=no-reply@yourdomain.com
EMAIL_TRANSPORT=smtp
EMAIL_SMTP_HOST=smtp.sendgrid.net
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=apikey
EMAIL_SMTP_PASSWORD=your-api-key
```

### S3/Spaces Storage (Optional)
Add to `.env`:
```env
STORAGE_LOCATIONS=spaces
STORAGE_SPACES_DRIVER=s3
STORAGE_SPACES_KEY=your-key
STORAGE_SPACES_SECRET=your-secret
STORAGE_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
STORAGE_SPACES_BUCKET=your-bucket
STORAGE_SPACES_REGION=nyc3
```

## 📦 Installing AgencyOS Template

After Directus is running:

```bash
# Install Directus Template CLI
npm install -g directus-template-cli

# Apply AgencyOS template
npx directus-template-cli@latest apply
```

Choose "Agency OS" when prompted.

## 🔌 MCP Integration

The MCP server allows Claude Desktop to interact with your command center.

### Setup
1. Deploy the MCP server (included in `/mcp-server`)
2. Add to Claude Desktop config:

```json
{
  "mcpServers": {
    "instabids-command": {
      "command": "node",
      "args": ["/path/to/mcp-server/index.js"],
      "env": {
        "DIRECTUS_URL": "https://command.instabids.ai",
        "DIRECTUS_TOKEN": "your-static-token"
      }
    }
  }
}
```

## 🛡️ Security

- All secrets are auto-generated on first deploy
- SSL certificates auto-provisioned by Caddy
- PostgreSQL secured with strong passwords
- Redis configured for internal access only
- Regular automated backups recommended

## 📊 Monitoring

View logs:
```bash
docker compose logs -f
```

Check service status:
```bash
docker compose ps
```

## 🆘 Troubleshooting

If services don't start:
```bash
# Check logs
docker compose logs directus

# Restart services
docker compose restart

# Full reset (WARNING: deletes data)
docker compose down -v
docker compose up -d
```

## 📝 License

MIT License - See LICENSE file

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

Built with ❤️ by [Instabids.ai](https://instabids.ai)