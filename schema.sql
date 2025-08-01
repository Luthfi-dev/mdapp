-- Membuat tabel untuk peran pengguna (RBAC)
CREATE TABLE `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `description` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC));

-- Membuat tabel untuk pengguna
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone_number` VARCHAR(20) NULL DEFAULT NULL,
  `referral_code` VARCHAR(10) NULL DEFAULT NULL,
  `points` INT NOT NULL DEFAULT 0,
  `browser_fingerprint` VARCHAR(255) NULL DEFAULT NULL,
  `avatar_url` VARCHAR(255) NULL DEFAULT NULL,
  `role_id` INT UNSIGNED NOT NULL,
  `status` ENUM('active', 'deactivated', 'blocked') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC),
  UNIQUE INDEX `referral_code_UNIQUE` (`referral_code` ASC),
  INDEX `fk_users_roles_idx` (`role_id` ASC),
  CONSTRAINT `fk_users_roles`
    FOREIGN KEY (`role_id`)
    REFERENCES `roles` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

-- Membuat tabel penghubung antara pengguna dan peran
CREATE TABLE `user_roles` (
  `user_id` INT UNSIGNED NOT NULL,
  `role_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  INDEX `fk_user_roles_role_idx` (`role_id` ASC),
  CONSTRAINT `fk_user_roles_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_roles_role`
    FOREIGN KEY (`role_id`)
    REFERENCES `roles` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

-- Membuat tabel untuk izin (permissions)
CREATE TABLE `permissions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC));

-- Membuat tabel penghubung antara peran dan izin
CREATE TABLE `role_permissions` (
  `role_id` INT UNSIGNED NOT NULL,
  `permission_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  INDEX `fk_role_permissions_permission_idx` (`permission_id` ASC),
  CONSTRAINT `fk_role_permissions_role`
    FOREIGN KEY (`role_id`)
    REFERENCES `roles` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_role_permissions_permission`
    FOREIGN KEY (`permission_id`)
    REFERENCES `permissions` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

-- Membuat tabel untuk domain SSO
CREATE TABLE `sso_domains` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `domain` VARCHAR(255) NOT NULL,
  `is_active` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `domain_UNIQUE` (`domain` ASC));

-- Membuat tabel untuk mencatat riwayat login
CREATE TABLE `login_history` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `login_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_login_history_user_idx` (`user_id` ASC),
  CONSTRAINT `fk_login_history_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

-- Membuat tabel untuk melacak hubungan referral
CREATE TABLE `referrals` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `referrer_id` INT UNSIGNED NOT NULL,
  `referred_id` INT UNSIGNED NOT NULL,
  `status` ENUM('valid', 'invalid', 'pending') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `referred_id_UNIQUE` (`referred_id` ASC),
  INDEX `fk_referrals_referrer_idx` (`referrer_id` ASC),
  CONSTRAINT `fk_referrals_referrer`
    FOREIGN KEY (`referrer_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_referrals_referred`
    FOREIGN KEY (`referred_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE);

-- Tabel untuk Catatan Cerdas (Pribadi)
CREATE TABLE `notes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_notes_user_idx` (`user_id` ASC),
  CONSTRAINT `fk_notes_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

CREATE TABLE `note_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `note_id` INT UNSIGNED NOT NULL,
  `label` TEXT NOT NULL,
  `completed` TINYINT NOT NULL DEFAULT 0,
  `order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `fk_note_items_note_idx` (`note_id` ASC),
  CONSTRAINT `fk_note_items_note`
    FOREIGN KEY (`note_id`)
    REFERENCES `notes` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

-- Tabel untuk Generator Surat (Template)
CREATE TABLE `letter_templates` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `is_pro` TINYINT NOT NULL DEFAULT 0,
  `status` ENUM('public', 'private') NOT NULL DEFAULT 'public',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `last_modified` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_letter_templates_user_idx` (`user_id` ASC),
  CONSTRAINT `fk_letter_templates_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

CREATE TABLE `template_fields` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `template_id` INT UNSIGNED NOT NULL,
  `field_id` VARCHAR(100) NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_template_fields_template_idx` (`template_id` ASC),
  UNIQUE INDEX `template_field_unique` (`template_id`, `field_id` ASC),
  CONSTRAINT `fk_template_fields_template`
    FOREIGN KEY (`template_id`)
    REFERENCES `letter_templates` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

-- Insert data awal untuk roles
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'superadmin', 'Super Administrator with all permissions'),
(2, 'admin', 'Administrator with limited permissions'),
(3, 'user', 'Regular user with basic permissions');

-- Insert data awal untuk permissions
INSERT INTO `permissions` (`id`, `name`, `description`) VALUES
(1, 'manage_users', 'Can create, read, update, delete users'),
(2, 'manage_roles', 'Can manage roles and permissions'),
(3, 'manage_settings', 'Can manage application settings'),
(4, 'view_admin_dashboard', 'Can view the admin dashboard');

-- Menetapkan izin ke peran
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(1, 1), -- superadmin can manage users
(1, 2), -- superadmin can manage roles
(1, 3), -- superadmin can manage settings
(1, 4), -- superadmin can view dashboard
(2, 1), -- admin can manage users
(2, 4); -- admin can view dashboard
