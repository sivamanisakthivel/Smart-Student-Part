# Smart-Student-Part
# Smart Student Part-Time Job Management System

A production-ready, full-stack college project application built with **React.js + Vite** on the frontend, **Python Flask REST API** on the backend, and **MySQL / SQLAlchemy ORM** (with automatic SQLite fallback for zero-config running in VS Code).

Inspired by modern UI design standards (Linear, Vercel, Airbnb), featuring 6-Digit Email OTP verification, student dashboard, fast job search with Tamil Nadu positions (Salem, Erode, Chennai, Coimbatore), and complete Admin Control Panel with Chart.js analytics.

---

## 🌟 Key Features

### Student Portal
* **Registration & Login**: Secure account creation with College, Department & Skills tag.
* **6-Digit OTP Security**: Two-step authentication with 5-minute expiry, countdown timer, resend button, and 3-attempt lock protection.
* **Student Dashboard**: Welcome banner, profile completion meter, total/pending/accepted applications count, saved job bookmarks, recommended jobs, and application timeline.
* **Fast Job Search**: Debounced instant search, category filters (Bakery, Medical, Grocery, Hotel, Tea Shop, Tech), job type filters, salary sorting, and pagination.
* **Job Detail & Apply**: Comprehensive requirements checklist, duplicate application prevention, cover note input, and floating toast notifications.

### Admin Portal
* **Admin Authentication**: Default admin login (`admin@jobportal.com` / `admin123`).
* **Visual Analytics Dashboard**: Interactive Chart.js charts for application status breakdown and job category distribution.
* **Job Management**: Create, edit, toggle active/closed status, and delete job postings.
* **Student Management**: Searchable student directory, student details modal, and account deletion.
* **Application Review**: Filter applications by status and update status (`Pending` -> `Accepted` / `Rejected`) with instant UI updates.

---

## 🛠️ Technology Stack

* **Frontend**: React.js, Vite, JavaScript, HTML5, CSS3, Bootstrap 5 utilities, React Icons, Axios, React Router DOM, Chart.js.
* **Backend**: Python 3, Flask, REST API, Werkzeug security, PyJWT, Flask-CORS.
* **Database**: MySQL, SQLAlchemy ORM (auto-falls back to SQLite `student_job.db` if MySQL is offline).

---

## 🚀 How to Run in VS Code

### 1. Environment Setup
Copy `.env.example` to `.env` in the root folder:
```bash
cp .env.example .env
```

---

### 2. Backend Setup (Flask REST API)

Open terminal in VS Code:
```bash
cd backend
python -m venv .venv
```

**Activate Virtual Environment**:
- **Windows**:
  ```powershell
  ..\.venv\Scripts\activate
  ```
- **Linux / macOS**:
  ```bash
  source ../.venv/bin/activate
  ```

**Install Backend Dependencies**:
```bash
pip install -r requirements.txt
```

**Run Backend Server**:
```bash
python app.py
```
*Backend API will run at `http://127.0.0.1:5000`*

---

### 3. Frontend Setup (React + Vite)

Open a new terminal tab in VS Code:
```bash
cd frontend
npm install
npm run dev
```
*Frontend application will launch at `http://localhost:5173` or `http://localhost:3000`*

---

## 🔑 Default Credentials

- **Admin Login**:
  - **Email / Username**: `admin@jobportal.com` (or `admin`)
  - **Password**: `admin123`

- **Demo Student Login**:
  - **Email**: `siva@example.com`
  - **Password**: `password123`

---

## 📧 Gmail SMTP Setup (Optional)
To send real OTP emails via Gmail SMTP, update `.env`:
```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
REQUIRE_REALTIME_OTP=True
```
*(If unconfigured, OTPs will log to the backend server output and display auto-fill helper banners in dev mode).*

---

## 🗄️ Database Import (MySQL - Optional)
If you wish to use local MySQL server, create database and run script:
```bash
mysql -u root -p < database/database.sql
```
*(Otherwise, SQLite fallback initializes automatically with pre-seeded Tamil Nadu job data).*

---

## ☁️ Deploying on Vercel

This repository is pre-configured with **zero-config Vercel hosting**:
- `vercel.json` and `frontend/vercel.json` route all frontend pages cleanly.
- `api/index.py` handles backend serverless requests.
- Single Page Application (SPA) routing fallback prevents 404 errors on browser page reloads.

### Steps to Deploy:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**.
2. Select your GitHub repository: **`sivamanisakthivel/Smart-Student-Part`**.
3. Vercel will automatically detect `vercel.json` configuration!
4. *(Optional)* In **Environment Variables**, add:
   - `VITE_API_BASE_URL` (if backend API is hosted on a dedicated server)
   - `SECRET_KEY` and `JWT_SECRET_KEY`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
5. Click **"Deploy"** — your project is live in ~60 seconds!
