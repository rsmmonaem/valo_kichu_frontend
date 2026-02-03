# Docker Deployment Guide for VPS

This guide explains how to run your Next.js application using Docker and Docker Compose on your VPS (Virtual Private Server).

## 1. Prerequisites

### Install Docker and Docker Compose
If you haven't installed Docker yet, run these commands on your VPS (Ubuntu/Debian):

```bash
# Update package list
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Enable Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker
```

---

## 2. Transferring Files to VPS

You need to get your project files onto the server. You can use **Git** (recommended) or **SCP**.

### Option A: Using Git (Recommended)
1. Push your code to GitHub/GitLab.
2. On your VPS:
   ```bash
   git clone <your-repo-url>
   cd valo_kichu_frontend
   ```

### Option B: Using SCP (Copy from local machine)
Run this command from your **local terminal**:
```bash
scp -r . root@YOUR_VPS_IP:/home/valo_kichu_frontend
```

---

## 3. Running the Application

Once you are inside the project folder on your VPS:

### 1. Create the Environment File
Ensure your `.env` file exists. If it's not there, create it:
```bash
nano .env
```
Add your variables (e.g., `NEXT_PUBLIC_API_URL=https://backend.valokichu.com`).

### 2. Build and Start the Containers
Run the following command:
```bash
docker compose up -d --build
```
- `-d`: Runs in "detached" mode (in the background).
- `--build`: Forces a rebuild of the image.

---

## 4. Reverse Proxy Setup (CyberPanel)

Since your `docker-compose.yml` maps the app to `127.0.0.1:3000`, it is not directly accessible from the internet. You must use a Reverse Proxy to map your domain (e.g., `valo.npms.pro`) to this port.

### In CyberPanel:
1. Go to **Websites** > **List Websites** > **Manage** (for your domain).
2. Scroll down to **Reverse Proxy**.
3. Click **Add Reverse Proxy**.
4. Set the following:
   - **Proxy Name**: `nextjs_app`
   - **Backend URL**: `http://127.0.0.1:3000`
5. Click **Save**.

---

## 5. Useful Docker Commands

| Action | Command |
| :--- | :--- |
| **Check Logs** | `docker compose logs -f` |
| **Stop App** | `docker compose down` |
| **Restart App** | `docker compose restart` |
| **View Running Containers** | `docker ps` |
| **Rebuild after code change** | `docker compose up -d --build` |

---

## Troubleshooting

- **Check if port 3000 is running**: `netstat -tulnp | grep 3000`
- **Check container status**: `docker compose ps`
- **Check build errors**: `docker compose logs -f nextjs-app`
