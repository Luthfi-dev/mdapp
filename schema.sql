
-- Roles Table: Defines the roles available in the system.
CREATE TABLE `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC));

-- Permissions Table: Defines specific permissions.
CREATE TABLE `permissions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC));

-- Users Table: Stores user information.
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone_number` VARCHAR(20) NULL,
  `role_id` INT UNSIGNED NOT NULL,
  `status` ENUM('active', 'deactivated', 'blocked') NOT NULL DEFAULT 'active',
  `referral_code` VARCHAR(10) NULL,
  `points` INT NOT NULL DEFAULT 0,
  `browser_fingerprint` VARCHAR(255) NULL,
  `avatar` TEXT NULL,
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

-- User_Roles Table: Maps users to roles (for many-to-many relationship).
CREATE TABLE `user_roles` (
  `user_id` INT UNSIGNED NOT NULL,
  `role_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  INDEX `fk_user_roles_roles1_idx` (`role_id` ASC),
  CONSTRAINT `fk_user_roles_users1`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_roles_roles1`
    FOREIGN KEY (`role_id`)
    REFERENCES `roles` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

-- Role_Permissions Table: Maps roles to permissions.
CREATE TABLE `role_permissions` (
  `role_id` INT UNSIGNED NOT NULL,
  `permission_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  INDEX `fk_role_permissions_permissions1_idx` (`permission_id` ASC),
  CONSTRAINT `fk_role_permissions_roles1`
    FOREIGN KEY (`role_id`)
    REFERENCES `roles` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_role_permissions_permissions1`
    FOREIGN KEY (`permission_id`)
    REFERENCES `permissions` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

-- SSO Domains Table: Manages allowed domains for SSO.
CREATE TABLE `sso_domains` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `domain` VARCHAR(255) NOT NULL,
  `is_active` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `domain_UNIQUE` (`domain` ASC));

-- Initial Data Seeding
INSERT INTO `roles` (`id`, `name`, `description`) VALUES (1, 'superadmin', 'Super Administrator with all privileges');
INSERT INTO `roles` (`id`, `name`, `description`) VALUES (2, 'admin', 'Administrator with limited privileges');
INSERT INTO `roles` (`id`, `name`, `description`) VALUES (3, 'user', 'Standard user with basic access');

-- Note_Groups Table: Stores information about collaborative note groups.
CREATE TABLE `note_groups` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `owner_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_note_groups_users_idx` (`owner_id` ASC),
  CONSTRAINT `fk_note_groups_users`
    FOREIGN KEY (`owner_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

-- Group_Members Table: Maps users to note groups.
CREATE TABLE `group_members` (
  `group_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `joined_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`group_id`, `user_id`),
  INDEX `fk_group_members_users_idx` (`user_id` ASC),
  CONSTRAINT `fk_group_members_note_groups`
    FOREIGN KEY (`group_id`)
    REFERENCES `note_groups` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_group_members_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

-- Group_Tasks Table: Stores tasks within a note group.
CREATE TABLE `group_tasks` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `group_id` INT UNSIGNED NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  `completed` TINYINT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_group_tasks_note_groups_idx` (`group_id` ASC),
  CONSTRAINT `fk_group_tasks_note_groups`
    FOREIGN KEY (`group_id`)
    REFERENCES `note_groups` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

-- Task_Assignees Table: Maps users to specific tasks in a group.
CREATE TABLE `task_assignees` (
  `task_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`task_id`, `user_id`),
  INDEX `fk_task_assignees_users_idx` (`user_id` ASC),
  CONSTRAINT `fk_task_assignees_group_tasks`
    FOREIGN KEY (`task_id`)
    REFERENCES `group_tasks` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_task_assignees_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

-- Notes Table: Stores personal notes for each user.
CREATE TABLE `notes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_notes_users_idx` (`user_id` ASC),
  CONSTRAINT `fk_notes_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

-- Note_Items Table: Stores checklist items for each personal note.
CREATE TABLE `note_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `note_id` INT UNSIGNED NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  `completed` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `fk_note_items_notes_idx` (`note_id` ASC),
  CONSTRAINT `fk_note_items_notes`
    FOREIGN KEY (`note_id`)
    REFERENCES `notes` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

-- Letter_Templates Table: Stores user-created letter templates.
CREATE TABLE `letter_templates` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `is_pro` TINYINT NOT NULL DEFAULT 0,
  `status` ENUM('public', 'private') NOT NULL DEFAULT 'public',
  `last_modified` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_letter_templates_users_idx` (`user_id` ASC),
  CONSTRAINT `fk_letter_templates_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

-- Template_Fields Table: Stores dynamic fields for each letter template.
CREATE TABLE `template_fields` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `template_id` INT UNSIGNED NOT NULL,
  `field_id` VARCHAR(100) NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_template_fields_letter_templates_idx` (`template_id` ASC),
  UNIQUE INDEX `template_field_id_UNIQUE` (`template_id` ASC, `field_id` ASC),
  CONSTRAINT `fk_template_fields_letter_templates`
    FOREIGN KEY (`template_id`)
    REFERENCES `letter_templates` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

-- Login_History Table: Stores login history for security purposes.
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

-- Referrals Table: Tracks referral relationships and statuses.
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
