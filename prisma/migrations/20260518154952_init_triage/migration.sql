-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_triage_case_types` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(10) NOT NULL,
    `nama_kasus` VARCHAR(100) NOT NULL,
    `deskripsi` TEXT NULL,
    `aktif` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `master_triage_case_types_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_triage_categories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(20) NOT NULL,
    `nama_kategori` VARCHAR(100) NOT NULL,
    `urutan` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `master_triage_categories_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_triage_rules` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kategori_id` BIGINT NOT NULL,
    `skala` INTEGER NOT NULL,
    `nama_rule` VARCHAR(150) NOT NULL,
    `deskripsi` TEXT NULL,
    `level_triase` ENUM('HIJAU', 'KUNING', 'MERAH', 'HITAM', 'ABU') NOT NULL,
    `prioritas` ENUM('SEGERA', 'DARURAT', 'URGENT', 'NON_URGENT') NOT NULL,
    `aktif` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `triage_assessments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `no_rawat` VARCHAR(30) NOT NULL,
    `no_rm` VARCHAR(30) NOT NULL,
    `nama_pasien` VARCHAR(150) NOT NULL,
    `tanggal_kunjungan` DATETIME(3) NOT NULL,
    `cara_masuk` ENUM('JALAN', 'BRANKAR', 'KURSI_RODA', 'DIGENDONG') NOT NULL,
    `transportasi` ENUM('AGD', 'SENDIRI', 'SWASTA', 'TIDAK_ADA') NOT NULL,
    `alasan_kedatangan` ENUM('DATANG_SENDIRI', 'POLISI', 'RUJUKAN', 'BIDAN', 'PUSKESMAS', 'RUMAH_SAKIT', 'POLIKLINIK', 'FASKES_LAIN', 'TIDAK_ADA') NOT NULL,
    `keterangan` TEXT NULL,
    `macam_kasus_id` BIGINT NULL,
    `keluhan_utama` TEXT NOT NULL,
    `suhu` DECIMAL(4, 1) NULL,
    `skala_nyeri` INTEGER NULL,
    `tekanan_darah_sistolik` INTEGER NULL,
    `tekanan_darah_diastolik` INTEGER NULL,
    `nadi_per_menit` INTEGER NULL,
    `saturasi_oksigen` DECIMAL(5, 2) NULL,
    `respirasi_per_menit` INTEGER NULL,
    `kebutuhan_khusus` ENUM('UPPA', 'AIRBORNE', 'DEKONTAMINAN', 'TIDAK_ADA') NULL,
    `tingkat_kesadaran` ENUM('COMPOS_MENTIS', 'APATIS', 'SOMNOLEN', 'SOPOR', 'KOMA') NULL,
    `status_jalan_nafas` ENUM('BEBAS', 'OBSTRUKSI_PARSIAL', 'OBSTRUKSI_TOTAL') NULL,
    `gcs_e` INTEGER NULL,
    `gcs_v` INTEGER NULL,
    `gcs_m` INTEGER NULL,
    `total_gcs` INTEGER NULL,
    `sumbatan_jalan_nafas` BOOLEAN NOT NULL DEFAULT false,
    `sesak_nafas` BOOLEAN NOT NULL DEFAULT false,
    `apnea` BOOLEAN NOT NULL DEFAULT false,
    `syok` BOOLEAN NOT NULL DEFAULT false,
    `perdarahan` BOOLEAN NOT NULL DEFAULT false,
    `kejang` BOOLEAN NOT NULL DEFAULT false,
    `penurunan_kesadaran` BOOLEAN NOT NULL DEFAULT false,
    `perilaku_agresif` BOOLEAN NOT NULL DEFAULT false,
    `risiko_bunuh_diri` BOOLEAN NOT NULL DEFAULT false,
    `doa` BOOLEAN NOT NULL DEFAULT false,
    `nyeri_melahirkan` BOOLEAN NOT NULL DEFAULT false,
    `level_triase` ENUM('HIJAU', 'KUNING', 'MERAH', 'HITAM', 'ABU') NULL,
    `prioritas_triase` ENUM('SEGERA', 'DARURAT', 'URGENT', 'NON_URGENT') NULL,
    `alasan_triase` TEXT NULL,
    `perawat_triase_id` BIGINT NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,
    `waktu_assessment` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `triage_assessments_no_rawat_idx`(`no_rawat`),
    INDEX `triage_assessments_no_rm_idx`(`no_rm`),
    INDEX `triage_assessments_tanggal_kunjungan_idx`(`tanggal_kunjungan`),
    INDEX `triage_assessments_level_triase_idx`(`level_triase`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `triage_assessment_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `triage_assessment_id` BIGINT NOT NULL,
    `master_triage_rule_id` BIGINT NOT NULL,
    `catatan` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `master_triage_rules` ADD CONSTRAINT `master_triage_rules_kategori_id_fkey` FOREIGN KEY (`kategori_id`) REFERENCES `master_triage_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `triage_assessments` ADD CONSTRAINT `triage_assessments_macam_kasus_id_fkey` FOREIGN KEY (`macam_kasus_id`) REFERENCES `master_triage_case_types`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `triage_assessment_items` ADD CONSTRAINT `triage_assessment_items_triage_assessment_id_fkey` FOREIGN KEY (`triage_assessment_id`) REFERENCES `triage_assessments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `triage_assessment_items` ADD CONSTRAINT `triage_assessment_items_master_triage_rule_id_fkey` FOREIGN KEY (`master_triage_rule_id`) REFERENCES `master_triage_rules`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
