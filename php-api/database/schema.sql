-- FindIt Database Schema for MySQL
-- Run this script in phpMyAdmin or MySQL CLI

-- Create database
CREATE DATABASE IF NOT EXISTS findit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE findit_db;

-- Users table (authentication)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB;

-- Profiles table (user information)
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    avatar_url VARCHAR(500),
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- User roles table (for admin access)
CREATE TABLE IF NOT EXISTS user_roles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('admin', 'moderator', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id, role),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- Items table (lost and found items)
CREATE TABLE IF NOT EXISTS items (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('lost', 'found') NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    date_occurred DATE NOT NULL,
    image_url VARCHAR(500),
    status ENUM('active', 'matched', 'resolved', 'closed') DEFAULT 'active',
    qr_code VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at),
    FULLTEXT INDEX idx_search (title, description)
) ENGINE=InnoDB;

-- Matches table (AI matching results)
CREATE TABLE IF NOT EXISTS matches (
    id VARCHAR(36) PRIMARY KEY,
    lost_item_id VARCHAR(36) NOT NULL,
    found_item_id VARCHAR(36) NOT NULL,
    match_score DECIMAL(5,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lost_item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (found_item_id) REFERENCES items(id) ON DELETE CASCADE,
    UNIQUE KEY unique_match (lost_item_id, found_item_id),
    INDEX idx_lost_item (lost_item_id),
    INDEX idx_found_item (found_item_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Insert sample admin user (password: admin123)
-- Note: In production, create admin through proper registration
INSERT INTO users (id, email, password, created_at) VALUES 
('admin-uuid-0001', 'admin@findit.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW());

INSERT INTO profiles (id, user_id, full_name, created_at, updated_at) VALUES 
('profile-uuid-0001', 'admin-uuid-0001', 'System Admin', NOW(), NOW());

INSERT INTO user_roles (id, user_id, role, created_at) VALUES 
('role-uuid-0001', 'admin-uuid-0001', 'admin', NOW());

-- Show tables
SHOW TABLES;
