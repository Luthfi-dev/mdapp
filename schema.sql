-- Skema Database untuk Aplikasi Toolkit dengan RBAC dan SSO

-- Tabel untuk menyimpan peran yang tersedia dalam sistem (e.g., superadmin, admin, user)
CREATE TABLE `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT='Menyimpan daftar peran pengguna';

-- Tabel untuk menyimpan data pengguna
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role_id` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`)
) COMMENT='Menyimpan data kredensial dan profil pengguna';

-- Tabel penghubung untuk menangani hubungan banyak-ke-banyak antara users dan roles
CREATE TABLE `user_roles` (
  `user_id` INT NOT NULL,
  `role_id` INT NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE
) COMMENT='Menghubungkan pengguna dengan perannya';

-- Tabel untuk menyimpan izin-izin spesifik yang bisa diberikan (e.g., 'manage_users', 'edit_apps')
CREATE TABLE `permissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT='Daftar semua izin yang mungkin ada di sistem';

-- Tabel penghubung untuk memberikan izin ke peran tertentu
CREATE TABLE `role_permissions` (
  `role_id` INT NOT NULL,
  `permission_id` INT NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
) COMMENT='Menghubungkan peran dengan izin yang dimilikinya';

-- Tabel untuk menyimpan domain yang diizinkan untuk SSO
CREATE TABLE `sso_domains` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `domain` VARCHAR(255) NOT NULL UNIQUE,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
  INDEX `idx_domain` (`domain`)
) COMMENT='Menyimpan domain yang diizinkan untuk melakukan SSO';

-- Memasukkan data peran awal
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'superadmin', 'Akses penuh ke seluruh sistem, termasuk manajemen admin dan RBAC.'),
(2, 'admin', 'Akses terbatas untuk mengelola konten dan pengguna tertentu.'),
(3, 'user', 'Pengguna standar dengan akses ke fitur-fitur utama aplikasi.');

-- Memasukkan data izin awal (contoh)
INSERT INTO `permissions` (`name`, `description`) VALUES
('manage_users', 'Kemampuan untuk menambah, mengedit, dan menghapus pengguna.'),
('manage_admins', 'Kemampuan untuk menambah, mengedit, dan menghapus admin.'),
('manage_roles', 'Kemampuan untuk membuat, mengedit, dan menghapus peran.'),
('manage_permissions', 'Kemampuan untuk mengelola izin peran.'),
('manage_sso_domains', 'Kemampuan untuk mengelola domain SSO yang diizinkan.'),
('view_admin_dashboard', 'Kemampuan untuk melihat dashboard admin.');

-- Memberikan semua izin ke superadmin
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, id FROM `permissions`;

-- Memberikan izin dasar ke admin
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 2, id FROM `permissions` WHERE `name` IN ('manage_users', 'view_admin_dashboard');

-- (Opsional) Membuat pengguna superadmin awal (ganti password dengan hash yang aman)
-- Jalankan endpoint /api/dev/hash-password untuk mendapatkan hash dari password Anda
-- INSERT INTO `users` (`name`, `email`, `password`, `role_id`) VALUES
-- ('Super Admin', 'superadmin@example.com', '$2a$10$YourSecurePasswordHashHere', 1);
-- INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES (LAST_INSERT_ID(), 1);
