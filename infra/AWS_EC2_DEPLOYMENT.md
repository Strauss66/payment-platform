# AWS EC2 Deployment (Ubuntu)

This guide assumes a single EC2 instance running Nginx (reverse proxy), the React build (static files), and the Node backend.

## 1) Prerequisites

```bash
sudo apt update
sudo apt install -y nginx git curl build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v
```

## 2) Clone repository

```bash
sudo mkdir -p /opt/app && sudo chown -R $USER:$USER /opt/app
cd /opt/app
git clone <YOUR_REPO_URL> .
```

## 3) Environment files

- Backend: create `/etc/app-backend.env` with required variables (see `backend/DEPLOYMENT.md`).
- Backend local `.env` (optional): `backend/.env` if you prefer file-based env loading.
- Frontend: create `frontend/.env` with at least:

```
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_MEDIA_BASE_URL=https://your-domain.com/media
REACT_APP_ALLOW_SCHOOL_SWITCH=false
```

## 4) Build

```bash
chmod +x scripts/build-all.sh
scripts/build-all.sh
```

## 5) Nginx

```bash
sudo cp infra/nginx/app.conf /etc/nginx/sites-available/app.conf
sudo ln -sfn /etc/nginx/sites-available/app.conf /etc/nginx/sites-enabled/app.conf
sudo nginx -t
sudo systemctl reload nginx
```

Assumptions in `app.conf`:
- React build at `/var/www/app/frontend/build` (copy the build there if needed).
- Backend listens on `http://127.0.0.1:5001`.

Example copy of the build:

```bash
sudo mkdir -p /var/www/app/frontend/build
sudo rsync -a --delete frontend/build/ /var/www/app/frontend/build/
```

## 6) Backend service (systemd)

```bash
sudo cp infra/systemd/backend.service.example /etc/systemd/system/backend.service
sudo sed -i 's|User=deploy|User=ubuntu|' /etc/systemd/system/backend.service
sudo sed -i 's|WorkingDirectory=/opt/app/backend|WorkingDirectory=/opt/app/backend|' /etc/systemd/system/backend.service
sudo systemctl daemon-reload
sudo systemctl enable backend
sudo systemctl start backend
sudo systemctl status backend --no-pager
```

## 7) Verify

```bash
curl http://localhost:5001/api/health
# Expect: { "status": "ok", "db": "ok", ... }

curl http://127.0.0.1/
# Should return the React app (HTML)
```

## 8) Next step: HTTPS

Add TLS using:
- An Application Load Balancer (ALB) + ACM certificate, or
- Certbot on the EC2 instance (`nginx` plugin).

> For ALB, point the target group to port 80 of the EC2. Keep health check at `/api/health`.


