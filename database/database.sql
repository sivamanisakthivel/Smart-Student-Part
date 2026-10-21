-- Smart Student Part-Time Job Management System Database Schema & Seed Data

CREATE DATABASE IF NOT EXISTS student_job_db;
USE student_job_db;

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Students Table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    college VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    skills TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) DEFAULT 'FaBriefcase',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    job_type VARCHAR(50) NOT NULL DEFAULT 'Part-Time', -- Part-Time, Internship, Full-Time, Weekend, Remote
    salary VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Active', -- Active, Closed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    student_id INT NOT NULL,
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Accepted, Rejected
    cover_note TEXT,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (job_id, student_id)
);

-- 6. Saved Jobs Table
CREATE TABLE IF NOT EXISTS saved_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    job_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_saved (student_id, job_id)
);

-- 7. OTP Verification Table
CREATE TABLE IF NOT EXISTS otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose VARCHAR(50) DEFAULT 'login',
    attempts INT DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Categories
INSERT IGNORE INTO categories (id, name, icon) VALUES
(1, 'Bakery', 'FaCookieBite'),
(2, 'Medical', 'FaClinicMedical'),
(3, 'Grocery Store', 'FaShoppingBasket'),
(4, 'Hotel & Restaurant', 'FaUtensils'),
(5, 'Tea & Cafe', 'FaCoffee'),
(6, 'Supermarket', 'FaStore'),
(7, 'Tech & Data Entry', 'FaLaptopCode'),
(8, 'Tutoring & Education', 'FaGraduationCap');

-- Seed Sample Jobs (Tamil Nadu locations)
INSERT INTO jobs (title, company_name, location, job_type, salary, category, description, requirements, status) VALUES
`
-- Seed Default Admin User (username: admin, email: admin@jobportal.com, password: admin123)
INSERT IGNORE INTO admins (username, email, password, full_name) VALUES
('admin', 'admin@jobportal.com', 'scrypt:32768:8:1$uD080s1j4N6d$f4a8b7921cd6e453fa8846c4f0f9b6b7a0f443b74965c4046b9c9f4e24cf74e2a6321b033d5964f40f2f01f80b18f3a35b1d5c2e0b57116892e5c8e3', 'System Administrator');
                