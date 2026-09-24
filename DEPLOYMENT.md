# NexSync Autonomous Mobility Platform — Deployment Architecture Guide

This guide details the complete deployment setup across the agreed-upon stack:
1. **MongoDB Atlas** (Database)
2. **Render** (Backend API & Authorization Engine)
3. **Vercel** (Vite + React SPA Frontend & Admin Hub)

---

## 1. MongoDB Atlas Setup

1. **Create an Atlas Cluster**:
   - Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
   - Create a free or shared cluster (e.g. `Cluster0` in the closest AWS region).
2. **Database Access (User Credentials)**:
   - Go to **Database Access** -> **Add New Database User**.
   - Select **Password Authentication**.
   - Create a user (e.g., `nexsync_admin`) with a secure password.
   - Assign the **readWriteAnyDatabase** or `dbAdmin` role.
3. **Network Access**:
   - Go to **Network Access** -> **Add IP Address**.
   - Select **Allow Access from Anywhere (`0.0.0.0/0`)** so Render can connect to your database.
4. **Copy Connection String**:
   - Under Clusters, click **Connect** -> **Drivers** (Node.js).
   - Copy the URI:
     ```
     mongodb+srv://<username>:<password>@cluster0.mongodb.net/nexsync?retryWrites=true&w=majority
     ```
5. **Seed / Migrate Database to Atlas**:
   - From your local terminal or deployment runner:
     ```bash
     $env:MONGO_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/nexsync?retryWrites=true&w=majority"
     node server/scripts/seed.js
     ```
   - This automatically synchronizes indexes and provisions the default Club Coordinator credentials.

---

## 2. Render Deployment (Backend Service)

### Option A: Using the Render Blueprint (`render.yaml`)
1. In your [Render Dashboard](https://dashboard.render.com/), click **New** -> **Blueprint**.
2. Connect your GitHub repository: `lohithkumarmorishetti-2k07/nexsync_website-main`.
3. Render will read `render.yaml` and configure the Web Service automatically.

### Option B: Manual Web Service
1. In Render, click **New** -> **Web Service**.
2. Connect the GitHub repository `lohithkumarmorishetti-2k07/nexsync_website-main`.
3. Configure the service settings:
   - **Name**: `nexsync-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
4. Configure Environment Variables:
   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `5000` | Port handled by Render |
   | `MONGO_URI` | `mongodb+srv://<username>:<password>@cluster0.mongodb.net/nexsync?retryWrites=true&w=majority` | Atlas URI |
   | `CLIENT_URL` | `https://<your-vercel-domain>.vercel.app,http://localhost:5173` | Allowed CORS origins |
   | `JWT_SECRET` | `<your-secure-random-secret>` | Secret key for JWT signing |
5. Click **Create Web Service**. Once deployed, copy your Render URL (e.g., `https://nexsync-api.onrender.com`).

---

## 3. Vercel Deployment (Frontend SPA)

1. In [Vercel Dashboard](https://vercel.com/dashboard), click **Add New** -> **Project**.
2. Import the GitHub repository `lohithkumarmorishetti-2k07/nexsync_website-main`.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `vite-project` *(or root, utilizing root `vercel.json`)*
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Configure Environment Variables:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://nexsync-api.onrender.com` (Your Render Backend URL) |
5. Click **Deploy**.
6. After deployment completes, copy your live Vercel domain (e.g., `https://nexsync.vercel.app`) and update the `CLIENT_URL` environment variable on Render if needed.

---

## 4. Production Verification Checklist

- [x] Unauthenticated users see **Login** in the Navbar and **Member Portal** in the Footer.
- [x] Public registration route `/auth/register` returns 404 (Self-registration strictly disabled).
- [x] Only Club Coordinator can provision new team members with credentials and permissions.
- [x] Executive Members can create and manage Projects & Events with live cover image and video telemetry.
- [x] Wing Members are restricted from destructive modifications unless explicitly delegated permissions.
- [x] Redundant User model and legacy Wing Lead remnants are 100% removed.
- [x] Single authoritative identity and auth model is `TeamMember`.
