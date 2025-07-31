-- Skema Database Lengkap untuk Aplikasi Toolkit Cerdas

-- =============================================
-- Bagian Otentikasi dan Manajemen Pengguna
-- =============================================

-- Tabel untuk menyimpan peran pengguna (RBAC)
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk menyimpan data pengguna
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT,
    status ENUM('active', 'deactivated', 'blocked') DEFAULT 'active',
    points INT DEFAULT 0, -- Kolom baru untuk poin pengguna
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Tabel penghubung untuk peran pengguna (mendukung banyak peran per pengguna jika diperlukan)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT,
    role_id INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Tabel untuk menyimpan izin spesifik (RBAC)
CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- Tabel penghubung untuk izin peran (RBAC)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT,
    permission_id INT,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Tabel untuk mengelola domain yang diizinkan untuk SSO
CREATE TABLE IF NOT EXISTS sso_domains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain_name VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Bagian Fitur: Catatan Cerdas
-- =============================================

-- Tabel untuk catatan pribadi (personal notes)
CREATE TABLE IF NOT EXISTS notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel untuk item checklist dalam catatan pribadi
CREATE TABLE IF NOT EXISTS note_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    note_id INT NOT NULL,
    label TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
);

-- Tabel untuk grup catatan (group notes)
CREATE TABLE IF NOT EXISTS note_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    owner_id INT NOT NULL, -- User yang membuat grup
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel penghubung untuk anggota grup
CREATE TABLE IF NOT EXISTS group_members (
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('admin', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES note_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel untuk tugas dalam grup
CREATE TABLE IF NOT EXISTS group_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    label TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES note_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabel penghubung untuk penugasan tugas (siapa mengerjakan tugas apa)
CREATE TABLE IF NOT EXISTS task_assignees (
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (task_id, user_id),
    FOREIGN KEY (task_id) REFERENCES group_tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- =============================================
-- Bagian Fitur: Generator Surat
-- =============================================

-- Tabel untuk menyimpan template surat
CREATE TABLE IF NOT EXISTS letter_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    status ENUM('public', 'private') DEFAULT 'private',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel untuk menyimpan field dinamis yang terkait dengan setiap template
CREATE TABLE IF NOT EXISTS template_fields (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT NOT NULL,
    field_id VARCHAR(100) NOT NULL, -- e.g., 'nama_lengkap'
    label VARCHAR(255) NOT NULL,    -- e.g., 'Nama Lengkap'
    FOREIGN KEY (template_id) REFERENCES letter_templates(id) ON DELETE CASCADE
);


-- =============================================
-- Inisialisasi Data Awal (Contoh)
-- =============================================

-- Masukkan peran-peran dasar
INSERT INTO roles (id, name, description) VALUES
(1, 'superadmin', 'Akses penuh ke seluruh sistem, termasuk manajemen admin.'),
(2, 'admin', 'Akses terbatas untuk mengelola aplikasi dan pengguna.'),
(3, 'user', 'Pengguna reguler dengan akses ke fitur-fitur aplikasi.')
ON DUPLICATE KEY UPDATE name=name; -- Tidak melakukan apa-apa jika sudah ada

-- Masukkan izin-izin dasar (contoh)
INSERT INTO permissions (name, description) VALUES
('manage_users', 'Dapat menambah, mengedit, dan menghapus pengguna.'),
('manage_roles', 'Dapat membuat dan mengatur izin untuk peran.'),
('view_admin_dashboard', 'Dapat mengakses dasbor admin.')
ON DUPLICATE KEY UPDATE name=name;

-- Berikan semua izin ke superadmin (contoh)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 1),
(1, 2),
(1, 3)
ON DUPLICATE KEY UPDATE role_id=role_id;
