# 🐳 Clinic ERP Docker & GitHub Integration Guide

## 1. Status: Docker + GitHub Connection
- **Docker Engine**: Installed & Running (Docker v29.7.2)
- **GitHub Container Registry (GHCR)**: Authenticated (`ghcr.io` Login Succeeded)
- **Image Built**: `ghcr.io/mayursweet52/clinic:latest` (Size: ~417MB content, 1.6GB unpacked)

---

## 2. Fast Commands

### Build Docker Image Locally:
```bash
docker build -t ghcr.io/mayursweet52/clinic:latest .
```

### Run Multi-Container Stack (Next.js + Postgres + Redis):
```bash
docker compose up -d
```

### Check Running Containers:
```bash
docker compose ps
```

### Stop Containers:
```bash
docker compose down
```

---

## 3. GitHub Actions CI/CD Setup
A ready-to-use GitHub Actions workflow is provided in `docker/github-actions-docker-publish.yml`.
To enable automatic cloud Docker image builds on every GitHub commit:
1. In GitHub Repository (`mayursweet52/CLINIC-`), enable GitHub Actions.
2. The workflow automatically builds and publishes the image to:
   `ghcr.io/mayursweet52/clinic:latest`
