-- Skema ini dirancang untuk mendukung otentikasi, RBAC dinamis, dan SSO.

-- Tabel untuk peran (Roles)
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Tabel untuk pengguna (Users)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT,
    status ENUM('active', 'deactivated', 'blocked') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Tabel penghubung untuk peran pengguna (User-Roles)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT,
    role_id INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Tabel untuk izin (Permissions)
CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- Tabel penghubung untuk peran dan izin (Role-Permissions)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT,
    permission_id INT,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Tabel untuk domain yang diizinkan untuk SSO
CREATE TABLE IF NOT EXISTS sso_domains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- === INSERT DATA AWAL ===

-- Masukkan peran-peran dasar
INSERT INTO roles (id, name, description) VALUES
(1, 'superadmin', 'Akses penuh ke seluruh sistem, termasuk manajemen admin.'),
(2, 'admin', 'Akses ke fitur-fitur administratif yang ditentukan.'),
(3, 'user', 'Akses standar untuk pengguna aplikasi.')
ON DUPLICATE KEY UPDATE name=name;

-- (Opsional) Masukkan beberapa izin dasar
INSERT INTO permissions (name, description) VALUES
('manage_users', 'Kemampuan untuk membuat, mengedit, dan menghapus pengguna.'),
('manage_roles', 'Kemampuan untuk membuat, mengedit, dan menghapus peran.'),
('manage_settings', 'Kemampuan untuk mengubah pengaturan aplikasi.'),
('view_admin_dashboard', 'Kemampuan untuk melihat dashboard admin.')
ON DUPLICATE KEY UPDATE name=name;

-- (Opsional) Tetapkan beberapa izin ke peran admin
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, 1), -- admin bisa manage_users
(2, 4)  -- admin bisa view_admin_dashboard
ON DUPLICATE KEY UPDATE role_id=role_id;
