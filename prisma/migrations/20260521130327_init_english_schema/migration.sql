-- CreateTable
CREATE TABLE `master_triage_case_types` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(10) NOT NULL,
    `case_name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `master_triage_case_types_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_triage_categories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL,
    `category_name` VARCHAR(100) NOT NULL,
    `sort_order` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `master_triage_categories_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_triage_rules` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `category_id` BIGINT NOT NULL,
    `scale` INTEGER NOT NULL,
    `rule_name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `triage_level` ENUM('RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE', 'WHITE', 'BLACK') NOT NULL,
    `priority` ENUM('IMMEDIATE', 'EMERGENCY', 'URGENT', 'SEMI_URGENT', 'NON_URGENT') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `triage_assessments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `visit_number` VARCHAR(30) NOT NULL,
    `medical_record_number` VARCHAR(30) NOT NULL,
    `patient_name` VARCHAR(150) NOT NULL,
    `visit_date` DATETIME(3) NOT NULL,
    `arrival_method` ENUM('WALK_IN', 'STRETCHER', 'WHEELCHAIR', 'CARRIED') NOT NULL,
    `transportation` ENUM('AMBULANCE', 'SELF', 'PRIVATE', 'NONE') NOT NULL,
    `arrival_reason` ENUM('SELF_ARRIVAL', 'POLICE', 'REFERRAL', 'NONE') NOT NULL,
    `notes` TEXT NULL,
    `case_type_id` BIGINT NULL,
    `chief_complaint` TEXT NOT NULL,
    `temperature` DECIMAL(4, 1) NULL,
    `pain_scale` INTEGER NULL,
    `systolic_blood_pressure` INTEGER NULL,
    `diastolic_blood_pressure` INTEGER NULL,
    `heart_rate` INTEGER NULL,
    `oxygen_saturation` DECIMAL(5, 2) NULL,
    `respiratory_rate` INTEGER NULL,
    `consciousness_level` ENUM('COMPOS_MENTIS', 'APATHY', 'SOMNOLENCE', 'DELIRIUM', 'STUPOR', 'COMA') NULL,
    `airway_status` ENUM('CLEAR', 'PARTIAL_OBSTRUCTION', 'TOTAL_OBSTRUCTION') NULL,
    `gcs_e` INTEGER NULL,
    `gcs_v` INTEGER NULL,
    `gcs_m` INTEGER NULL,
    `total_gcs` INTEGER NULL,
    `doa` BOOLEAN NOT NULL DEFAULT false,
    `triage_level` ENUM('RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE', 'WHITE', 'BLACK') NULL,
    `triage_priority` ENUM('IMMEDIATE', 'EMERGENCY', 'URGENT', 'SEMI_URGENT', 'NON_URGENT') NULL,
    `assessment_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `triage_assessments_visit_number_idx`(`visit_number`),
    INDEX `triage_assessments_medical_record_number_idx`(`medical_record_number`),
    INDEX `triage_assessments_visit_date_idx`(`visit_date`),
    INDEX `triage_assessments_triage_level_idx`(`triage_level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `triage_assessment_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `triage_assessment_id` BIGINT NOT NULL,
    `master_triage_rule_id` BIGINT NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `master_triage_rules` ADD CONSTRAINT `master_triage_rules_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `master_triage_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `triage_assessments` ADD CONSTRAINT `triage_assessments_case_type_id_fkey` FOREIGN KEY (`case_type_id`) REFERENCES `master_triage_case_types`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `triage_assessment_items` ADD CONSTRAINT `triage_assessment_items_triage_assessment_id_fkey` FOREIGN KEY (`triage_assessment_id`) REFERENCES `triage_assessments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `triage_assessment_items` ADD CONSTRAINT `triage_assessment_items_master_triage_rule_id_fkey` FOREIGN KEY (`master_triage_rule_id`) REFERENCES `master_triage_rules`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
