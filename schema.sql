
-- Roles Table: Defines the roles available in the system.
CREATE TABLE `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` TEXT
);

-- Default Roles
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'superadmin', 'Has all permissions and can manage admins.'),
(2, 'admin', 'Can manage specific parts of the application.'),
(3, 'user', 'Default role for registered users.');

-- Users Table: Stores user information.
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone_number` VARCHAR(20) NULL,
  `avatar_url` VARCHAR(255) NULL,
  `points` INT DEFAULT 0,
  `referral_code` VARCHAR(10) UNIQUE,
  `referred_by_id` INT NULL,
  `role_id` INT NOT NULL DEFAULT 3,
  `status` ENUM('active', 'deactivated', 'blocked') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`),
  FOREIGN KEY (`referred_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- User_Roles Table: Maps users to roles (supports multiple roles per user).
CREATE TABLE `user_roles` (
  `user_id` INT NOT NULL,
  `role_id` INT NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE
);

-- Permissions Table: Defines specific actions that can be controlled.
CREATE TABLE `permissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT
);

-- Example Permissions
INSERT INTO `permissions` (`name`, `description`) VALUES
('manage_users', 'Can create, edit, and delete users.'),
('manage_roles', 'Can create, edit, and delete roles and their permissions.'),
('view_admin_dashboard', 'Can access the admin dashboard.'),
('manage_app_settings', 'Can change application settings.'),
('manage_sso_domains', 'Can manage allowed domains for SSO.');

-- Role_Permissions Table: Maps roles to permissions.
CREATE TABLE `role_permissions` (
  `role_id` INT NOT NULL,
  `permission_id` INT NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
);

-- Default Superadmin Permissions
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5);

-- SSO Domains Table: Whitelisted domains for Single Sign-On.
CREATE TABLE `sso_domains` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `domain` VARCHAR(255) NOT NULL UNIQUE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes Table (For "Catatan Cerdas" personal notes)
CREATE TABLE `notes` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `note_items` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `note_id` VARCHAR(255) NOT NULL,
    `label` TEXT NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON DELETE CASCADE
);

-- Note Groups (For "Catatan Cerdas" group notes)
CREATE TABLE `note_groups` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `created_by` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`)
);

CREATE TABLE `group_members` (
    `group_id` VARCHAR(255) NOT NULL,
    `user_id` INT NOT NULL,
    PRIMARY KEY (`group_id`, `user_id`),
    FOREIGN KEY (`group_id`) REFERENCES `note_groups`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `group_tasks` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `group_id` VARCHAR(255) NOT NULL,
    `label` TEXT NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_by` INT NOT NULL,
    FOREIGN KEY (`group_id`) REFERENCES `note_groups`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`)
);

CREATE TABLE `task_assignees` (
    `task_id` VARCHAR(255) NOT NULL,
    `user_id` INT NOT NULL,
    PRIMARY KEY (`task_id`, `user_id`),
    FOREIGN KEY (`task_id`) REFERENCES `group_tasks`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);


-- Letter Templates (For "Generator Surat")
CREATE TABLE `letter_templates` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `is_pro` BOOLEAN NOT NULL DEFAULT FALSE,
    `status` ENUM('public', 'private') NOT NULL DEFAULT 'public',
    `last_modified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `template_fields` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `template_id` VARCHAR(255) NOT NULL,
    `field_id` VARCHAR(100) NOT NULL,
    `label` VARCHAR(255) NOT NULL,
    FOREIGN KEY (`template_id`) REFERENCES `letter_templates`(`id`) ON DELETE CASCADE
);

-- Notifications Table
CREATE TABLE `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
